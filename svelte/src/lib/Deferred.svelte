<script>
    // This is supposed to be cloned from inertia repo?
    // https://github.com/inertiajs/inertia/blob/master/packages/svelte/src/components/Deferred.svelte
    import { getContext, onMount, onDestroy } from 'svelte'

    let { data, children, fallback } = $props()

    if (!data) {
        throw new Error('`<Deferred>` requires a `data` prop to be a string or array of strings')
    }

    const modalContext = getContext('modalContext')

    if (!modalContext) {
        throw new Error('Deferred component must be used inside a Modal component')
    }

    const keys = Array.isArray(data) ? data : [data]

    let allKeysAreAvailable = $derived(keys.every((key) => modalContext.props[key] !== undefined))
    
    onMount(() => {
        console.log('Deferred.svelte - onMount')
    })
    
    onDestroy(() => {
        console.log('Deferred.svelte - onDestroy')
    })
</script>

{#if allKeysAreAvailable}
    {@render children?.()}
{:else}
    {@render fallback?.()}
{/if}
