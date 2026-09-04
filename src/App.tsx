import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Sidebar } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';
import { BottomNav } from './components/common/BottomNav';
import { LandingPage } from './components/public/LandingPage';
import { HowItWorks } from './components/public/HowItWorks';
import { Features } from './components/public/Features';
import { HelpPage } from './components/public/HelpPage';
import { AuthModal } from './components/public/AuthModal';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { SlotBookingWizard } from './components/farmer/SlotBookingWizard';
import { DigitalTokenView } from './components/farmer/DigitalTokenView';
import { DiseaseDoctor } from './components/farmer/DiseaseDoctor';
import { PricePredictor } from './components/farmer/PricePredictor';
import { AgriTechInnovations } from './components/farmer/AgriTechInnovations';
import { CropAdvisoryRecommender } from './components/farmer/CropAdvisoryRecommender';
import { BookingCalendar } from './components/farmer/BookingCalendar';
import { FarmerProfile } from './components/farmer/FarmerProfile';
import { KisanAIChatbot } from './components/farmer/KisanAIChatbot';
import { GovernmentSchemes } from './components/farmer/GovernmentSchemes';
import { Booking } from './types';

const MainApp: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [currentView, setCurrentView] = useState<string>('farmer-dashboard');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Navigate helper
  const navigate = (view: string) => {
    setCurrentView(view);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSuccess = (booking: Booking) => {
    setSelectedBooking(booking);
    navigate('token-view');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-inter selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      
      {/* Dynamic Animated Ambient Background Orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Glowing Emerald Orb */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-400/10 blur-[100px] animate-orb-1" />
        {/* Glowing Teal / Mint Orb */}
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-teal-400/10 blur-[120px] animate-orb-2" />
        {/* Glowing Soft Lime / Mint Orb */}
        <div className="absolute -bottom-32 left-1/4 w-[32rem] h-[32rem] rounded-full bg-lime-400/10 blur-[110px] animate-orb-3" />
      </div>

      {/* 1. Left Vertical Sidebar Navigation */}
      <Sidebar 
        currentView={currentView}
        onNavigate={navigate}
        onOpenAuth={() => setIsAuthOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Wrapper (Shifted right on desktop by sidebar width) */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-72 relative z-10">
        
        {/* Top Header Bar */}
        <TopBar 
          currentView={currentView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          onNavigate={navigate}
        />

        {/* Page Content View */}
        <main className="flex-1 text-slate-900">
          {currentView === 'home' && (
            <LandingPage 
              onNavigate={navigate} 
              onOpenAuth={() => setIsAuthOpen(true)} 
            />
          )}

          {currentView === 'how-it-works' && (
            <HowItWorks 
              onBack={() => navigate('farmer-dashboard')} 
              onBook={() => navigate('book-slot')} 
            />
          )}

          {currentView === 'features' && (
            <Features 
              onBack={() => navigate('farmer-dashboard')} 
              onBook={() => navigate('book-slot')} 
            />
          )}

          {currentView === 'help' && (
            <HelpPage 
              onBack={() => navigate('farmer-dashboard')} 
              onBookSlot={() => navigate('book-slot')}
            />
          )}

          {/* Farmer Core Views */}
          {currentView === 'farmer-dashboard' && (
            <FarmerDashboard 
              onNavigate={navigate}
              onSelectBooking={(b) => setSelectedBooking(b)}
            />
          )}

          {currentView === 'book-slot' && (
            <SlotBookingWizard 
              onBack={() => navigate('farmer-dashboard')}
              onBookingSuccess={handleBookingSuccess}
            />
          )}

          {currentView === 'price-predictor' && (
            <PricePredictor 
              onBack={() => navigate('farmer-dashboard')}
              onBookSlot={() => navigate('book-slot')}
            />
          )}

          {currentView === 'agritech' && (
            <AgriTechInnovations onNavigate={navigate} />
          )}

          {currentView === 'token-view' && (
            <DigitalTokenView 
              booking={selectedBooking}
              onBack={() => navigate('farmer-dashboard')}
              onViewCalendar={() => navigate('calendar')}
            />
          )}

          {currentView === 'disease-doctor' && (
            <DiseaseDoctor onBack={() => navigate('farmer-dashboard')} />
          )}

          {currentView === 'crop-advisory' && (
            <CropAdvisoryRecommender 
              onBack={() => navigate('farmer-dashboard')} 
              onBookSlot={() => navigate('book-slot')} 
            />
          )}

          {currentView === 'calendar' && (
            <BookingCalendar 
              onBack={() => navigate('farmer-dashboard')}
              onSelectBooking={(b) => {
                setSelectedBooking(b);
                navigate('token-view');
              }}
            />
          )}

          {currentView === 'profile' && (
            <FarmerProfile onBack={() => navigate('farmer-dashboard')} />
          )}

          {currentView === 'government-schemes' && (
            <GovernmentSchemes 
              onBack={() => navigate('farmer-dashboard')} 
              onBookSlot={() => navigate('book-slot')} 
            />
          )}
        </main>
      </div>

      {/* Floating KisanAI Assistant Drawer with Voice Input & Speaker Output */}
      <KisanAIChatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      {/* Auth Modal with Email / Mobile Login & Custom Farmer Details Registration */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => navigate('farmer-dashboard')}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav currentView={currentView} onNavigate={navigate} />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
