export default Modal;
type Modal = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
} & {
    getId: () => any;
    afterLeave: () => any;
    close: () => any;
    emit: (...args: any[]) => any;
    getChildModal: () => any;
    getParentModal: () => any;
    reload: (...args: any[]) => any;
    setOpen: (...args: any[]) => any;
};
declare const Modal: import("svelte").Component<{
    name?: any;
    onfocus?: any;
    onblur?: any;
    onclose?: any;
    onsuccess?: any;
    onafterleave?: any;
    slideover?: any;
    closeButton?: any;
    closeExplicitly?: any;
    maxWidth?: any;
    paddingClasses?: any;
    panelClasses?: any;
    position?: any;
    children: any;
} & Record<string, any>, {
    getId: () => any;
    afterLeave: () => any;
    close: () => any;
    emit: (...args: any[]) => any;
    getChildModal: () => any;
    getParentModal: () => any;
    reload: (...args: any[]) => any;
    setOpen: (...args: any[]) => any;
}, "">;
type $$ComponentProps = {
    name?: any;
    onfocus?: any;
    onblur?: any;
    onclose?: any;
    onsuccess?: any;
    onafterleave?: any;
    slideover?: any;
    closeButton?: any;
    closeExplicitly?: any;
    maxWidth?: any;
    paddingClasses?: any;
    panelClasses?: any;
    position?: any;
    children: any;
} & Record<string, any>;
