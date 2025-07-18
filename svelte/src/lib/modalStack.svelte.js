import { generateId, except, kebabCase } from './helpers'
import { router } from '@inertiajs/svelte'
import { mergeDataIntoQueryString } from '@inertiajs/core'
import { default as Axios } from 'axios'
import { getConfig } from './config'
import { mount } from 'svelte'
import ModalRoot from './ModalRoot.svelte'

let pageVersion = null
let resolveComponent = null

// Svelte 5 reactive state
let stack = $state([])
let localModals = $state({})
let pendingModalUpdates = $state({})
let baseUrl = $state(null)
let baseModalsToWaitFor = $state({})

const setComponentResolver = (resolver) => {
    console.log('setComponentResolver called')
    resolveComponent = resolver
}

export const initFromPageProps = (pageProps) => {
    console.log('initFromPageProps called')
    if (pageProps.initialPage) {
        pageVersion = pageProps.initialPage.version
    }

    if (pageProps.resolveComponent) {
        resolveComponent = pageProps.resolveComponent
    }
}

class Modal {
    constructor(component, response, config, onClose, afterLeave) {
        this.id = response.id ?? generateId()
        this.isOpen = $state(false)
        this.shouldRender = $state(false)
        this.listeners = {}

        this.component = component
        this.props = $state(response.props)
        this.response = response
        this.config = config ?? {}
        this.onCloseCallback = onClose
        this.afterLeaveCallback = afterLeave

        if (pendingModalUpdates[this.id]) {
            this.config = {
                ...this.config,
                ...(pendingModalUpdates[this.id].config ?? {}),
            }

            const pendingOnClose = pendingModalUpdates[this.id].onClose
            const pendingOnAfterLeave = pendingModalUpdates[this.id].onAfterLeave

            if (pendingOnClose) {
                this.onCloseCallback = onClose
                    ? () => {
                          onClose()
                          pendingOnClose()
                      }
                    : pendingOnClose
            }

            if (pendingOnAfterLeave) {
                this.afterLeaveCallback = afterLeave
                    ? () => {
                          afterLeave()
                          pendingOnAfterLeave()
                      }
                    : pendingOnAfterLeave
            }

            delete pendingModalUpdates[this.id]
        }

        // Computed properties using $derived
        this.index = $derived(stack.findIndex((m) => m.id === this.id))
        this.onTopOfStack = $derived.by(() => {
            if (stack.length < 2) {
                return true
            }

            const modals = stack.map((modal) => ({ id: modal.id, shouldRender: modal.shouldRender }))
            return modals.reverse().find((modal) => modal.shouldRender)?.id === this.id
        })
    }

    getParentModal = () => {
        console.log('getParentModal called on modal:', this.name || this.id)
        const index = this.index

        if (index < 1) {
            // This is the first modal in the stack
            return null
        }

        // Find the first open modal before this one
        return stack
            .slice(0, index)
            .reverse()
            .find((modal) => modal.isOpen)
    }

    getChildModal = () => {
        console.log('getChildModal called on modal:', this.name || this.id)
        const index = this.index

        if (index === stack.length - 1) {
            // This is the last modal in the stack
            return null
        }

        // Find the first open modal after this one
        return stack.slice(index + 1).find((modal) => modal.isOpen)
    }

    show = () => {
        console.log('show called on modal:', this.name || this.id)
        const index = this.index

        if (index > -1) {
            if (stack[index].isOpen) {
                // Only open if the modal is closed
                return
            }

            stack[index].isOpen = true
            stack[index].shouldRender = true
        }
    }

    close = () => {
        console.log('close called on modal:', this.name || this.id)
        const index = this.index

        if (index > -1) {
            if (!stack[index].isOpen) {
                // Only close if the modal is open
                return
            }

            Object.keys(this.listeners).forEach((event) => {
                this.off(event)
            })

            stack[index].isOpen = false
            this.onCloseCallback?.()
            this.onCloseCallback = null
        }
    }

    setOpen = (open) => {
        console.log('setOpen called on modal:', this.name || this.id)
        open ? this.show() : this.close()
    }

