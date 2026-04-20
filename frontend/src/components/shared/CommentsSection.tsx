'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useComments } from '@/hooks/useComments';
import { Comment } from '@/types';

function CommentItem({
    comment,
    onDelete,
    onReply,
    currentUserId,
}: {
    comment: Comment;
    onDelete: (id: string) => void;
    onReply: (parentId: string, content: string) => void;
    currentUserId?: string;
}) {
    const [showReply, setShowReply] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const handleReply = () => {
        if (!replyContent.trim()) return;
        onReply(comment.id, replyContent);
        setReplyContent('');
        setShowReply(false);
    };

    return (
        <div className="py-4 border-b border-border last:border-0">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-muted overflow-hidden">
                    {comment.author.avatar && (
                        <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full object-cover" />
                    )}
                </div>
                <span className="text-sm font-medium">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                </span>
                {currentUserId === comment.author.id && (
                    <button
                        onClick={() => onDelete(comment.id)}
                        className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                        Delete
                    </button>
                )}
            </div>

            <p className="text-sm leading-6 mb-2">{comment.content}</p>

            <button
                onClick={() => setShowReply(!showReply)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
                Reply
            </button>

            {showReply && (
                <div className="mt-2 flex gap-2">
                    <input
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 border border-input rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                        onClick={handleReply}
                        className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90"
                    >
                        Send
                    </button>
                </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 ml-6 border-l-2 border-border pl-4">
                    {comment.replies.map((reply) => (
                        <div key={reply.id} className="py-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{reply.author.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                                {currentUserId === reply.author.id && (
                                    <button
                                        onClick={() => onDelete(reply.id)}
                                        className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <p className="text-sm leading-6">{reply.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CommentsSection({ postId }: { postId: string }) {
    const { user } = useAuthStore();
    const { comments, isLoading, addComment, isAdding, deleteComment, addReply } = useComments(postId);
    const [content, setContent] = useState('');

    const handleSubmit = () => {
        if (!content.trim()) return;
        addComment(content);
        setContent('');
    };

    return (
        <div className="mt-12">
            <h2 className="font-heading text-2xl font-bold mb-6">
                Comments ({comments.length})
            </h2>

            {/* Comment input */}
            {user ? (
                <div className="flex gap-3 mb-8">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write a comment..."
                        rows={3}
                        className="flex-1 border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isAdding}
                        className="self-end bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                    >
                        {isAdding ? 'Posting...' : 'Post'}
                    </button>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground mb-8">
                    <a href="/login" className="text-primary hover:underline">Login</a> to leave a comment.
                </p>
            )}

            {/* Comments list */}
            {isLoading ? (
                <p className="text-muted-foreground text-sm">Loading comments...</p>
            ) : comments.length === 0 ? (
                <p className="text-muted-foreground text-sm">No comments yet. Be the first!</p>
            ) : (
                comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        onDelete={deleteComment}
                        onReply={(parentId, content) => addReply({ content, parentId })}
                        currentUserId={user?.id}
                    />
                ))
            )}
        </div>
    );
}
