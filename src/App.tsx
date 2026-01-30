import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { Toaster } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import HomePage from '@/pages/HomePage';
import CalendarPage from '@/pages/CalendarPage';
import ResourcesPage from '@/pages/ResourcesPage';
import ChatPage from '@/pages/ChatPage';
import ProfilePage from '@/pages/ProfilePage';
import EditProfilePage from '@/pages/EditProfilePage';
import AccessibilitySettingsPage from '@/pages/AccessibilitySettingsPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import { useUserPreferences } from '@/hooks';

function AuthRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen mobile-viewport-fix bg-background flex flex-col items-center justify-center gap-4">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return null;
}

function AppRoutes() {
  const { user } = useAuth();
  // Apply user preferences globally
  useUserPreferences(user?.id || null);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/signin"
        element={
          <>
            <AuthRedirect />
            <SignInPage />
          </>
        }
      />
      <Route
        path="/signup"
        element={
          <>
            <AuthRedirect />
            <SignUpPage />
          </>
        }
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/profile/accessibility" element={<AccessibilitySettingsPage />} />
        <Route path="/profile/:studentId" element={<ProfilePage />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
