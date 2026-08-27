import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Image, MapPin, X, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GridSkeleton, Spinner } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Lightbox from '../components/Lightbox';
import MemoryCard from '../components/MemoryCard';

export default function UserProfile() {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(`/users/public/${id}`),
            api.get('/memories', { params: { uploader: id, limit: 100 } })
        ])
            .then(([userRes, memRes]) => {
                setProfile(userRes.data.data.user);
                setStats(userRes.data.data.stats);
                setMemories(memRes.data.data);
            })
            .catch((err) => {
                toast.error('User not found');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleLike = async (memoryId, idx) => {
        if (!currentUser) return toast.error('लाइक करने के लिए लॉग इन करें।');
        try {
            const res = await api.post(`/memories/${memoryId}/like`);
            setMemories((prev) => prev.map((m, i) => (i === idx ? { ...m, likeCount: res.data.data.likeCount, isLiked: res.data.data.liked } : m)));
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleReport = async (memoryId) => {
        if (!currentUser) return toast.error('रिपोर्ट करने के लिए लॉग इन करें।');
        try {
            await api.post('/reports', { memoryId, reason: 'inappropriate' });
            toast.success('Reported. Our moderators will review it.');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteMemory = async (memoryId) => {
        if (!window.confirm('क्या आप सच में इसे डिलीट करना चाहते हैं?')) return;
        try {
            await api.delete(`/memories/${memoryId}`);
            toast.success('Memory deleted.');
            setMemories((prev) => prev.filter((m) => m._id !== memoryId));
            setLightboxIndex(null);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    const handleEditMemory = async (memory) => {
        const newCaption = window.prompt('Enter new caption:', memory.caption);
        if (newCaption === null) return;
        const newStory = window.prompt('Enter new story (optional):', memory.story || '');
        if (newStory === null) return;

        try {
            await api.put(`/memories/${memory._id}`, { caption: newCaption, story: newStory });
            toast.success('Memory updated.');
            setMemories((prev) => prev.map((m) => (m._id === memory._id ? { ...m, caption: newCaption, story: newStory } : m)));
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    if (loading) return <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><GridSkeleton count={6} /></div>;
    if (!profile) return <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6"><EmptyState title="यूज़र नहीं मिला (User not found)" /></div>;

    return (
        <div>
            {/* Profile Header */}
            <div className="bg-terracotta-50 dark:bg-terracotta-900/20 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center text-center">
                    <div className="h-24 w-24 rounded-full bg-terracotta-200 dark:bg-terracotta-800 flex items-center justify-center overflow-hidden mb-4">
                        {profile.profileImage ? (
                            <img src={profile.profileImage} alt={profile.name} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-3xl font-display text-terracotta-700 dark:text-terracotta-300">
                                {profile.name?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <h1 className="font-display text-3xl font-semibold">{profile.name}</h1>
                    {profile.bio && <p className="mt-2 text-ink-950/70 dark:text-terracotta-50/70 max-w-lg">{profile.bio}</p>}
                    <p className="mt-2 text-sm text-ink-950/50 dark:text-terracotta-50/50">
                        Member since {new Date(profile.createdAt).toLocaleDateString()}
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
                        <div className="flex flex-col items-center">
                            <span className="font-semibold text-lg">{stats.approvedUploads}</span>
                            <span className="text-ink-950/60 dark:text-terracotta-50/60 flex items-center gap-1"><Image className="h-4 w-4" /> तस्वीरें/वीडियो</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-semibold text-lg">{stats.placesContributed}</span>
                            <span className="text-ink-950/60 dark:text-terracotta-50/60 flex items-center gap-1"><MapPin className="h-4 w-4" /> जगहें</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-semibold text-lg">{stats.totalLikes}</span>
                            <span className="text-ink-950/60 dark:text-terracotta-50/60 flex items-center gap-1"><Heart className="h-4 w-4" /> लाइक्स</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Memories Grid */}
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
                <h2 className="font-display text-2xl font-semibold mb-8">{profile.name} की तस्वीरें/वीडियो</h2>

                {memories.length === 0 ? (
                    <EmptyState title="अभी कोई तस्वीर/वीडियो नहीं है" message="इस यूज़र ने अभी तक कुछ अपलोड नहीं किया है।" />
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {memories.map((m, idx) => (
                            <MemoryCard key={m._id} memory={m} onClick={() => setLightboxIndex(idx)} />
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && memories[lightboxIndex] && (
                <Lightbox
                    memory={memories[lightboxIndex]}
                    currentUser={currentUser}
                    onClose={() => setLightboxIndex(null)}
                    onPrev={() => setLightboxIndex((i) => (i > 0 ? i - 1 : i))}
                    onNext={() => setLightboxIndex((i) => (i < memories.length - 1 ? i + 1 : i))}
                    onLike={() => handleLike(memories[lightboxIndex]._id, lightboxIndex)}
                    onReport={() => handleReport(memories[lightboxIndex]._id)}
                    onDelete={() => handleDeleteMemory(memories[lightboxIndex]._id)}
                    onEdit={() => handleEditMemory(memories[lightboxIndex])}
                />
            )}
        </div>
    );
}

