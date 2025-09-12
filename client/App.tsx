import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SiteLayout from "@/components/layout/SiteLayout";
import Placeholder from "@/components/Placeholder";
import About from "@/pages/About";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import Protected from "@/components/auth/Protected";
import RequireRole from "@/components/auth/RequireRole";
import Academics from "@/pages/Academics";
import Research from "@/pages/Research";
import StudentLife from "@/pages/StudentLife";
import News from "@/pages/News";
import Events from "@/pages/Events";
import Faculty from "@/pages/Faculty";
import FinancialAid from "@/pages/FinancialAid";
import MedicalAid from "@/pages/MedicalAid";
import Impact from "@/pages/Impact";
import Contact from "@/pages/Contact";
import Enigma from "@/pages/Enigma";
import AdmissionsAid from "@/pages/AdmissionsAid";
import Transfer from "@/pages/Transfer";
import Portal from "@/pages/Portal";
import PortalCourses from "@/pages/PortalCourses";
import PortalCourse from "@/pages/PortalCourse";
import PortalLogin from "@/pages/PortalLogin";
import Admin from "@/pages/Admin";
import StudyCentre from "@/pages/StudyCentre";
import Administration from "@/pages/Administration";
import PhotoToVideo from "@/pages/PhotoToVideo";
import MarketingTool from "@/pages/MarketingTool";
import SmartMarketing from "@/pages/SmartMarketing";
import AcademicPlanner from "@/pages/AcademicPlanner";
import ContentManagement from "@/pages/ContentManagement";
import SocialMediaAnalytics from "@/pages/SocialMediaAnalytics";
import AskICASPage from "@/pages/AskICAS";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SiteLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />

                <Route path="/academics" element={<Academics />} />
                <Route path="/research" element={<Research />} />
                <Route path="/student-life" element={<StudentLife />} />
                <Route path="/academic-planner" element={<AcademicPlanner />} />
                <Route path="/enigma" element={<Enigma />} />
                <Route path="/admissions-aid" element={<AdmissionsAid />} />
                <Route path="/transfer" element={<Transfer />} />
                <Route path="/news" element={<News />} />
                <Route path="/events" element={<Events />} />
                <Route path="/faculty" element={<Faculty />} />
                <Route path="/financial-aid" element={<FinancialAid />} />
                <Route path="/medical-aid" element={<MedicalAid />} />
                <Route path="/impact" element={<Impact />} />
                <Route path="/contact" element={<Contact />} />

                <Route path="/login" element={<PortalLogin />} />

                <Route
                  path="/admin"
                  element={
                    <RequireRole role="admin">
                      <Admin />
                    </RequireRole>
                  }
                />

                {/* Administration Tools */}
                <Route
                  path="/administration"
                  element={
                    <RequireRole role="admin">
                      <Administration />
                    </RequireRole>
                  }
                />
                <Route
                  path="/administration/photo-to-video"
                  element={
                    <RequireRole role="admin">
                      <PhotoToVideo />
                    </RequireRole>
                  }
                />
                <Route
                  path="/administration/marketing-tool"
                  element={
                    <RequireRole role="admin">
                      <MarketingTool />
                    </RequireRole>
                  }
                />
                <Route
                  path="/administration/smart-marketing"
                  element={
                    <RequireRole role="admin">
                      <SmartMarketing />
                    </RequireRole>
                  }
                />
                <Route
                  path="/administration/content-management"
                  element={
                    <RequireRole role="admin">
                      <ContentManagement />
                    </RequireRole>
                  }
                />
                <Route
                  path="/administration/social-media-analytics"
                  element={
                    <RequireRole role="admin">
                      <SocialMediaAnalytics />
                    </RequireRole>
                  }
                />

                {/* Ask ICAS Route */}
                <Route path="/ask-icas" element={<AskICASPage />} />

                <Route
                  path="/portal"
                  element={
                    <Protected>
                      <Portal />
                    </Protected>
                  }
                />
                <Route
                  path="/portal/courses"
                  element={
                    <Protected>
                      <PortalCourses />
                    </Protected>
                  }
                />
                <Route
                  path="/portal/courses/:code"
                  element={
                    <Protected>
                      <PortalCourse />
                    </Protected>
                  }
                />
                <Route
                  path="/portal/study-centre"
                  element={
                    <Protected>
                      <StudyCentre />
                    </Protected>
                  }
                />


                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SiteLayout>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
