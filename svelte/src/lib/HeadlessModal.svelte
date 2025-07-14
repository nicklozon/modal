<script>
    import { getConfig as getConfigOuter, getConfigByType } from './config.js'
    import { getContext, onMount, onDestroy } from 'svelte'
    import { useModalStack } from './modalStack.svelte.js'
    import ModalRenderer from './ModalRenderer.svelte'

    let {
        name = null,
        slideover = null,
        closeButton = null,
        closeExplicitly = null,
        maxWidth = null,
        paddingClasses = null,
        panelClasses = null,
        position = null,
        modalSlot,
        onfocus,
        onblur,
        onclose,
        onsuccess,
        ...restProps
    } = $props()

    const modalStack = useModalStack()
    let localModalContext = $state(null)
    let unsubscribeEventListeners = null
    let rendered = $state(false)

    const modalContext = $derived(name ? localModalContext : getContext('modalContext'))

    let config = $derived.by(() => {
        const ctx = name ? localModalContext : modalContext
        const isSlideover = ctx?.config?.slideover ?? slideover ?? getConfigOuter('type') === 'slideover'

        return {
            slideover: isSlideover,
            closeButton: closeButton ?? getConfigByType(isSlideover, 'closeButton'),
            closeExplicitly: closeExplicitly ?? getConfigByType(isSlideover, 'closeExplicitly'),
            maxWidth: maxWidth ?? getConfigByType(isSlideover, 'maxWidth'),
            paddingClasses: paddingClasses ?? getConfigByType(isSlideover, 'paddingClasses'),
            panelClasses: panelClasses ?? getConfigByType(isSlideover, 'panelClasses'),
            position: position ?? getConfigByType(isSlideover, 'position'),
            ...(ctx?.config || {}),
        }
    })

    let nextIndex = $derived.by(() => {
        const ctx = name ? localModalContext : modalContext
        if (!ctx) return null
        return modalStack.stack.find((m) => m.shouldRender && m.index > ctx.index)?.index
    })

    let currentModalContext = $derived(name ? localModalContext : modalContext)

    // Handle local modals
    onMount(() => {
        if (name) {
            modalStack.registerLocalModal(name, (context) => {
                localModalContext = context
                unsubscribeEventListeners = context.registerEventListenersFromProps(restProps)
            })
        } else if (currentModalContext) {
            unsubscribeEventListeners = currentModalContext.registerEventListenersFromProps(restProps)
        }
    })

    onDestroy(() => {
        if (name) {
            modalStack.removeLocalModal(name)
        }
        unsubscribeEventListeners?.()
    })

    // Watch for focus/blur events
    let previousOnTopOfStack = $state(false)
    $effect(() => {
        const ctx = currentModalContext
        if (ctx && rendered) {
            const onTopOfStack = ctx.onTopOfStack
            if (onTopOfStack && !previousOnTopOfStack) {
                onfocus?.()
            } else if (!onTopOfStack && previousOnTopOfStack) {
                onblur?.()
            }
            previousOnTopOfStack = onTopOfStack
        }
        if (ctx) {
            rendered = true
        }
    })

    // Watch for open/close events
    let previousIsOpen = $state(false)
    $effect(() => {
        const ctx = currentModalContext
        if (ctx) {
            const isOpen = ctx.isOpen
            if (isOpen !== previousIsOpen) {
                if (isOpen) {
                    onsuccess?.()
                } else {
                    onclose?.()
                }
                previousIsOpen = isOpen
            }
        }
    })

    // Expose methods
    export function afterLeave() {
        return currentModalContext?.afterLeave()
    }

    export function close() {
        return currentModalContext?.close()
    }

    export function emit(...args) {
        return currentModalContext?.emit(...args)
    }

    export function getChildModal() {
        return currentModalContext?.getChildModal()
    }

    export function getParentModal() {
        return currentModalContext?.getParentModal()
    }

    export function reload(...args) {
        return currentModalContext?.reload(...args)
    }

    export function setOpen(...args) {
        return currentModalContext?.setOpen(...args)
    }

    export function getId() {
        return currentModalContext?.id
    }

    export function getIndex() {
        return currentModalContext?.index
    }

    export function getIsOpen() {
        return currentModalContext?.isOpen
    }

    export function getConfig() {
        return config
    }

    export function getModalContext() {
        return currentModalContext
    }

    export function getOnTopOfStack() {
        return currentModalContext?.onTopOfStack || false
    }

    export function getShouldRender() {
        return currentModalContext?.shouldRender
    }
</script>

{#if currentModalContext?.shouldRender}
    {@render modalSlot({
        afterLeave: currentModalContext.afterLeave,
        close: currentModalContext.close,
        config,
        emit: currentModalContext.emit,
        getChildModal: currentModalContext.getChildModal,
        getParentModal: currentModalContext.getParentModal,
        id: currentModalContext.id,
        index: currentModalContext.index,
        isOpen: currentModalContext.isOpen,
        modalContext: currentModalContext,
        onTopOfStack: currentModalContext.onTopOfStack,
        reload: currentModalContext.reload,
        setOpen: currentModalContext.setOpen,
        shouldRender: currentModalContext.shouldRender
    })}

    <!-- The next modal in the stack -->
    {#if nextIndex}
        <ModalRenderer index={nextIndex} />
    {/if}
{/if}
