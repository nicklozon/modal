<script>
import { Modal, ModalLink } from '@inertiaui/modal-svelte'

function log(value) {
    console.log(value)
}
</script>

<Modal
    onsuccess={() => log('success')}
    onblur={() => log('blur')}
    onfocus={() => log('focus')}
    onclose={() => log('close')}
    onafterleave={() => log('after-leave')}
>
    <ModalLink href="/roles/create">
        Create role
    </ModalLink>
</Modal>