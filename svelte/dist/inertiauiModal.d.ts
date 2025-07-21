import { getConfig } from './config.js';
import { initFromPageProps } from './modalStack.svelte.js';
import { putConfig } from './config.js';
import { resetConfig } from './config.js';
import { renderApp } from './modalStack.svelte.js';
import useModal from './useModal.js';
import { useModalStack } from './modalStack.svelte.js';
export function visitModal(url: any, options?: {}): Promise<any>;
export { getConfig, initFromPageProps, putConfig, resetConfig, renderApp, useModal, useModalStack };
