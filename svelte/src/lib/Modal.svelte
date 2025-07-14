<script>
    import HeadlessModal from './HeadlessModal.svelte'
    import ModalContent from './ModalContent.svelte'
    import SlideoverContent from './SlideoverContent.svelte'
    import { fade } from 'svelte/transition'

    let {
        name = null,
        onfocus = null,
        onblur = null,
        onclose = null,
        onsuccess = null,
        onafterleave = null,
        // Modal configuration props
        slideover = null,
        closeButton = null,
        closeExplicitly = null,
        maxWidth = null,
        paddingClasses = null,
        panelClasses = null,
        position = null,
        children,
    } = $props()

    let headlessModal

    // Expose methods from HeadlessModal
    export function afterLeave() {
        return headlessModal?.afterLeave()
    }

    export function close() {
        return headlessModal?.close()
    }

    export function emit(...args) {
        return headlessModal?.emit(...args)
    }

    export function getChildModal() {
        return headlessModal?.getChildModal()
    }

    export function getParentModal() {
        return headlessModal?.getParentModal()
    }

    export function reload(...args) {
        return headlessModal?.reload(...args)
    }

    export function setOpen(...args) {
        return headlessModal?.setOpen(...args)
    }

    function handleFocus() {
        onfocus?.()
    }

    function handleBlur() {
        onblur?.()
    }

    function handleClose() {
        onclose?.()
    }

    function handleSuccess() {
        onsuccess?.()
    }

    function handleAfterLeaveEvent() {
        onafterleave?.()
    }
</script>

<HeadlessModal
    bind:this={headlessModal}
    {name}
    {slideover}
    {closeButton}
    {closeExplicitly}
    {maxWidth}
    {paddingClasses}
    {panelClasses}
    {position}
    onfocus={handleFocus}
    onblur={handleBlur}
    onclose={handleClose}
    onsuccess={handleSuccess}
>
    {#snippet modalSlot({
        afterLeave,
        close,
        emit,
        getChildModal,
        getParentModal,
        reload,
        setOpen,
        id,
        index,
        isOpen,
        config,
        modalContext,
        onTopOfStack,
        shouldRender
    })}
        {#if isOpen}
            <div
                class="im-dialog relative z-20"
                data-inertiaui-modal-id={id}
                data-inertiaui-modal-index={index}
                transition:fade={{ duration: 300 }}
            >
                <!-- Only transition the backdrop for the first modal in the stack -->
                {#if index === 0 && onTopOfStack}
                    <div
                        class="im-backdrop fixed inset-0 z-30 bg-black/75"
                        aria-hidden="true"
                        transition:fade={{ duration: 300 }}
                    ></div>
                {/if}

                <!-- On multiple modals, only show a backdrop for the modal that is on top of the stack -->
                {#if index > 0 && onTopOfStack}
                    <div class="im-backdrop fixed inset-0 z-30 bg-black/75"></div>
                {/if}

                <!-- The modal/slideover content itself -->
                {#if headlessModal?.getConfig().slideover}
                    <SlideoverContent
                        modalContext={headlessModal?.getModalContext()}
                        config={headlessModal?.getConfig()}
                        onafterleave={handleAfterLeaveEvent}
                    >
                        SLIDE OVER CONTENT
                        {@render children({reload})}
                    </SlideoverContent>
                {:else}
                    <ModalContent
                        modalContext={headlessModal?.getModalContext()}
                        config={headlessModal?.getConfig()}
                        onafterleave={handleAfterLeaveEvent}
                    >
                        MODAL CONTENT
                        {@render children({reload})}
                    </ModalContent>
                {/if}
            </div>
        {/if}
    {/snippet}
</HeadlessModal>
