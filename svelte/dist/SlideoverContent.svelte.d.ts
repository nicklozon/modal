export default SlideoverContent;
type SlideoverContent = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const SlideoverContent: import("svelte").Component<{
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
