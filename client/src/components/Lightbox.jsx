import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Heart, Flag, MessageCircle, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Lightbox({ memory, currentUser, onClose, onPrev, onNext, onLike, onReport, onDelete, onEdit, onSetCover }) {
    const isOwnerOrAdmin = currentUser && (currentUser.role === 'admin' || currentUser._id === (memory.uploader?._id || memory.uploader));
    const isAdmin = currentUser?.role === 'admin';
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
        const shareData = { title: memory.caption, text: `Check out this memory on Kashichak!`, url: window.location.href };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) { console.error(err); }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleWhatsAppShare = () => {
        const text = encodeURIComponent(`Check out this memory on Kashichak! ${window.location.href}`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    };

    const handleFacebookShare = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    };

    return (
        /* Full screen overlay */
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-end md:items-center md:justify-center md:p-4" onClick={onClose}>

            {/* Close */}
            <button onClick={onClose} className="absolute right-4 top-4 z-[110] text-white/80 hover:text-white" aria-label="Close">
                <X className="h-7 w-7" />
            </button>

            {/* Desktop prev/next arrows */}
            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 z-[110] hidden md:block text-white/70 hover:text-white">
                <ChevronLeft className="h-10 w-10" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-2 top-1/2 -translate-y-1/2 z-[110] hidden md:block text-white/70 hover:text-white">
                <ChevronRight className="h-10 w-10" />
            </button>

            {/*
              MOBILE: column layout, full width, slides up from bottom like Instagram
              DESKTOP: row layout, centered card, max 90vh
            */}
            <div
                className="relative flex flex-col md:flex-row w-full md:max-w-6xl md:max-h-[90vh] md:overflow-hidden md:rounded-2xl md:bg-ink-950"
                onClick={(e) => e.stopPropagation()}
            >
                {/* === MEDIA === */}
                <div className="relative bg-black flex items-center justify-center
                    h-[58dvh] md:h-auto md:flex-1">
                    {memory.mediaType === 'video' ? (
                        <video src={memory.mediaUrl} controls autoPlay className="max-h-[58dvh] md:max-h-[90vh] w-full object-contain" />
                    ) : (
                        <img src={memory.mediaUrl} alt={memory.caption} className="max-h-[58dvh] md:max-h-[90vh] w-full object-contain" />
                    )}

                    {/* Mobile arrows on media */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 md:hidden h-8 w-8 flex items-center justify-center rounded-full bg-black/50 text-white"
                    ><ChevronLeft className="h-5 w-5" /></button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 md:hidden h-8 w-8 flex items-center justify-center rounded-full bg-black/50 text-white"
                    ><ChevronRight className="h-5 w-5" /></button>
                </div>

                {/* === DETAILS + COMMENTS (bottom sheet on mobile) === */}
                <div className="flex flex-col bg-ink-950 border-t md:border-t-0 md:border-l border-white/10
                    h-[42dvh] md:h-auto md:w-96 rounded-t-3xl md:rounded-none">

                    {/* Info */}
                    <div className="p-4 border-b border-white/10 shrink-0">
                        {/* Mobile drag handle */}
                        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20 md:hidden" />
                        <h3 className="font-display text-base md:text-xl font-semibold text-white line-clamp-1">{memory.caption}</h3>
                        {memory.story && <p className="mt-1 text-sm text-white/70 line-clamp-2">{memory.story}</p>}
                        <p className="mt-1 text-xs text-white/50">
                            <Link to={`/profile/${memory.uploader?._id || memory.uploader}`} className="hover:underline">
                                {memory.uploader?.name}
                            </Link> · Captured {new Date(memory.dateCaptured).toLocaleDateString()}
                        </p>

                        {/* Actions */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button onClick={onLike} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition-colors">
                                <Heart className={`h-3.5 w-3.5 transition-colors ${memory.isLiked ? 'fill-red-500 text-red-500' : ''}`} /> {memory.likeCount || 0}
                            </button>
                            <button onClick={onReport} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20">
                                <Flag className="h-3.5 w-3.5" /> Report
                            </button>
                            <button onClick={handleShare} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20">
                                <Share2 className="h-3.5 w-3.5" /> Share
                            </button>
                            <button onClick={handleWhatsAppShare} className="flex items-center gap-1.5 rounded-full bg-green-500/20 border border-green-500/30 px-3 py-1.5 text-xs text-green-400 hover:bg-green-500/30">
                                WhatsApp
                            </button>
                            <button onClick={handleFacebookShare} className="flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-500/30">
                                Facebook
                            </button>
                            {isOwnerOrAdmin && (
                                <>
                                    <button onClick={onEdit} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20">Edit</button>
                                    <button onClick={onDelete} className="flex items-center gap-1.5 rounded-full bg-red-500/80 px-3 py-1.5 text-xs text-white hover:bg-red-500">Delete</button>
                                </>
                            )}
                            {isAdmin && onSetCover && (
                                <button onClick={onSetCover} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 border border-white/20">
                                    Set as Cover
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Comments scrollable */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loadingComments ? (
                            <div className="text-center text-white/50 text-sm">Loading comments...</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center text-white/50 text-sm flex flex-col items-center justify-center h-full gap-2">
                                <MessageCircle className="h-7 w-7 opacity-40" />
                                No comments yet. Be the first!
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment._id} className="flex gap-3 group">
                                    <div className="h-7 w-7 shrink-0 rounded-full bg-terracotta-600 overflow-hidden flex items-center justify-center text-xs text-white">
                                        {comment.user?.profileImage
                                            ? <img src={comment.user.profileImage} alt={comment.user.name} className="h-full w-full object-cover" />
                                            : comment.user?.name?.charAt(0).toUpperCase()
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-white/90">
                                            <Link to={`/profile/${comment.user?._id}`} className="font-semibold text-white hover:underline text-xs block mb-1">{comment.user?.name}</Link>
                                            {comment.text}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 px-1">
                                            <span className="text-[10px] text-white/40">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            {(currentUser?.role === 'admin' || currentUser?._id === comment.user?._id) && (
                                                <button onClick={() => handleDeleteComment(comment._id)} className="text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comment input */}
                    <div className="p-3 border-t border-white/10 shrink-0">
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
                            >Post</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