    afterLeave = () => {
        console.log('afterLeave called on modal:', this.name || this.id)
        const index = this.index

        if (index > -1) {
            if (stack[index].isOpen) {
                // Only execute the callback if the modal is closed
                return
            }

            stack[index].shouldRender = false
            this.afterLeaveCallback?.()
            this.afterLeaveCallback = null
        }

        if (index === 0) {
            console.log('RESETTING STACK')
            stack.length = 0 // https://svelte.dev/docs/svelte/$state#Passing-state-across-modules
        }
    }

    on = (event, callback) => {
        console.log('modalStack on', 'event:', event)
        event = kebabCase(event)
        this.listeners[event] = this.listeners[event] ?? []
        this.listeners[event].push(callback)
    }

    off = (event, callback) => {
        console.log('off called on modal:', this.name || this.id, 'event:', event)
        event = kebabCase(event)
        if (callback) {
            this.listeners[event] = this.listeners[event]?.filter((cb) => cb !== callback) ?? []
        } else {
            delete this.listeners[event]
        }
    }

    emit = (event, ...args) => {
        console.log('emit called on modal:', this.name || this.id, 'event:', event, 'args:', args)
        console.log(this.listeners)
        this.listeners[kebabCase(event)]?.forEach((callback) => callback(...args))
    }

    registerEventListenersFromProps = (props) => {
        console.log('registerEventListenersFromProps called on modal:', this.name || this.id)
        const unsubscribers = []

        Object.keys(props)
            .filter((key) => key.startsWith('on-'))
            .forEach((key) => {
                // e.g. onRefreshKey -> refresh-key
                const eventName = kebabCase(key).replace(/^on-/, '')
                this.on(eventName, props[key])
                unsubscribers.push(() => this.off(eventName, props[key]))
            })

        return () => unsubscribers.forEach((unsub) => unsub())
    }

    reload = (options = {}) => {
        console.log('reload called on modal:', this.name || this.id)
        let keys = Object.keys(this.response.props)

        if (options.only) {
            keys = options.only
        }

        if (options.except) {
            keys = except(keys, options.except)
        }

        if (!this.response?.url) {
            return
        }

        const method = (options.method ?? 'get').toLowerCase()
        const data = options.data ?? {}

        options.onStart?.()

        Axios({
            url: this.response.url,
            method,
            data: method === 'get' ? {} : data,
            params: method === 'get' ? data : {},
            headers: {
                ...(options.headers ?? {}),
                Accept: 'text/html, application/xhtml+xml',
                'X-Inertia': true,
                'X-Inertia-Partial-Component': this.response.component,
                'X-Inertia-Version': this.response.version,
                'X-Inertia-Partial-Data': keys.join(','),
                'X-InertiaUI-Modal': generateId(),
                'X-InertiaUI-Modal-Use-Router': 0,
                'X-InertiaUI-Modal-Base-Url': baseUrl,
            },
        })
            .then((response) => {
                this.updateProps(response.data.props)
                options.onSuccess?.(response)
            })
            .catch((error) => {
                options.onError?.(error)
            })
            .finally(() => {
                options.onFinish?.()
            })
    }

    updateProps = (props) => {
        console.log('updateProps called on modal:', this.name || this.id)
        Object.assign(this.props, props)
    }
}

function registerLocalModal(name, callback) {
    console.log('registerLocalModal called')
    localModals[name] = { name, callback }
}

function pushLocalModal(name, config, onClose, afterLeave) {
    console.log('pushLocalModal called')
    if (!localModals[name]) {
        throw new Error(`The local modal "${name}" has not been registered.`)
    }

    const modal = push(null, {}, config, onClose, afterLeave)
    modal.name = name
    localModals[name].callback(modal)
    return modal
}

function pushFromResponseData(responseData, config = {}, onClose = null, onAfterLeave = null) {
    console.log('pushFromResponseData called')
    return resolveComponent(responseData.component).then((component) => push(component, responseData, config, onClose, onAfterLeave))
}

function loadDeferredProps(modal) {
    console.log('loadDeferredProps called')
    const deferred = modal.response?.meta?.deferredProps

    if (!deferred) {
        return
    }

    Object.keys(deferred).forEach((key) => {
        modal.reload({ only: deferred[key] })
    })
}

