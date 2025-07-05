import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import AdaptPage from "@/pages/AdaptPage";
import InvitePage from "@/pages/InvitePage";
import BrandLibraryPage from "@/pages/BrandLibraryPage";
import ApiTestPage from "@/pages/ApiTestPage";
import PaymentPage from "@/pages/PaymentPage";
import LoginRegisterPage from "@/pages/LoginRegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ChangelogPage from "./pages/ChangelogPage";
import HistoryPage from "./pages/HistoryPage";
import AuthingLoginPage from "./pages/AuthingLoginPage";
import AuthTestPage from "./pages/AuthTestPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ToolLayout from "@/components/layout/ToolLayout";
import Callback from "./pages/Callback";

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* 需要登录的受保护路由 */}
          <Route path="/adapt" element={
            <ProtectedRoute>
              <ToolLayout><AdaptPage /></ToolLayout>
            </ProtectedRoute>
          } />
          <Route path="/invite" element={
            <ProtectedRoute>
              <ToolLayout><InvitePage /></ToolLayout>
            </ProtectedRoute>
          } />
          <Route path="/brand-library" element={
            <ProtectedRoute>
              <ToolLayout><BrandLibraryPage /></ToolLayout>
            </ProtectedRoute>
          } />
          <Route path="/api-test" element={<ApiTestPage />} />
          {/* Login page */}
          <Route path="/login-register" element={<LoginRegisterPage />} />
          {/* Register page - same component but different view */}
          <Route path="/register" element={<LoginRegisterPage />} />
          {/* Authing Guard 登录页面 */}
          <Route path="/authing-login" element={<AuthingLoginPage />} />
          {/* Authing 认证回调页面 */}
          <Route path="/callback" element={<Callback />} />
          {/* Authing 认证测试页面 */}
          <Route path="/auth-test" element={<AuthTestPage />} />
          <Route path="/payment" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/history" element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;