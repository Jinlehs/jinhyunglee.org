import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Blog from "./components/Blog";
import BlogPost from "./components/BlogPost";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminStocks from "./components/AdminStocks";

// Facilities — public
import FacilitiesHome from "./components/facilities/FacilitiesHome";
import FacilitiesList from "./components/facilities/FacilitiesList";
import FacilityDetail from "./components/facilities/FacilityDetail";
import BookingWizard from "./components/facilities/BookingWizard";
import BookingConfirmation from "./components/facilities/BookingConfirmation";

// Facilities — admin
import AdminFacilitiesHub from "./components/admin/AdminFacilitiesHub";
import AdminLocations from "./components/admin/AdminLocations";
import AdminFacilitiesList from "./components/admin/AdminFacilitiesList";
import AdminSchedules from "./components/admin/AdminSchedules";
import AdminBookings from "./components/admin/AdminBookings";
import AdminBookingDetail from "./components/admin/AdminBookingDetail";
import AdminPaymentSettings from "./components/admin/AdminPaymentSettings";
import AdminPromoCodes from "./components/admin/AdminPromoCodes";
import AdminAnalytics from "./components/admin/AdminAnalytics";

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Contact />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Routes>
          {/* Portfolio */}
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          {/* Admin — core */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/stocks" element={<AdminStocks />} />

          {/* Admin — facilities hub */}
          <Route path="/admin/facilities" element={<AdminFacilitiesHub />} />
          <Route path="/admin/facilities/locations" element={<AdminLocations />} />
          <Route path="/admin/facilities/locations/new" element={<AdminLocations />} />
          <Route path="/admin/facilities/locations/edit/:locationId" element={<AdminLocations />} />
          <Route path="/admin/facilities/list" element={<AdminFacilitiesList />} />
          <Route path="/admin/facilities/list/new" element={<AdminFacilitiesList />} />
          <Route path="/admin/facilities/list/edit/:facilityId" element={<AdminFacilitiesList />} />
          <Route path="/admin/facilities/schedules" element={<AdminSchedules />} />
          <Route path="/admin/facilities/bookings" element={<AdminBookings />} />
          <Route path="/admin/facilities/bookings/:bookingId" element={<AdminBookingDetail />} />
          <Route path="/admin/facilities/payment-settings" element={<AdminPaymentSettings />} />
          <Route path="/admin/facilities/promo-codes" element={<AdminPromoCodes />} />
          <Route path="/admin/facilities/analytics" element={<AdminAnalytics />} />

          {/* Public — facilities */}
          <Route path="/facilities" element={<FacilitiesHome />} />
          <Route path="/facilities/browse" element={<FacilitiesList />} />
          <Route path="/facilities/confirmation" element={<BookingConfirmation />} />
          <Route path="/facilities/:id" element={<FacilityDetail />} />
          <Route path="/facilities/:id/book" element={<BookingWizard />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
