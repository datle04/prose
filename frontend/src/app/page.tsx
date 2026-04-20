import api from '@/lib/api';
import PostCard from '@/components/shared/PostCard';
import { Post } from '@/types';

async function getPosts() {
    try {
        const res = await api.get('/posts');
        return res.data.data;
    } catch {
        return { posts: [], meta: null };
    }
}

export default async function HomePage() {
    const { posts, meta } = await getPosts();

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <h1 className="font-heading text-4xl font-bold mb-2">Latest posts</h1>
            <p className="text-muted-foreground mb-10">Stories worth reading</p>

            {posts.length === 0 ? (
                <p className="text-muted-foreground text-center py-20">No posts yet.</p>
            ) : (
                <>
                    {posts.map((post: Post) => (
                        <PostCard key={post.id} post={post} />
                    ))}

                    {meta && (
                        <p className="text-sm text-muted-foreground text-center mt-8">
                            Showing {posts.length} of {meta.total} posts
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
