import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SiteLayout from "@/components/layout/SiteLayout";
const About = lazy(() => import("@/pages/About"));
import ThemeProvider from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import Protected from "@/components/auth/Protected";
import RequireRole from "@/components/auth/RequireRole";
const Academics = lazy(() => import("@/pages/Academics"));
const Research = lazy(() => import("@/pages/Research"));
const StudentLife = lazy(() => import("@/pages/StudentLife"));
const News = lazy(() => import("@/pages/News"));
const Events = lazy(() => import("@/pages/Events"));
const Faculty = lazy(() => import("@/pages/Faculty"));
const FinancialAid = lazy(() => import("@/pages/FinancialAid"));
const MedicalAid = lazy(() => import("@/pages/MedicalAid"));
const Impact = lazy(() => import("@/pages/Impact"));
const Contact = lazy(() => import("@/pages/Contact"));
const Enigma = lazy(() => import("@/pages/Enigma"));
const AdmissionsAid = lazy(() => import("@/pages/AdmissionsAid"));
const Transfer = lazy(() => import("@/pages/Transfer"));
const Portal = lazy(() => import("@/pages/Portal"));
const PortalCourses = lazy(() => import("@/pages/PortalCourses"));
const PortalCourse = lazy(() => import("@/pages/PortalCourse"));
const PortalLogin = lazy(() => import("@/pages/PortalLogin"));
const Admin = lazy(() => import("@/pages/Admin"));
const StudyCentre = lazy(() => import("@/pages/StudyCentre"));
const Administration = lazy(() => import("@/pages/Administration"));
const PhotoToVideo = lazy(() => import("@/pages/PhotoToVideo"));
const MarketingTool = lazy(() => import("@/pages/MarketingTool"));
const SmartMarketing = lazy(() => import("@/pages/SmartMarketing"));
const AcademicPlanner = lazy(() => import("@/pages/AcademicPlanner"));
const ContentManagement = lazy(() => import("@/pages/ContentManagement"));
const SocialMediaAnalytics = lazy(() => import("@/pages/SocialMediaAnalytics"));
const AskICASPage = lazy(() => import("@/pages/AskICAS"));
const OutreachManagement = lazy(() => import("@/components/admin/OutreachManagement"));
const AlumniAutomation = lazy(() => import("@/components/admin/AlumniAutomation"));


const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="container flex min-h-[50vh] items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="sr-only">Loading page…</span>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SiteLayout>
              <Suspense fallback={<PageLoader />}>
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
                <Route
                  path="/administration/outreach-management"
                  element={
                    <RequireRole role="admin">
                      <OutreachManagement />
                    </RequireRole>
                  }
                />
                <Route
                  path="/administration/alumni-automation"
                  element={
                    <RequireRole role="admin">
                      <AlumniAutomation />
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
              </Suspense>
            </SiteLayout>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
