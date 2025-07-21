export default ModalRoot;
type ModalRoot = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const ModalRoot: import("svelte").Component<{
    appEl: any;
}, {}, "">;
type $$ComponentProps = {
    appEl: any;
};
