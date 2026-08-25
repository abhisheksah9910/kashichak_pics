import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Heart, Flag, Trash2, MessageCircle, Share2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Lightbox({ memory, currentUser, onClose, onPrev, onNext, onLike, onReport, onDelete, onEdit }) {
    const isOwnerOrAdmin = currentUser && (currentUser.role === 'admin' || currentUser._id === (memory.uploader?._id || memory.uploader));
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

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
        const shareData = { title: memory.caption, text: `Check out this memory on Apna Kashichak!`, url: window.location.href };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) { console.error('Error sharing:', err); }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col md:flex-row md:items-center md:justify-center md:p-4" onClick={onClose}>
            {/* Close button */}
            <button onClick={onClose} className="absolute right-4 top-4 z-50 text-white/80 hover:text-white" aria-label="Close">
                <X className="h-7 w-7" />
            </button>

            {/* Prev / Next arrows - hidden on mobile, shown on desktop */}
            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 z-50 hidden md:block text-white/70 hover:text-white" aria-label="Previous">
                <ChevronLeft className="h-10 w-10" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-2 top-1/2 -translate-y-1/2 z-50 hidden md:block text-white/70 hover:text-white" aria-label="Next">
                <ChevronRight className="h-10 w-10" />
            </button>

            {/* Main container */}
            <div
                className="flex flex-col md:flex-row w-full md:max-w-6xl md:max-h-[90vh] md:overflow-hidden md:rounded-2xl md:bg-ink-950"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ===== MEDIA SECTION ===== */}
                <div className="relative flex-1 flex items-center justify-center bg-black"
                    style={{ minHeight: 'calc(100dvh - 0px)', maxHeight: '100dvh' }}
                >
                    {/* On mobile: restrict to ~60% of screen height */}
                    <div className="w-full md:h-full" style={{ maxHeight: '65dvh' }}>
                        {memory.mediaType === 'video' ? (
                            <video
                                src={memory.mediaUrl}
                                controls
                                autoPlay
                                className="h-full w-full object-contain"
                                style={{ maxHeight: '65dvh' }}
                            />
                        ) : (
                            <img
                                src={memory.mediaUrl}
                                alt={memory.caption}
                                className="h-full w-full object-contain"
                                style={{ maxHeight: '65dvh' }}
                            />
                        )}
                    </div>

                    {/* Mobile swipe arrows overlaid on media */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                {/* ===== DETAILS & COMMENTS (Instagram-style bottom sheet on mobile) ===== */}
                <div
                    className="w-full md:w-96 bg-ink-950 flex flex-col md:h-full border-t md:border-t-0 md:border-l border-white/10"
                    style={{ maxHeight: '40dvh', overflowY: 'auto' }}
                >
                    {/* Header */}
                    <div className="p-4 text-white border-b border-white/10 shrink-0">
                        <h3 className="font-display text-base md:text-xl font-semibold line-clamp-1">{memory.caption}</h3>
                        {memory.story && <p className="mt-1 text-sm text-white/70 line-clamp-2">{memory.story}</p>}
                        <p className="mt-1 text-xs text-white/50">
                            <Link to={`/profile/${memory.uploader?._id || memory.uploader}`} className="hover:underline">
                                {memory.uploader?.name}
                            </Link> · Captured {new Date(memory.dateCaptured).toLocaleDateString()}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
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

                    {/* Comments */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loadingComments ? (
                            <div className="text-center text-white/50 text-sm">Loading comments...</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center text-white/50 text-sm flex flex-col items-center justify-center h-full">
                                <MessageCircle className="h-7 w-7 mb-2 opacity-50" />
                                No comments yet. Be the first!
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment._id} className="flex gap-3 group">
                                    <div className="h-7 w-7 shrink-0 rounded-full bg-terracotta-600 overflow-hidden flex items-center justify-center text-xs text-white">
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
                    <div className="p-3 border-t border-white/10 shrink-0 bg-ink-950">
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
                                className="bg-terracotta-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-terracotta-500 disabled:opacity-50 transition-colors"
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
