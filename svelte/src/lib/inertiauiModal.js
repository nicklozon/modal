import { getConfig, putConfig, resetConfig } from './config.js'
import { kebabCase } from './helpers.js'
import { useModalStack, initFromPageProps, renderApp } from './modalStack.svelte.js'
import useModal from './useModal.js'

function visitModal(url, options = {}) {
    return useModalStack()
        .visit(
            url,
            options.method ?? 'get',
            options.data ?? {},
            options.headers ?? {},
            options.config ?? {},
            options.onClose,
            options.onAfterLeave,
            options.queryStringArrayFormat ?? 'brackets',
            options.navigate ?? getConfig('navigate'),
        )
        .then((modal) => {
            const listeners = options.listeners ?? {}

            Object.keys(listeners).forEach((event) => {
                // e.g. refreshKey -> refresh-key
                const eventName = kebabCase(event)
                modal.on(eventName, listeners[event])
            })

            return modal
        })
}

export { getConfig, initFromPageProps, putConfig, resetConfig, renderApp, useModal, useModalStack, visitModal }
