export default ModalContent;
type ModalContent = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const ModalContent: import("svelte").Component<{
    modalContext: any;
    config: any;
    onafterleave: any;
    children: any;
}, {}, "">;
type $$ComponentProps = {
    modalContext: any;
    config: any;
    onafterleave: any;
    children: any;
};
