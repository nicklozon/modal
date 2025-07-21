export default WhenVisible;
type WhenVisible = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const WhenVisible: import("svelte").Component<{
    data?: any;
    params?: any;
    buffer?: number;
    as?: string;
    always?: boolean;
    children: any;
    fallback: any;
}, {}, "">;
type $$ComponentProps = {
    data?: any;
    params?: any;
    buffer?: number;
    as?: string;
    always?: boolean;
    children: any;
    fallback: any;
};
