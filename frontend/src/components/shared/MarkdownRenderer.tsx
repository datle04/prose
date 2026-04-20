'use client';

import dynamic from 'next/dynamic';

const MDPreview = dynamic(() => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown), {
    ssr: false,
});

export default function MarkdownRenderer({ content }: { content: string }) {
    return (
        <div data-color-mode="light" className="[&_.wmde-markdown]:bg-transparent [&_.wmde-markdown]:text-foreground">
            <MDPreview source={content} />
        </div>
    );
}
