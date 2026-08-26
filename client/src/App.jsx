import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Explore from './pages/Explore';
import History from './pages/History';
import PlaceDetails from './pages/PlaceDetails';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import AnnouncementBanner from './components/AnnouncementBanner';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/history" element={<History />} />
          <Route path="/places/:slug" element={<PlaceDetails />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
