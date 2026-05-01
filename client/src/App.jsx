import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Creators from "./pages/Creators";
import PromptDetail from "./pages/PromptDetail";
import Generate from "./pages/Generate";
import CreatorProfile from "./pages/CreatorProfile";
import Pricing from "./pages/Pricing";
import UserDashboard from "./pages/UserDashboard";
import Library from "./pages/Library";
import CreatorDashboard from "./pages/CreatorDashboard";
import UploadPrompt from "./pages/UploadPrompt";
import Payouts from "./pages/Payouts";
import AdminDashboard from "./pages/AdminDashboard";
import ManagePrompts from "./pages/ManagePrompts";
import ManageCreators from "./pages/ManageCreators";
import ManagePayouts from "./pages/ManagePayouts";
import LoginPage from "./pages/LoginPage";
import Shell from "./components/Shell";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const location = useLocation();

  return (
    <Shell>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage mode="login:buyer" />} />
            <Route path="/login/buyer" element={<LoginPage mode="login:buyer" />} />
            <Route path="/login/creator" element={<LoginPage mode="login:creator" />} />
            <Route path="/login/admin" element={<LoginPage mode="login:admin" />} />
            <Route path="/register" element={<LoginPage mode="register" />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/prompt/:id" element={<PromptDetail />} />
            <Route path="/generate/:id" element={<ProtectedRoute roles={["buyer"]}><Generate /></ProtectedRoute>} />
            <Route path="/creator/:id" element={<CreatorProfile />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/dashboard" element={<ProtectedRoute roles={["buyer"]}><UserDashboard /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute roles={["buyer"]}><Library /></ProtectedRoute>} />
            <Route path="/creator-dashboard" element={<ProtectedRoute roles={["creator", "admin"]}><CreatorDashboard /></ProtectedRoute>} />
            <Route path="/creator/analytics" element={<ProtectedRoute roles={["creator", "admin"]}><CreatorDashboard /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute roles={["creator", "admin"]}><UploadPrompt /></ProtectedRoute>} />
            <Route path="/payouts" element={<ProtectedRoute roles={["creator", "admin"]}><Payouts /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/prompts" element={<ProtectedRoute roles={["admin"]}><ManagePrompts /></ProtectedRoute>} />
            <Route path="/admin/creators" element={<ProtectedRoute roles={["admin"]}><ManageCreators /></ProtectedRoute>} />
            <Route path="/admin/payouts" element={<ProtectedRoute roles={["admin"]}><ManagePayouts /></ProtectedRoute>} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <Toaster toastOptions={{
        style: { background: "#0D1425", color: "#F1F5F9", border: "1px solid #1E2A3A", borderRadius: "10px" },
        success: { iconTheme: { primary: "#10B981", secondary: "#0D1425" } },
        error: { iconTheme: { primary: "#EF4444", secondary: "#0D1425" } },
      }} />
    </Shell>
  );
}

export default App;
