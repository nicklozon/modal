export default Deferred;
type Deferred = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const Deferred: import("svelte").Component<{
    data: any;
    children: any;
    fallback: any;
}, {}, "">;
type $$ComponentProps = {
    data: any;
    children: any;
    fallback: any;
};
