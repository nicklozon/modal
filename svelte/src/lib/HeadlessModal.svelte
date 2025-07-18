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
    $effect(() => console.log(modalStack.stack.length))
    let localModalContext = $state(null)
    let unsubscribeEventListeners = null
    let rendered = $state(false)

    const modalContext = $derived(name ? localModalContext : getContext('modalContext'))
    $effect(() => console.log('modalContext changed', modalContext))

    let config = $derived.by(() => {
        const isSlideover = modalContext?.config?.slideover ?? slideover ?? getConfigOuter('type') === 'slideover'

        return {
            slideover: isSlideover,
            closeButton: closeButton ?? getConfigByType(isSlideover, 'closeButton'),
            closeExplicitly: closeExplicitly ?? getConfigByType(isSlideover, 'closeExplicitly'),
            maxWidth: maxWidth ?? getConfigByType(isSlideover, 'maxWidth'),
            paddingClasses: paddingClasses ?? getConfigByType(isSlideover, 'paddingClasses'),
            panelClasses: panelClasses ?? getConfigByType(isSlideover, 'panelClasses'),
            position: position ?? getConfigByType(isSlideover, 'position'),
            ...(modalContext?.config || {}),
        }
    })

    let nextIndex = $derived.by(() => {
        if (!modalContext) return null
        return modalStack.stack.find((m) => m.shouldRender && m.index > modalContext.index)?.index
    })

    // Handle local modals
    onMount(() => {
        console.log('HeadlessModal.svelte - onMount')
        if (name) {
            modalStack.registerLocalModal(name, (context) => {
                localModalContext = context
                unsubscribeEventListeners = context.registerEventListenersFromProps(restProps)
            })
        } else if (modalContext) {
            unsubscribeEventListeners = modalContext.registerEventListenersFromProps(restProps)
        }
    })

    onDestroy(() => {
        console.log('HeadlessModal.svelte - onDestroy')
        if (name) {
            modalStack.removeLocalModal(name)
        }
        unsubscribeEventListeners?.()
    })

    // Watch for focus/blur events
    let previousOnTopOfStack = false
    $effect(() => {
        const onTopOfStack = modalContext.onTopOfStack
        if (onTopOfStack && !previousOnTopOfStack) {
            onfocus?.()
        } else if (!onTopOfStack && previousOnTopOfStack) {
            onblur?.()
        }
        previousOnTopOfStack = onTopOfStack
    })

    $effect(() => {
        if (modalContext.isOpen) {
            console.log('OPEN')
            onsuccess?.()
        } else {
            console.log('CLOSE')
            onclose?.()
        }
    })

    // Expose methods
    export function afterLeave() {
        console.log('HeadlessModal afterLeave', modalContext)
        return modalContext?.afterLeave()
    }

    export function close() {
        console.log('closing', modalContext)
        return modalContext?.close()
    }

    export function emit(...args) {
        return modalContext?.emit(...args)
    }

    export function getChildModal() {
        return modalContext?.getChildModal()
    }

    export function getParentModal() {
        return modalContext?.getParentModal()
    }

    export function reload(...args) {
        return modalContext?.reload(...args)
    }

    export function setOpen(...args) {
        return modalContext?.setOpen(...args)
    }

    export function getId() {
        return modalContext?.id
    }

    export function getIndex() {
        return modalContext?.index
    }

    export function getIsOpen() {
        return modalContext?.isOpen
    }

    export function getConfig() {
        return config
    }

    export function getModalContext() {
        return modalContext
    }

    export function getOnTopOfStack() {
        return modalContext?.onTopOfStack || false
    }

    export function getShouldRender() {
        return modalContext?.shouldRender
    }
</script>

{#if modalContext?.shouldRender}
    {@render modalSlot({
        afterLeave: modalContext.afterLeave,
        close: modalContext.close,
        config,
        emit: modalContext.emit,
        getChildModal: modalContext.getChildModal,
        getParentModal: modalContext.getParentModal,
        id: modalContext.id,
        index: modalContext.index,
        isOpen: modalContext.isOpen,
        modalContext: modalContext,
        onTopOfStack: modalContext.onTopOfStack,
        reload: modalContext.reload,
        setOpen: modalContext.setOpen,
        shouldRender: modalContext.shouldRender
    })}

    <!-- The next modal in the stack -->
    {#if nextIndex}
        <ModalRenderer index={nextIndex} />
    {/if}
{/if}
