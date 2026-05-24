import { BrowserRouter, Routes, Route, ScrollRestoration } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { EditModeProvider } from './context/EditModeContext'

// Layout
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import AdminBar from './components/AdminBar'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import TeamPage from './pages/TeamPage'
import EventsPage from './pages/EventsPage'
import SponsorshipPage from './pages/SponsorshipPage'
import FundraisingPage from './pages/FundraisingPage'
import StellaGalleryPage from './pages/StellaGalleryPage'
import CommunityGalleryPage from './pages/CommunityGalleryPage'
import PostPage from './pages/PostPage'
import CheckoutPage from './pages/CheckoutPage'
import CheckoutSuccessPage from './pages/CheckoutSuccessPage'

// Admin
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTeamPage from './pages/admin/AdminTeamPage'
import AdminEventsPage from './pages/admin/AdminEventsPage'
import AdminFundraisingPage from './pages/admin/AdminFundraisingPage'
import AdminPostsPage from './pages/admin/AdminPostsPage'
import AdminGalleryPage from './pages/admin/AdminGalleryPage'
import AdminCommunityGalleryPage from './pages/admin/AdminCommunityGalleryPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminSponsorshipPage from './pages/admin/AdminSponsorshipPage'
import AdminPagesPage from './pages/admin/AdminPagesPage'
import AdminFacebookPhotosPage from './pages/admin/AdminFacebookPhotosPage'

function PublicLayout({ children }) {
  const { isAdmin } = useAuth()
  return (
    <EditModeProvider>
      <AdminBar />
      <Header />
      <main className={isAdmin ? 'pt-[96px]' : 'pt-[56px]'}>{children}</main>
      <Footer />
      <CartDrawer />
    </EditModeProvider>
  )
}

function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="bottom-right" />
          <Routes>
            {/* Public */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/team" element={<PublicLayout><TeamPage /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><EventsPage /></PublicLayout>} />
            <Route path="/sponsorship" element={<PublicLayout><SponsorshipPage /></PublicLayout>} />
            <Route path="/fundraising" element={<PublicLayout><FundraisingPage /></PublicLayout>} />
            <Route path="/gallery" element={<PublicLayout><StellaGalleryPage /></PublicLayout>} />
            <Route path="/community-gallery" element={<PublicLayout><CommunityGalleryPage /></PublicLayout>} />
            <Route path="/posts/:slug" element={<PublicLayout><PostPage /></PublicLayout>} />
            <Route path="/checkout" element={<PublicLayout><CheckoutPage /></PublicLayout>} />
            <Route path="/checkout/success" element={<PublicLayout><CheckoutSuccessPage /></PublicLayout>} />

            {/* Admin auth */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Admin CMS */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/pages" element={<AdminRoute><AdminPagesPage /></AdminRoute>} />
            <Route path="/admin/posts" element={<AdminRoute><AdminPostsPage /></AdminRoute>} />
            <Route path="/admin/team" element={<AdminRoute><AdminTeamPage /></AdminRoute>} />
            <Route path="/admin/events" element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
            <Route path="/admin/fundraising" element={<AdminRoute><AdminFundraisingPage /></AdminRoute>} />
            <Route path="/admin/stella-gallery" element={<AdminRoute><AdminGalleryPage galleryType="stella" /></AdminRoute>} />
            <Route path="/admin/community-gallery" element={<AdminRoute><AdminCommunityGalleryPage /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
            <Route path="/admin/sponsorship" element={<AdminRoute><AdminSponsorshipPage /></AdminRoute>} />
            <Route path="/admin/facebook-photos" element={<AdminRoute><AdminFacebookPhotosPage /></AdminRoute>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
