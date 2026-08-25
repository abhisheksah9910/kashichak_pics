import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Heart, Flag, Trash2, MessageCircle, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Lightbox({ memory, currentUser, onClose, onPrev, onNext, onLike, onReport, onDelete, onEdit }) {
    const isOwnerOrAdmin = currentUser && (currentUser.role === 'admin' || currentUser._id === (memory.uploader?._id || memory.uploader));
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        setLoadingComments(true);
        api.get(`/memories/${memory._id}/comments`)
            .then(res => setComments(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoadingComments(false));
    }, [memory._id]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!currentUser) return toast.error('Please log in to comment.');
        if (!newComment.trim()) return;

        try {
            const res = await api.post(`/memories/${memory._id}/comments`, { text: newComment });
            setComments([...comments, res.data.data]);
            setNewComment('');
            toast.success('Comment added.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add comment.');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await api.delete(`/memories/comments/${commentId}`);
            setComments(comments.filter(c => c._id !== commentId));
            toast.success('Comment deleted.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete comment.');
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: memory.caption,
            text: `Check out this memory on Apna Kashichak!`,
            url: window.location.href,
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
            <button onClick={onClose} className="absolute right-4 top-4 text-white/80 hover:text-white" aria-label="Close">
                <X className="h-8 w-8" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 text-white/70 hover:text-white" aria-label="Previous">
                <ChevronLeft className="h-8 w-8" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 text-white/70 hover:text-white" aria-label="Next">
                <ChevronRight className="h-8 w-8" />
            </button>

            <div className="flex flex-col md:flex-row max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-ink-950" onClick={(e) => e.stopPropagation()}>
                {/* Media Section */}
                <div className="flex-1 flex items-center justify-center bg-black min-h-[40vh] md:min-h-0">
                    {memory.mediaType === 'video' ? (
                        <video src={memory.mediaUrl} controls autoPlay className="max-h-[90vh] w-full object-contain" />
                    ) : (
                        <img src={memory.mediaUrl} alt={memory.caption} className="max-h-[90vh] w-full object-contain" />
                    )}
                </div>

                {/* Details & Comments Section */}
                <div className="w-full md:w-96 bg-ink-900 flex flex-col h-[50vh] md:h-auto border-l border-white/10">
                    <div className="p-6 text-white border-b border-white/10 shrink-0">
                        <h3 className="font-display text-xl font-semibold">{memory.caption}</h3>
                        {memory.story && <p className="mt-2 text-sm text-white/70">{memory.story}</p>}
                        <p className="mt-2 text-xs text-white/50">
                            <Link to={`/profile/${memory.uploader?._id || memory.uploader}`} className="hover:underline">
                                {memory.uploader?.name}
                            </Link> · Captured {new Date(memory.dateCaptured).toLocaleDateString()}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <button onClick={onLike} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20">
                                <Heart className="h-3.5 w-3.5" /> {memory.likeCount || 0}
                            </button>
                            <button onClick={onReport} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20">
                                <Flag className="h-3.5 w-3.5" /> Report
                            </button>
                            <button onClick={handleShare} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20">
                                <Share2 className="h-3.5 w-3.5" /> Share
                            </button>
                            {isOwnerOrAdmin && (
                                <>
                                    <button onClick={onEdit} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20">
                                        Edit
                                    </button>
                                    <button onClick={onDelete} className="flex items-center gap-1.5 rounded-full bg-red-500/80 px-3 py-1.5 text-xs hover:bg-red-500">
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loadingComments ? (
                            <div className="text-center text-white/50 text-sm">Loading comments...</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center text-white/50 text-sm flex flex-col items-center justify-center h-full">
                                <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
                                No comments yet. Be the first!
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment._id} className="flex gap-3 group">
                                    <div className="h-8 w-8 shrink-0 rounded-full bg-terracotta-600 overflow-hidden flex items-center justify-center text-xs text-white">
                                        {comment.user?.profileImage ? (
                                            <img src={comment.user.profileImage} alt={comment.user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            comment.user?.name?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-white/90">
                                            <Link to={`/profile/${comment.user?._id}`} className="font-semibold text-white hover:underline text-xs block mb-1">
                                                {comment.user?.name}
                                            </Link>
                                            {comment.text}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 px-1">
                                            <span className="text-[10px] text-white/40">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                            {(currentUser?.role === 'admin' || currentUser?._id === comment.user?._id) && (
                                                <button onClick={() => handleDeleteComment(comment._id)} className="text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comment Input */}
                    <div className="p-4 border-t border-white/10 shrink-0 bg-ink-950">
                        <form onSubmit={handleAddComment} className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={currentUser ? "Add a comment..." : "Log in to comment"}
                                disabled={!currentUser}
                                className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-terracotta-500 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!currentUser || !newComment.trim()}
                                className="bg-terracotta-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-terracotta-500 disabled:opacity-50 disabled:hover:bg-terracotta-600 transition-colors"
                            >
                                Post
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
