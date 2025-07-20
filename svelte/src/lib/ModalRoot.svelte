<script>
    import { onMount, onDestroy } from 'svelte'
    import { router, page } from '@inertiajs/svelte'
    import { useModalStack } from './modalStack.svelte.js'
    import ModalRenderer from './ModalRenderer.svelte'
    import { default as Axios } from 'axios'
    import { sameUrlPath } from './helpers.js'

    const modalStack = useModalStack()

    let { appEl } = $props()

    let isNavigating = $state(false)
    let previousModalOnBase = $state(null)
    let initialModalStillOpened = $state(false)
    let previousModal

    // Router event listeners
    const unsubscribeStart = router.on('start', () => (isNavigating = true))
    const unsubscribeFinish = router.on('finish', () => (isNavigating = false))
    const unsubscribeNavigate = router.on('navigate', ($event) => {
        const modalOnBase = $event.detail.page.props._inertiaui_modal

        if (!modalOnBase) {
            previousModalOnBase && modalStack.closeAll()
            modalStack.setBaseUrl(null)
            initialModalStillOpened = false
            return
        }

        previousModalOnBase = modalOnBase
        modalStack.setBaseUrl(modalOnBase.baseUrl)

        modalStack
            .pushFromResponseData(modalOnBase, {}, () => {
                if (!modalOnBase.baseUrl) {
                    console.error('No base url in modal response data so cannot navigate back')
                    return
                }

                if (!isNavigating && window.location.href !== modalOnBase.baseUrl) {
                    router.visit(modalOnBase.baseUrl, {
                        preserveScroll: true,
                        preserveState: true,
                    })
                }
            })
            .then(modalStack.onModalOnBase)
    })

    const axiosRequestInterceptor = (config) => {
        // A Modal is opened on top of a base route, so we need to pass this base route
        // so it can redirect back with the back() helper method...
        console.log('interceptor!')
        console.log(modalStack.getBaseUrl())
        config.headers['X-InertiaUI-Modal-Base-Url'] =
            modalStack.getBaseUrl() ?? (initialModalStillOpened ? $page.props._inertiaui_modal?.baseUrl : null)

        return config
    }

    onMount(() => {
        console.log('ModalRoot.svelte - onMount')
        Axios.interceptors.request.use(axiosRequestInterceptor)
        initialModalStillOpened = !!$page.props._inertiaui_modal
    })

    onDestroy(() => {
        console.log('ModalRoot.svelte - onDestroy')
        unsubscribeStart()
        unsubscribeFinish()
        unsubscribeNavigate()
        Axios.interceptors.request.eject(axiosRequestInterceptor)
    })

    // Watch for page prop changes
    $effect(() => {
        const newModal = $page.props?._inertiaui_modal
        console.log('newModal', newModal)

        if (newModal && previousModal && newModal.component === previousModal.component && sameUrlPath(newModal.url, previousModal.url)) {
            modalStack.stack[0]?.updateProps(newModal.props ?? {})
        }

        previousModal = newModal
    })

    $effect(() => {
        console.log('stack length', modalStack.stack.length)
        if(modalStack.stack.length) {
            console.log('HIDING')
            appEl.setAttribute('aria-hidden', 'true')
        } else {
            console.log('SHOWING')
            appEl.removeAttribute('aria-hidden')
        }
    })
</script>

{#if modalStack.stack.length > 0}
    <ModalRenderer index={0} />
{/if}
