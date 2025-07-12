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

    let headlessModal = $state()

    // Expose methods from HeadlessModal
    function afterLeave() {
        return headlessModal?.afterLeave()
    }

    function close() {
        return headlessModal?.close()
    }

    function emit(...args) {
        return headlessModal?.emit(...args)
    }

    function getChildModal() {
        return headlessModal?.getChildModal()
    }

    function getParentModal() {
        return headlessModal?.getParentModal()
    }

    function reload(...args) {
        return headlessModal?.reload(...args)
    }

    function setOpen(...args) {
        return headlessModal?.setOpen(...args)
    }

    function getId() {
        return headlessModal?.getId()
    }

    function getIndex() {
        return headlessModal?.getIndex()
    }

    function getIsOpen() {
        return headlessModal?.getIsOpen()
    }

    function getConfig() {
        return headlessModal?.getConfig()
    }

    function getModalContext() {
        return headlessModal?.getModalContext()
    }

    function getOnTopOfStack() {
        return headlessModal?.getOnTopOfStack()
    }

    function getShouldRender() {
        return headlessModal?.getShouldRender()
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
    {#snippet children({
        afterLeave,
        close,
        config,
        emit,
        getChildModal,
        getParentModal,
        id,
        index,
        isOpen,
        modalContext,
        onTopOfStack,
        reload,
        setOpen,
        shouldRender,
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
                {#if config.slideover}
                    <SlideoverContent
                        {modalContext}
                        {config}
                        onafterleave={handleAfterLeaveEvent}
                    >
                        {@render children?.({
                            afterLeave,
                            close,
                            config,
                            emit,
                            getChildModal,
                            getParentModal,
                            id,
                            index,
                            isOpen,
                            modalContext,
                            onTopOfStack,
                            reload,
                            setOpen,
                            shouldRender,
                        })}
                    </SlideoverContent>
                {:else}
                    <ModalContent
                        {modalContext}
                        {config}
                        onafterleave={handleAfterLeaveEvent}
                    >
                        {@render children?.({
                            afterLeave,
                            close,
                            config,
                            emit,
                            getChildModal,
                            getParentModal,
                            id,
                            index,
                            isOpen,
                            modalContext,
                            onTopOfStack,
                            reload,
                            setOpen,
                            shouldRender,
                        })}
                    </ModalContent>
                {/if}
            </div>
        {/if}
    {/snippet}
</HeadlessModal>
