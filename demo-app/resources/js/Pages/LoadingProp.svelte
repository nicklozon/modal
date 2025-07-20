<script>
import Container from './Container.svelte'
import { ModalLink } from '@inertiaui/modal-svelte'
</script>

<Container>
    <div class="flex justify-between">
        <h2 class="text-lg font-medium text-gray-900">Loading Prop</h2>
    </div>

    <ModalLink
        data-dusk="modal-link"
        href="/slideover?slow=1"
        class="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-md"
        let:loading
    >
        {loading ? 'Loading...' : 'Open Slideover'}
    </ModalLink>
</Container>