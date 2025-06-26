import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import AdaptPage from "@/pages/AdaptPage";
import InvitePage from "@/pages/InvitePage";
import BrandLibraryPage from "@/pages/BrandLibraryPage";
import ApiTestPage from "@/pages/ApiTestPage";
import RegisterPage from "@/pages/RegisterPage";
import PaymentPage from "@/pages/PaymentPage";
import LoginRegisterPage from "@/pages/LoginRegisterPage";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ToolLayout from "@/components/layout/ToolLayout";

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/adapt" element={<ToolLayout><AdaptPage /></ToolLayout>} />
          <Route path="/invite" element={<ToolLayout><InvitePage /></ToolLayout>} />
          <Route path="/brand-library" element={<ToolLayout><BrandLibraryPage /></ToolLayout>} />
          <Route path="/api-test" element={<ApiTestPage />} />
          {/* Combined login and register page */}
          <Route path="/login-register" element={<LoginRegisterPage />} />
          {/* Keep register route for backward compatibility */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;