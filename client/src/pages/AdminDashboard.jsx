import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Users,
  MapPin,
  Image,
  Video,
  Clock,
  HardDrive,
  Check,
  X,
} from 'lucide-react';

import api from '../services/api';
import EmptyState from '../components/EmptyState';
import { Spinner } from '../components/Loader';

const TABS = [
  'Overview',
  'Pending Uploads',
  'Place Suggestions',
  'Reports',
  'Manage Places',
  'Manage Memories',
  'Announcements',
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [overview, setOverview] = useState(null);
  const [pending, setPending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [reports, setReports] = useState([]);
  const [places, setPlaces] = useState([]);
  const [allMemories, setAllMemories] = useState([]);
  const [announcement, setAnnouncement] = useState({ message: '', isActive: false, backgroundColor: 'bg-terracotta-600', link: '' });
  const [loading, setLoading] = useState(true);

  const loadTab = async (selectedTab) => {
    setLoading(true);

    try {
      if (selectedTab === 'Overview') {
        const response = await api.get('/admin/overview');
        setOverview(response.data.data);
      }

      if (selectedTab === 'Pending Uploads') {
        const response = await api.get('/admin/memories/pending');
        setPending(response.data.data);
      }

      if (selectedTab === 'Place Suggestions') {
        const response = await api.get('/place-suggestions', {
          params: { status: 'pending' },
        });
        setSuggestions(response.data.data);
      }

      if (selectedTab === 'Reports') {
        const response = await api.get('/reports', {
          params: { status: 'pending' },
        });
        setReports(response.data.data);
      }

      if (selectedTab === 'Manage Places') {
        const response = await api.get('/places', { params: { limit: 100 } });
        setPlaces(response.data.data);
      }

      if (selectedTab === 'Manage Memories') {
        const response = await api.get('/memories', { params: { limit: 100 } });
        setAllMemories(response.data.data);
      }

      if (selectedTab === 'Announcements') {
        const response = await api.get('/announcement');
        if (response.data.data) setAnnouncement(response.data.data);
      }
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
        err.message ||
        'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTab(tab);
  }, [tab]);

  const approveMemory = async (id) => {
    try {
      await api.post(`/admin/memories/${id}/approve`);

      toast.success('Memory approved.');

      setPending((currentPending) =>
        currentPending.filter((memory) => memory._id !== id)
      );
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
        'Failed to approve memory'
      );
    }
  };

  const rejectMemory = async (id) => {
    try {
      const reason =
        prompt('Reason for rejection (optional):') || '';

      await api.post(
        `/admin/memories/${id}/reject`,
        { reason }
      );

      toast.success('Memory rejected.');

      setPending((currentPending) =>
        currentPending.filter((memory) => memory._id !== id)
      );
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
        'Failed to reject memory'
      );
    }
  };

  const approveSuggestion = async (id) => {
    try {
      await api.post(`/place-suggestions/${id}/approve`);

      toast.success('Place created from suggestion.');

      setSuggestions((currentSuggestions) =>
        currentSuggestions.filter(
          (suggestion) => suggestion._id !== id
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
        'Failed to approve suggestion'
      );
    }
  };

  const rejectSuggestion = async (id) => {
    try {
      await api.post(
        `/place-suggestions/${id}/reject`,
        { reason: '' }
      );

      toast.success('Suggestion rejected.');

      setSuggestions((currentSuggestions) =>
        currentSuggestions.filter(
          (suggestion) => suggestion._id !== id
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
        'Failed to reject suggestion'
      );
    }
  };

  const resolveReport = async (id, resolution) => {
    try {
      await api.post(
        `/reports/${id}/resolve`,
        { resolution }
      );

      toast.success('Report resolved.');

      setReports((currentReports) =>
        currentReports.filter(
          (report) => report._id !== id
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
        'Failed to resolve report'
      );
    }
  };

  const handleEditPlace = async (place) => {
    const newName = window.prompt('Enter new name:', place.name);
    if (newName === null) return;
    const newDesc = window.prompt('Enter new description:', place.description || '');
    if (newDesc === null) return;

    try {
      await api.put(`/places/${place._id}`, { name: newName, description: newDesc });
      toast.success('Place updated.');
      loadTab('Manage Places');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDeletePlace = async (id) => {
    if (!window.confirm('Are you sure you want to delete this place? This cannot be undone.')) return;
    try {
      await api.delete(`/places/${id}`);
      toast.success('Place deleted.');
      setPlaces((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleEditMemory = async (memory) => {
    const newCaption = window.prompt('Enter new caption:', memory.caption);
    if (newCaption === null) return;
    const newStory = window.prompt('Enter new story:', memory.story || '');
    if (newStory === null) return;

    try {
      await api.put(`/memories/${memory._id}`, { caption: newCaption, story: newStory });
      toast.success('Memory updated.');
      loadTab('Manage Memories');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteMemory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    try {
      await api.delete(`/memories/${id}`);
      toast.success('Memory deleted.');
      setAllMemories((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.put('/announcement', announcement);
      toast.success('Announcement saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const stats = overview
    ? [
      {
        label: 'Users',
        value: overview.totalUsers,
        icon: Users,
      },
      {
        label: 'Places',
        value: overview.totalPlaces,
        icon: MapPin,
      },
      {
        label: 'Photos',
        value: overview.totalPhotos,
        icon: Image,
      },
      {
        label: 'Videos',
        value: overview.totalVideos,
        icon: Video,
      },
      {
        label: 'Pending Uploads',
        value: overview.pendingUploads,
        icon: Clock,
      },
      {
        label: 'Storage Used',
        value: `${overview.storageUsedMB} MB`,
        icon: HardDrive,
      },
    ]
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">
        Admin Dashboard
      </h1>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-terracotta-100 dark:border-terracotta-900/40">
        {TABS.map((currentTab) => (
          <button
            key={currentTab}
            onClick={() => setTab(currentTab)}
            className={`px-4 py-2.5 text-sm font-medium ${tab === currentTab
              ? 'border-b-2 border-terracotta-600 text-terracotta-600'
              : 'text-ink-950/50 dark:text-terracotta-50/50'
              }`}
          >
            {currentTab}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-8 w-8" />
          </div>

          /* Overview */
        ) : tab === 'Overview' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="card p-4 text-center"
              >
                <stat.icon className="mx-auto h-5 w-5 text-terracotta-500" />

                <p className="mt-2 text-xl font-semibold">
                  {stat.value}
                </p>

                <p className="text-xs text-ink-950/50 dark:text-terracotta-50/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          /* Pending Uploads */
        ) : tab === 'Pending Uploads' ? (
          pending.length === 0 ? (
            <EmptyState
              title="Nothing pending"
              message="All uploads have been reviewed."
            />
          ) : (
            <div className="space-y-4">
              {pending.map((memory) => (
                <div
                  key={memory._id}
                  className="card flex flex-col gap-4 p-4 sm:flex-row"
                >
                  {/* MEDIA PREVIEW */}
                  <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-black/10 sm:w-56">

                    {memory.mediaType === 'video' ? (
                      <video
                        src={memory.mediaUrl}
                        controls
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={
                          memory.thumbnailUrl ||
                          `https://drive.google.com/thumbnail?id=${memory.googleDriveFileId}&sz=w800`
                        }
                        alt={memory.caption || 'Uploaded image'}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          console.error(
                            'Thumbnail failed:',
                            event.currentTarget.src
                          );

                          event.currentTarget.src =
                            `https://drive.google.com/thumbnail?id=${memory.googleDriveFileId}&sz=w400`;
                        }}
                      />
                    )}

                  </div>

                  {/* MEMORY DETAILS */}
                  <div className="flex-1">
                    <p className="font-medium">
                      {memory.caption || 'Untitled memory'}
                    </p>

                    {memory.story && (
                      <p className="mt-1 text-sm text-ink-950/60 dark:text-terracotta-50/60">
                        {memory.story}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-ink-950/40 dark:text-terracotta-50/40">
                      By {memory.uploader?.name || 'Unknown'}
                      {memory.uploader?.email &&
                        ` (${memory.uploader.email})`}
                      {' · '}
                      Place: {memory.place?.name || 'Unknown'}
                      {' · '}
                      Captured{' '}
                      {memory.dateCaptured
                        ? new Date(
                          memory.dateCaptured
                        ).toLocaleDateString()
                        : 'Unknown'}
                    </p>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() =>
                          approveMemory(memory._id)
                        }
                        className="btn-primary flex items-center gap-1 py-2 px-4 text-xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          rejectMemory(memory._id)
                        }
                        className="btn-secondary flex items-center gap-1 py-2 px-4 text-xs"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )

          /* Place Suggestions */
        ) : tab === 'Place Suggestions' ? (
          suggestions.length === 0 ? (
            <EmptyState title="No pending suggestions" />
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion._id}
                  className="card flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-medium">
                      {suggestion.name}
                    </p>

                    <p className="text-xs text-ink-950/50 dark:text-terracotta-50/50">
                      {[
                        suggestion.locationHierarchy?.area,
                        suggestion.locationHierarchy?.district,
                        suggestion.locationHierarchy?.state,
                      ]
                        .filter(Boolean)
                        .join(', ')}

                      {' · '}
                      Suggested by{' '}
                      {suggestion.suggestedBy?.name || 'Unknown'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        approveSuggestion(suggestion._id)
                      }
                      className="btn-primary py-2 px-4 text-xs"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        rejectSuggestion(suggestion._id)
                      }
                      className="btn-secondary py-2 px-4 text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )

          /* Reports */
        ) : tab === 'Reports' ? (
          reports.length === 0 ? (
            <EmptyState title="No pending reports" />
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="card p-4"
                >
                  <p className="font-medium">
                    {report.memory?.caption || 'Unknown memory'}
                  </p>

                  <p className="text-xs text-ink-950/50 dark:text-terracotta-50/50">
                    Reason: {report.reason}
                    {' · '}
                    Reported by{' '}
                    {report.reportedBy?.name || 'Unknown'}
                  </p>

                  {report.description && (
                    <p className="mt-1 text-sm">
                      {report.description}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        resolveReport(report._id, 'removed')
                      }
                      className="btn-secondary py-2 px-4 text-xs"
                    >
                      Remove content
                    </button>

                    <button
                      onClick={() =>
                        resolveReport(report._id, 'kept')
                      }
                      className="btn-secondary py-2 px-4 text-xs"
                    >
                      Keep content
                    </button>

                    <button
                      onClick={() =>
                        resolveReport(report._id, 'warned')
                      }
                      className="btn-secondary py-2 px-4 text-xs"
                    >
                      Warn user
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === 'Manage Places' ? (
          places.length === 0 ? (
            <EmptyState title="No places found" />
          ) : (
            <div className="space-y-3">
              {places.map((place) => (
                <div key={place._id} className="card flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{place.name}</p>
                    <p className="text-xs text-ink-950/50 dark:text-terracotta-50/50">
                      {[place.area, place.district, place.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditPlace(place)} className="btn-secondary py-2 px-4 text-xs">Edit</button>
                    <button onClick={() => handleDeletePlace(place._id)} className="btn-secondary py-2 px-4 text-xs text-red-500">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === 'Manage Memories' ? (
          allMemories.length === 0 ? (
            <EmptyState title="No memories found" />
          ) : (
            <div className="space-y-4">
              {allMemories.map((memory) => (
                <div key={memory._id} className="card flex flex-col gap-4 p-4 sm:flex-row">
                  <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-black/10 sm:w-56">
                    {memory.mediaType === 'video' ? (
                      <video src={memory.mediaUrl} controls className="h-full w-full object-cover" />
                    ) : (
                      <img src={memory.thumbnailUrl || memory.mediaUrl} alt={memory.caption} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{memory.caption || 'Untitled memory'}</p>
                    <p className="mt-2 text-xs text-ink-950/40 dark:text-terracotta-50/40">
                      By {memory.uploader?.name || 'Unknown'} · Place: {memory.place?.name || 'Unknown'}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleEditMemory(memory)} className="btn-secondary py-2 px-4 text-xs">Edit</button>
                      <button onClick={() => handleDeleteMemory(memory._id)} className="btn-secondary py-2 px-4 text-xs text-red-500">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === 'Announcements' ? (
          <div className="card p-6 max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Global Announcement Banner</h2>
            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <input 
                  type="text" 
                  value={announcement.message} 
                  onChange={(e) => setAnnouncement({...announcement, message: e.target.value})} 
                  className="input w-full"
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={announcement.isActive}
                  onChange={(e) => setAnnouncement({...announcement, isActive: e.target.checked})}
                  className="h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Banner Active (Show to everyone)</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Background Color (Tailwind Class)</label>
                <select 
                  value={announcement.backgroundColor}
                  onChange={(e) => setAnnouncement({...announcement, backgroundColor: e.target.value})}
                  className="input w-full"
                >
                  <option value="bg-terracotta-600">Terracotta (Primary)</option>
                  <option value="bg-pink-600">Pink (Festival)</option>
                  <option value="bg-blue-600">Blue (Notice)</option>
                  <option value="bg-green-600">Green (Success)</option>
                  <option value="bg-red-600">Red (Urgent)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Optional Link (URL)</label>
                <input 
                  type="text" 
                  value={announcement.link} 
                  onChange={(e) => setAnnouncement({...announcement, link: e.target.value})} 
                  className="input w-full"
                  placeholder="https://..."
                />
              </div>
              <button type="submit" className="btn-primary w-full py-2">Save Announcement</button>
            </form>

            <div className="mt-8 border-t border-terracotta-100 dark:border-terracotta-900/40 pt-6">
              <h3 className="text-sm font-medium text-ink-950/60 dark:text-terracotta-50/60 mb-2">Live Preview</h3>
              <div className={`${announcement.backgroundColor} text-white px-4 py-2 text-center text-sm font-medium rounded-md`}>
                {announcement.message}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}