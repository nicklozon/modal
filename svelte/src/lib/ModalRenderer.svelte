<script>
    import { useModalStack } from './modalStack.svelte.js'
    import { setContext, onMount } from 'svelte'
    import { only } from './helpers.js'

    let { index } = $props()

    const modalStack = useModalStack()

    let modalContext = $derived(modalStack.stack[index])
    setContext('modalContext', modalContext)

    // NL: had to specify .default to make this work...
    let Page = $derived(modalContext?.component.default)

    $effect(() => setContext('modalContext', modalContext))

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
        onmodal-event={handleModalEvent}
    />
{/if}
