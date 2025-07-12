<script>
    import { getConfig, getConfigByType } from './config.js'
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
        children,
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

    const modalContext = $derived(() => (name ? localModalContext : getContext('modal')))

    let config = $derived(() => {
        const ctx = name ? localModalContext : modalContext
        const isSlideover = ctx?.config?.slideover ?? slideover ?? getConfig('type') === 'slideover'

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

    let nextIndex = $derived(() => {
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
    function afterLeave() {
        return currentModalContext?.afterLeave()
    }

    function close() {
        return currentModalContext?.close()
    }

    function emit(...args) {
        return currentModalContext?.emit(...args)
    }

    function getChildModal() {
        return currentModalContext?.getChildModal()
    }

    function getParentModal() {
        return currentModalContext?.getParentModal()
    }

    function reload(...args) {
        return currentModalContext?.reload(...args)
    }

    function setOpen(...args) {
        return currentModalContext?.setOpen(...args)
    }

    function getId() {
        return currentModalContext?.id
    }

    function getIndex() {
        return currentModalContext?.index
    }

    function getIsOpen() {
        return currentModalContext?.isOpen
    }

    //function getConfig() {
    //    return config
    //}

    function getModalContext() {
        return currentModalContext
    }

    function getOnTopOfStack() {
        return currentModalContext?.onTopOfStack || false
    }

    function getShouldRender() {
        return currentModalContext?.shouldRender
    }
</script>

{#if currentModalContext?.shouldRender}
    {@render children?.({
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
        shouldRender: currentModalContext.shouldRender,
    })}

    <!-- The next modal in the stack -->
    {#if nextIndex}
        <ModalRenderer index={nextIndex} />
    {/if}
{/if}
