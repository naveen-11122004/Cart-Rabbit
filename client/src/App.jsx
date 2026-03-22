import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppContent = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/chat"
      element={
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      }
    />
    <Route path="/" element={<Navigate to="/chat" />} />
    {/* Catch-all redirect */}
    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
);

function App() {
  React.useEffect(() => {
    // Apply initial settings from localStorage
    const darkMode = localStorage.getItem('wa_dark') === 'true';
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');

    const fontSize = localStorage.getItem('wa_font_size') || 'medium';
    const sizes = { small: '13px', medium: '15px', large: '17px' };
    document.documentElement.style.setProperty('--chat-font-size', sizes[fontSize] || '15px');
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
