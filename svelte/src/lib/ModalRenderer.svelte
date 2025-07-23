<script>
    import { useModalStack } from './modalStack.svelte.js'
    import { setContext, onMount, onDestroy } from 'svelte'

    let { index } = $props()

    const modalStack = useModalStack()

    let modalContext = $state(modalStack.stack[index])
    setContext('modalContext', modalContext)

    $effect(() => {
        modalContext = modalStack.stack[index]
    })

    $effect(() => {
        setContext('modalContext', modalContext)
    })

    // NL: had to specify .default to make this work...
    let Page = $derived(modalContext?.component?.default)


    // NL: events are using kebab case, maybe camel back would be better? Check what react does
    function handleModalEvent(event, ...args) {
        modalContext?.emit(event.type, ...args)
    }

    // NL: There doesn't seem to be a way to infer what props a svelte component expects
    // So we just pass everything through
    // {...only(modalContext.props || {}, modalContext.getComponentPropKeys(), true)}
</script>

{#if Page}
    <Page
        {...modalContext.props}
        on-modal-event={handleModalEvent}
    />
{/if}
