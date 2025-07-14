<script>
import { useModal } from '@inertiaui/modal-svelte'

// NL: returns result from getContext, not sure how it works here
// Probably not even needed -use use getContext?
const modal = useModal()

if (modal) {
    const { props } = useModal()
    console.log(props.roles)
}
</script>

{#if modal}
    <div>
        <button on:click={modal.close}>Close Modal with index {modal.index}</button>
    </div>
{/if}

