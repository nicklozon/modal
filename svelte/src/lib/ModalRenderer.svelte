<script>
    import { useModalStack } from '../modalStack.svelte.js'
    import { setContext } from 'svelte'
    import { only } from '../helpers.js'

    let { index } = $props()

    const modalStack = useModalStack()

    let modalContext = $derived(modalStack.stack[index])

    $effect(() => setContext('modal', modalContext))

    function handleModalEvent(event, ...args) {
        modalContext?.emit(event.type, ...args)
    }
</script>

{#if modalContext?.component}
    <modalContext.component
        {...only(modalContext.props || {}, modalContext.getComponentPropKeys(), true)}
        onmodal-event={handleModalEvent}
    />
{/if}
