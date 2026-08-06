import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import About from './pages/About';
import Features from './pages/Features';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#121619',
                color: '#ffffff',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                padding: '12px 18px',
              },
              success: {
                iconTheme: {
                  primary: '#e05638',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#d93838',
                  secondary: '#ffffff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
