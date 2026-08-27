import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, MapPin, UploadCloud, X, CheckCircle2, ArrowLeft, ArrowRight, Archive } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Location', 'Media', 'Details', 'Review'];

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // Location
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [suggestingNew, setSuggestingNew] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: '', state: '', district: '', area: '', description: '' });

  // Media
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Details
  const [details, setDetails] = useState({ caption: '', story: '', dateCaptured: '', tags: '', featuredLabel: '' });

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold">फोटो/वीडियो शेयर करने के लिए लॉग इन करें</h1>
        <p className="mt-2 text-ink-950/60 dark:text-terracotta-50/60">तस्वीरें और वीडियो अपलोड करने के लिए अकाउंट बनाएं।</p>
        <button onClick={() => navigate('/login')} className="btn-primary mt-6">Log in</button>
      </div>
    );
  }

  const searchPlaces = async (val) => {
    setPlaceQuery(val);
    if (!val.trim()) return setPlaceResults([]);
    const res = await api.get('/places/search-suggestions', { params: { q: val } });
    setPlaceResults(res.data.data);
  };

  const submitSuggestion = async () => {
    if (!newPlace.name.trim()) return toast.error('Please enter a place name.');
    try {
      await api.post('/place-suggestions', newPlace);
      toast.success('Place suggested! An admin will review it. You can pick an existing place for now.');
      setSuggestingNew(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleFileSelect = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const newFiles = [];
    const newPreviews = [];

    Array.from(selectedFiles).forEach(f => {
      const isImage = f.type.startsWith('image/');
      const isVideo = f.type.startsWith('video/');
      if (!isImage && !isVideo) {
        toast.error(`${f.name} is not an image or video.`);
        return;
      }
      const maxMB = isImage ? 15 : 100;
      if (f.size > maxMB * 1024 * 1024) {
        toast.error(`${f.name} is too large. Max ${maxMB}MB.`);
        return;
      }
      newFiles.push(f);
      newPreviews.push(URL.createObjectURL(f));
    });

    setFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedPlace && details.featuredLabel !== 'historical') return toast.error('Please select a place.');
    if (files.length === 0) return toast.error('Please choose at least one photo or video.');
    if (!details.caption || !details.dateCaptured) return toast.error('Caption and date captured are required.');

    setSubmitting(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      setCurrentFileIndex(i + 1);
      setProgress(0);
      
      const f = files[i];
      const formData = new FormData();
      formData.append('media', f);
      if (selectedPlace) formData.append('placeId', selectedPlace._id);
      formData.append('caption', details.caption);
      formData.append('story', details.story);
      formData.append('dateCaptured', details.dateCaptured);
      formData.append('tags', details.tags);
      if (details.featuredLabel) formData.append('featuredLabel', details.featuredLabel);

      try {
        await api.post('/memories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (evt) => setProgress(Math.round((evt.loaded / evt.total) * 100)),
        });
        successCount++;
      } catch (err) {
        toast.error(`Failed to upload ${f.name}: ${err.message}`);
      }
    }
    
    setSubmitting(false);
    if (successCount > 0) setDone(true);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <CheckCircle2 className="mx-auto h-14 w-14 text-terracotta-600" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Memory submitted!</h1>
        <p className="mt-2 text-ink-950/60 dark:text-terracotta-50/60">
          {details.featuredLabel === 'historical' ? 
            'Thank you for preserving a piece of Kashichak\'s history. It is now visible in the History section.' : 
            `Thank you for preserving a piece of ${selectedPlace?.name}'s story. It will become publicly visible once an admin reviews it.`}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {selectedPlace ? (
            <button onClick={() => navigate(`/places/${selectedPlace.slug}`)} className="btn-secondary">View place</button>
          ) : (
            <button onClick={() => navigate('/history')} className="btn-secondary">View history</button>
          )}
          <button onClick={() => window.location.reload()} className="btn-primary">Share another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">फोटो / वीडियो जोड़ें</h1>
      <p className="mt-2 text-ink-950/60 dark:text-terracotta-50/60">Uploading as {user.name}.</p>

      {/* Stepper */}
      <div className="mt-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              i <= step ? 'bg-terracotta-600 text-white' : 'bg-terracotta-100 text-terracotta-500 dark:bg-terracotta-900/40'
            }`}>{i + 1}</div>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? 'bg-terracotta-600' : 'bg-terracotta-100 dark:bg-terracotta-900/40'}`} />}
          </div>
        ))}
      </div>

      <div className="card mt-8 p-6">
        {step === 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold">जगह चुनें (Select the place)</h2>
            
            {user?.role === 'admin' && !suggestingNew && (
              <div className="mt-4 mb-6 p-5 rounded-2xl bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 shadow-sm">
                <h3 className="font-semibold text-orange-800 dark:text-orange-300">Admin Action</h3>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-1 mb-4">Uploading an old Kashichak photo that doesn't belong to a specific place?</p>
                <button 
                  onClick={() => {
                    setDetails({ ...details, featuredLabel: 'historical' });
                    setSelectedPlace(null);
                    setStep(1);
                  }} 
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                >
                  <Archive className="h-4 w-4" /> Direct Upload to History (इतिहास)
                </button>
              </div>
            )}

            {!suggestingNew ? (
              <>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-terracotta-200 dark:border-terracotta-800 px-4 py-3">
                  <Search className="h-4 w-4 text-terracotta-400" />
                  <input value={placeQuery} onChange={(e) => searchPlaces(e.target.value)} placeholder="जगह का नाम खोजें (Search place)..." className="w-full bg-transparent text-sm outline-none" />
                </div>
                <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
                  {placeResults.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => setSelectedPlace(p)}
                      className={`flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm ${selectedPlace?._id === p._id ? 'bg-terracotta-100 dark:bg-terracotta-900/40' : 'hover:bg-terracotta-50 dark:hover:bg-terracotta-900/20'}`}
                    >
                      <MapPin className="h-4 w-4 text-terracotta-400" />
                      {p.name}
                      <span className="ml-auto text-xs text-ink-950/40 dark:text-terracotta-50/40">{[p.area, p.district, p.state].filter(Boolean).join(', ')}</span>
                    </button>
                  ))}
                </div>
                {selectedPlace && (
                  <p className="mt-3 text-sm text-terracotta-600">Selected: {selectedPlace.name}</p>
                )}
                <button onClick={() => setSuggestingNew(true)} className="mt-4 text-sm font-medium text-terracotta-600 hover:underline">
                  जगह नहीं मिली? नई जगह का नाम बताएं →
                </button>
              </>
            ) : (
              <div className="mt-4 space-y-3">
                <input value={newPlace.name} onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })} placeholder="Place name" className="input" />
                <div className="grid grid-cols-3 gap-3">
                  <input value={newPlace.state} onChange={(e) => setNewPlace({ ...newPlace, state: e.target.value })} placeholder="State" className="input" />
                  <input value={newPlace.district} onChange={(e) => setNewPlace({ ...newPlace, district: e.target.value })} placeholder="District" className="input" />
                  <input value={newPlace.area} onChange={(e) => setNewPlace({ ...newPlace, area: e.target.value })} placeholder="Area/Village" className="input" />
                </div>
                <textarea value={newPlace.description} onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })} placeholder="Short description (optional)" className="input" rows={3} />
                <div className="flex gap-3">
                  <button onClick={submitSuggestion} className="btn-primary">Submit suggestion</button>
                  <button onClick={() => setSuggestingNew(false)} className="btn-secondary">Back to search</button>
                </div>
                <p className="text-xs text-ink-950/50 dark:text-terracotta-50/50">This goes to an admin for approval — pick an existing place to continue uploading now.</p>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-lg font-semibold">अपनी फोटो या वीडियो चुनें</h2>
            
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative aspect-square overflow-hidden rounded-xl border border-terracotta-200 dark:border-terracotta-800 bg-black">
                    {files[idx].type.startsWith('video/') ? (
                      <video src={src} className="h-full w-full object-cover" />
                    ) : (
                      <img src={src} alt="preview" className="h-full w-full object-cover" />
                    )}
                    <button onClick={() => removeFile(idx)} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white shadow-sm" aria-label="Remove file">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-terracotta-300 dark:border-terracotta-800 text-terracotta-500 hover:bg-terracotta-50 dark:hover:bg-terracotta-900/20"
                >
                  <UploadCloud className="h-6 w-6" />
                  <span className="mt-2 text-xs font-medium">और जोड़ें</span>
                </button>
              </div>
            )}

            {files.length === 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-terracotta-300 dark:border-terracotta-800 py-16 text-terracotta-500 hover:bg-terracotta-50 dark:hover:bg-terracotta-900/20"
              >
                <UploadCloud className="h-10 w-10" />
                <p className="mt-3 text-sm font-medium">फाइल चुनने के लिए क्लिक करें</p>
                <p className="mt-1 text-xs text-ink-950/40 dark:text-terracotta-50/40">JPG, PNG, WEBP up to 15MB · MP4, MOV, WEBM up to 100MB</p>
                <p className="mt-1 text-xs text-terracotta-600 dark:text-terracotta-400 font-medium">You can select multiple files</p>
              </button>
            )}
            
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => handleFileSelect(e.target.files)} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold">इसके बारे में बताएं</h2>
            <input value={details.caption} onChange={(e) => setDetails({ ...details, caption: e.target.value })} placeholder="फोटो/वीडियो का नाम (Caption)" maxLength={150} className="input" />
            <textarea value={details.story} onChange={(e) => setDetails({ ...details, story: e.target.value })} placeholder="इसके पीछे की कहानी (Story)..." rows={4} className="input" />
            <input type="date" value={details.dateCaptured} onChange={(e) => setDetails({ ...details, dateCaptured: e.target.value })} className="input" max={new Date().toISOString().split('T')[0]} />
            <input value={details.tags} onChange={(e) => setDetails({ ...details, tags: e.target.value })} placeholder="Tags (जैसे: railway, festival)" className="input" />
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-lg font-semibold">चेक करें और अपलोड करें (Review)</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-950/50 dark:text-terracotta-50/50">Place</dt><dd className="font-medium">{details.featuredLabel === 'historical' ? 'History Archive' : selectedPlace?.name}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-950/50 dark:text-terracotta-50/50">Caption</dt><dd className="font-medium">{details.caption}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-950/50 dark:text-terracotta-50/50">Date captured</dt><dd className="font-medium">{details.dateCaptured}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-950/50 dark:text-terracotta-50/50">Files</dt><dd className="font-medium">{files.length} selected</dd></div>
            </dl>
            {submitting && (
              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-terracotta-100 dark:bg-terracotta-900/40">
                  <div className="h-full bg-terracotta-600 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-ink-950/50 dark:text-terracotta-50/50">
                  {files.length > 1 ? `Uploading file ${currentFileIndex} of ${files.length}… ${progress}%` : `Uploading… ${progress}%`}
                </p>
              </div>
            )}
            <p className="mt-4 text-xs text-ink-950/50 dark:text-terracotta-50/50">
              Your memory will be pending review and become publicly visible once an admin approves it.
            </p>
          </div>
        )}

        {/* Nav */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-secondary disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 0 && !selectedPlace && details.featuredLabel !== 'historical') return toast.error('Please select a place first.');
                if (step === 1 && files.length === 0) return toast.error('Please choose at least one file first.');
                setStep((s) => Math.min(3, s + 1));
              }}
              className="btn-primary"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting…' : `Submit ${files.length > 1 ? 'Memories' : 'Memory'}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
