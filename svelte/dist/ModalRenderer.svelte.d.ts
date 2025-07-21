export default ModalRenderer;
type ModalRenderer = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const ModalRenderer: import("svelte").Component<{
    index: any;
}, {}, "">;
type $$ComponentProps = {
    index: any;
};
