import { notFound } from 'next/navigation';
import api from '@/lib/api';
import { Post } from '@/types';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import LikeButton from '@/components/shared/LikeButton';
import CommentsSection from '@/components/shared/CommentsSection';

async function getPost(slug: string) {
    try {
        const res = await api.get(`/posts/${slug}`);
        return res.data.data as Post;
    } catch {
        return null;
    }
}

export default async function PostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) notFound();

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                        {post.author.avatar && (
                            <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                <h1 className="font-heading text-4xl font-bold mb-4">{post.title}</h1>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{post._count?.likes ?? 0} likes</span>
                    <span>{post._count?.comments ?? 0} comments</span>
                    <span>{post.viewCount} views</span>
                    {post.tags.map((tag) => (
                        <span key={tag.id} className="text-primary">#{tag.name}</span>
                    ))}
                </div>
                <div className="mt-4">
                    <LikeButton postId={post.id} initialCount={post._count?.likes ?? 0} />
                </div>
            </div>

            {/* Thumbnail */}
            {post.thumbnail && (
                <div className="rounded-xl overflow-hidden mb-8 aspect-video bg-muted">
                    <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                </div>
            )}

            {/* Content */}
           <MarkdownRenderer content={post.content} />

           <CommentsSection postId={post.id}/>
        </div>
    );
}
