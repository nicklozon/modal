<script>
    import { useModalStack } from './modalStack.svelte.js'
    import { setContext, onMount, onDestroy } from 'svelte'
    import { only } from './helpers.js'

    let { index } = $props()

    const modalStack = useModalStack()

    let modalContext = $state(modalStack.stack[index])
    setContext('modalContext', modalContext)

    $effect(() => {
        console.log('ModalRenderer index changed?')
        modalContext = modalStack.stack[index]
    })

    $effect(() => {
        console.log('ModalRenderer modalContext changed')
        setContext('modalContext', modalContext)
    })

    // NL: had to specify .default to make this work...
    let Page = $derived(modalContext?.component.default)


    function handleModalEvent(event, ...args) {
        modalContext?.emit(event.type, ...args)
    }

    // NL: There doesn't seem to be a way to infer what props a svelte component expects
    // So we just pass everything through
    // {...only(modalContext.props || {}, modalContext.getComponentPropKeys(), true)}
    
    onMount(() => {
        console.log('ModalRenderer.svelte - onMount')
    })
    
    onDestroy(() => {
        console.log('ModalRenderer.svelte - onDestroy')
    })
</script>

{#if Page}
    <Page
        {...modalContext.props}
        onmodal-event={handleModalEvent}
    />
{/if}
