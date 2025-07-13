<script>
import { useModal } from '@inertiaui/modal-svelte'

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

