import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ReportItem from './pages/ReportItem.jsx';
import ItemDetails from './pages/ItemDetails.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MyReports from './pages/MyReports.jsx';
import MyClaims from './pages/MyClaims.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/items/:id" element={<ItemDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Pages that need login */}
          <Route path="/report" element={<ProtectedRoute><ReportItem /></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><ReportItem /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
          <Route path="/my-claims" element={<ProtectedRoute><MyClaims /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
