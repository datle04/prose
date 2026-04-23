import { notFound } from 'next/navigation';
import api from '@/lib/api';
import { Post, User } from '@/types';
import PostCard from '@/components/shared/PostCard';
import FollowButton from '@/components/shared/FollowButton';

async function getProfile(username: string) {
    try {
        const res = await api.get(`/users/${username}/profile`);
        return res.data.data as User;
    } catch {
        return null;
    }
}

async function getUserPosts(username: string) {
    try {
        const res = await api.get(`/posts/search?author=${username}`);
        return res.data.data.posts as Post[];
    } catch {
        return [];
    }
}

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    const [profile, posts] = await Promise.all([
        getProfile(username),
        getUserPosts(username),
    ]);

    if (!profile) notFound();

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            {/* Profile header */}
            <div className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted overflow-hidden shrink-0">
                        {profile.avatar && (
                            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div>
                        <h1 className="font-heading text-2xl font-bold">{profile.name}</h1>
                        <p className="text-muted-foreground text-sm">@{profile.username}</p>
                        {profile.bio && (
                            <p className="text-sm mt-1 max-w-md">{profile.bio}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{profile._count?.posts ?? 0} posts</span>
                            <span>{profile._count?.followers ?? 0} followers</span>
                            <span>{profile._count?.following ?? 0} following</span>
                        </div>
                    </div>
                </div>

                <FollowButton username={username} />
            </div>

            {/* Posts */}
            <h2 className="font-heading text-xl font-bold mb-4">Posts</h2>
            {posts.length === 0 ? (
                <p className="text-muted-foreground text-sm">No posts yet.</p>
            ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
        </div>
    );
}
