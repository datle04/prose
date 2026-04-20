import { Post } from "@/types";
import Link from 'next/link';

export default function PostCard({ post }: { post: Post }) {
     return (
        <article className="flex gap-6 py-8 border-b border-border last:border-0">
            {/* Content */}
            <div className="flex-1 min-w-0">
                <Link href={`/profile/${post.author.username}`} className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
                        {post.author.avatar && (
                            <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        )}
                    </div>
                    <span className="text-sm font-medium hover:underline">{post.author.name}</span>
                </Link>

                <Link href={`/posts/${post.slug}`}>
                    <h2 className="font-heading text-xl font-bold mb-2 hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                    </h2>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {post.content.replace(/[#*`]/g, '').slice(0, 150)}...
                    </p>
                </Link>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>{post._count?.likes ?? 0} likes</span>
                    <span>{post._count?.comments ?? 0} comments</span>
                    {post.tags.map((tag) => (
                        <Link key={tag.id} href={`/?tag=${tag.slug}`} className="hover:text-primary transition-colors">
                            #{tag.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Thumbnail */}
            {post.thumbnail && (
                <div className="w-28 h-28 rounded-lg overflow-hidden shrink-0 bg-muted">
                    <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                </div>
            )}
        </article>
    );
}