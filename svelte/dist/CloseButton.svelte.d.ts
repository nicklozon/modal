export default CloseButton;
type CloseButton = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const CloseButton: import("svelte").Component<{
    onclick: any;
}, {}, "">;
type $$ComponentProps = {
    onclick: any;
};