function push(component, response, config, onClose, afterLeave) {
    console.log('push called')
    const newModal = new Modal(component, response, config, onClose, afterLeave)
    stack.push(newModal)
    loadDeferredProps(newModal)

    // Use setTimeout to ensure the modal is added to the stack before showing
    setTimeout(() => newModal.show(), 0)

    return newModal
}

function visit(
    href,
    method,
    payload = {},
    headers = {},
    config = {},
    onClose = null,
    onAfterLeave = null,
    queryStringArrayFormat = 'brackets',
    useBrowserHistory = false,
) {
    console.log('visit called')
    const modalId = generateId()

    return new Promise((resolve, reject) => {
        if (href.startsWith('#')) {
            resolve(pushLocalModal(href.substring(1), config, onClose, onAfterLeave))
            return
        }

        const [url, data] = mergeDataIntoQueryString(method, href || '', payload, queryStringArrayFormat)

        let useInertiaRouter = useBrowserHistory && stack.length === 0

        if (stack.length === 0) {
            baseUrl = typeof window !== 'undefined' ? window.location.href : ''
        }

        headers = {
            ...headers,
            Accept: 'text/html, application/xhtml+xml',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Inertia': true,
            'X-Inertia-Version': pageVersion,
            'X-InertiaUI-Modal': modalId,
            'X-InertiaUI-Modal-Use-Router': useInertiaRouter ? 1 : 0,
            'X-InertiaUI-Modal-Base-Url': baseUrl,
        }

        if (useInertiaRouter) {
            baseModalsToWaitFor = {}

            pendingModalUpdates[modalId] = {
                config,
                onClose,
                onAfterLeave,
            }

            // Pushing the modal to the stack will be handled by the ModalRoot...
            return router.visit(url, {
                method,
                data,
                headers,
                preserveScroll: true,
                preserveState: true,
                onError: reject,
                onBefore: () => {
                    baseModalsToWaitFor[modalId] = resolve
                },
            })
        }

        Axios({ url, method, data, headers })
            .then((response) => resolve(pushFromResponseData(response.data, config, onClose, onAfterLeave)))
            .catch(reject)
    })
}

function visitModal(url, options = {}) {
    console.log('visitModal called')
    return visit(
        url,
        options.method ?? 'get',
        options.data ?? {},
        options.headers ?? {},
        options.config ?? {},
        options.onClose,
        options.onAfterLeave,
        options.queryStringArrayFormat ?? 'brackets',
        options.navigate ?? getConfig('navigate'),
    ).then((modal) => {
        const listeners = options.listeners ?? {}

        Object.keys(listeners).forEach((event) => {
            // e.g. refreshKey -> refresh-key
            const eventName = kebabCase(event)
            modal.on(eventName, listeners[event])
        })

        return modal
    })
}

export const modalPropNames = ['closeButton', 'closeExplicitly', 'maxWidth', 'paddingClasses', 'panelClasses', 'position', 'slideover']

export const renderApp = (el, App, pageProps) => {
    console.log('renderApp called')
    initFromPageProps(pageProps)

    mount(ModalRoot, { target: el, props: { ...pageProps, App } })
}


export function useModalStack() {
    console.log('useModalStack called')
    return {
        setComponentResolver,
        getBaseUrl: () => baseUrl,
        setBaseUrl: (url) => (baseUrl = url),
        stack: stack,
        localModals: localModals,
        push,
        pushFromResponseData,
        length: () => stack.length,
        closeAll: () => [...stack].reverse().forEach((modal) => modal.close()),
        reset: () => (stack.length = 0),
        visit,
        visitModal,
        registerLocalModal,
        removeLocalModal: (name) => {
            const newLocalModals = { ...localModals }
            delete newLocalModals[name]
            // NL: this will break since it's a direct assignment
            // maybe make localModals a getter above, unless reactivity is necessary
            localModals = newLocalModals
        },
        onModalOnBase: (modalOnBase) => {
            const resolve = baseModalsToWaitFor[modalOnBase.id]

            if (resolve) {
                resolve(modalOnBase)
                delete baseModalsToWaitFor[modalOnBase.id]
            }
        },
    }
}
