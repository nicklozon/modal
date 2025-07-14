<script>
    import { modalPropNames, useModalStack } from './modalStack.svelte.js'
    import { only, rejectNullValues } from './helpers.js'
    import { getConfig } from './config.js'
    import { setContext } from 'svelte'

    let {
        href,
        method = 'get',
        data = {},
        as = 'a',
        headers = {},
        queryStringArrayFormat = 'brackets',
        navigate = null,
        onafterleave = null,
        onblur = null,
        onclose = null,
        onerror = null,
        onfocus = null,
        onstart = null,
        onsuccess = null,
        // Modal configuration props (passthrough to Modal)
        closeButton = null,
        closeExplicitly = null,
        maxWidth = null,
        paddingClasses = null,
        panelClasses = null,
        position = null,
        slideover = null,
        children,
        ...restProps
    } = $props()

    let loading = $state(false)
    let modalContext = $state(null)
    let unsubscribeEventListeners = null
    let isBlurred = $derived(!modalContext?.onTopOfStack)

    const modalStack = useModalStack()

    $effect(() => setContext('modalContext', modalContext))

    let shouldNavigate = $derived(navigate ?? getConfig('navigate'))

    // Watch for focus/blur changes
    $effect(() => {
        if (modalContext) {
            if (modalContext.onTopOfStack && isBlurred) {
                onfocus?.()
            } else if (!modalContext.onTopOfStack && !isBlurred) {
                onblur?.()
            }
        }
    })

    function handleClose() {
        onclose?.()
    }

    function handleAfterLeave() {
        modalContext = null
        onafterleave?.()
    }

    function registerEventListeners() {
        if (modalContext) {
            unsubscribeEventListeners = modalContext.registerEventListenersFromProps(restProps)
        }
    }

    async function handle(e) {
        e?.preventDefault()
        if (loading) return

        if (!href.startsWith('#')) {
            loading = true
            onstart?.()
        }

        try {
            const allProps = {
                closeButton,
                closeExplicitly,
                maxWidth,
                paddingClasses,
                panelClasses,
                position,
                slideover,
                ...restProps,
            }

            const newModalContext = await modalStack.visit(
                href,
                method,
                data,
                headers,
                rejectNullValues(only(allProps, modalPropNames)),
                handleClose,
                handleAfterLeave,
                queryStringArrayFormat,
                shouldNavigate,
            )

            modalContext = newModalContext
            registerEventListeners()
            onsuccess?.()
        } catch (error) {
            console.error(error)
            onerror?.(error)
        } finally {
            loading = false
        }
    }

    // Cleanup event listeners on destroy
    import { onDestroy } from 'svelte'
    onDestroy(() => {
        unsubscribeEventListeners?.()
    })

    // Filter out modal-specific props and event handlers for the component
    let componentProps = $derived.by(() => {
        const filtered = {}
        Object.keys(restProps).forEach((key) => {
            if (modalPropNames.includes(key)) return
            if (key.startsWith('on') && typeof restProps[key] === 'function') return
            if (['href', 'method', 'data', 'as', 'headers', 'queryStringArrayFormat', 'navigate'].includes(key)) return

            filtered[key] = restProps[key]
        })
        return filtered
    })
</script>

<svelte:element
    this={as}
    {href}
    {...componentProps}
    onclick={handle}
>
    {@render children?.({ loading })}
</svelte:element>
