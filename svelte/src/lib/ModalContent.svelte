<script>
    import CloseButton from './CloseButton.svelte'
    import { scale } from 'svelte/transition'
    import { quintOut } from 'svelte/easing'
    import { onClick, onEscape } from './helpers.js'

    let { modalContext, config, onAfterLeave, children } = $props()

    let entered = $state(false)
    let contentRef

    function handleAfterEnter() {
        entered = true
    }

    function handleAfterLeave() {
        modalContext.afterLeave()
        onAfterLeave?.()
    }

    // NL: not using a headless component library, so handling escape closing manually
    function handleEscape() {
        if (!config?.closeExplicitly && modalContext.onTopOfStack) {
            modalContext.close()
        }
    }

    // NL: not using a headless component library, so handling clicking outside manually
    function handleClickOutside(event) {
        if (
            !config?.closeExplicitly &&
            modalContext.onTopOfStack &&
            contentRef &&
            !contentRef.contains(event.target) &&
            document.contains(event.target)
        ) {
            modalContext.close()
        }
    }
</script>

<!-- Full-screen scrollable container -->
<div class="im-modal-container fixed inset-0 z-40 overflow-y-auto p-4">
    <!-- Container to center the panel -->
    <div
        class="im-modal-positioner flex min-h-full justify-center"
        class:items-start={config.position === 'top'}
        class:items-center={config.position === 'center'}
        class:items-end={config.position === 'bottom'}
    >
        <div
            bind:this={contentRef}
            class="im-modal-wrapper w-full"
            class:blur-sm={!modalContext.onTopOfStack}
            class:sm:max-w-sm={config.maxWidth === 'sm'}
            class:sm:max-w-md={config.maxWidth === 'md'}
            class:md:max-w-lg={config.maxWidth === 'lg'}
            class:md:max-w-xl={config.maxWidth === 'xl'}
            class:lg:max-w-2xl={config.maxWidth === '2xl'}
            class:lg:max-w-3xl={config.maxWidth === '3xl'}
            class:xl:max-w-4xl={config.maxWidth === '4xl'}
            class:xl:max-w-5xl={config.maxWidth === '5xl'}
            class:2xl:max-w-6xl={config.maxWidth === '6xl'}
            class:2xl:max-w-7xl={config.maxWidth === '7xl'}
            in:scale|global={{ duration: 300, easing: quintOut, start: 0.95 }}
            out:scale|global={{ duration: 300, easing: quintOut, start: 0.95 }}
            onintroend={handleAfterEnter}
            onoutroend={handleAfterLeave}
            use:onEscape={handleEscape}
            use:onClick={handleClickOutside}
        >
            <div
                class="im-modal-content relative {config.paddingClasses} {config.panelClasses}"
                data-inertiaui-modal-entered={entered}
            >
                {#if config.closeButton}
                    <div class="absolute right-0 top-0 pr-3 pt-3">
                        <CloseButton onclick={modalContext.close} />
                    </div>
                {/if}

                {@render children?.({ modalContext, config })}
            </div>
        </div>
    </div>
</div>
