import { useState, useEffect } from "react";
import { DashboardFilters } from "@/app/components/DashboardFilters";
import { KPIGrid } from "@/app/components/KPIGridNew";
import { LevelWarningModal } from "@/app/components/LevelWarningModal";
import { RedKPIReportModal } from "@/app/components/RedKPIReportModal";
import { Settings } from "@/app/components/Settings";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { SkeletonFilterBar, SkeletonGrid } from "@/app/components/SkeletonLoader";
import { LoginPage } from "@/app/components/LoginPage";
import { OnboardingModal } from "@/app/components/OnboardingModal";
import { OnboardingTour } from "@/app/components/OnboardingTour";

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Onboarding state
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showOnboardingTour, setShowOnboardingTour] = useState(false);
  
  // Aktive Werte, die ans Dashboard übergeben werden
  const [nutzergruppe, setNutzergruppe] = useState<string>("");
  const [level, setLevel] = useState<string>("Keine Angabe");
  const [format, setFormat] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventCount, setEventCount] = useState<string>("");
  
  const [hasStarted, setHasStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dontShowModalAgain, setDontShowModalAgain] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Red KPI Report Modal state
  const [showRedKPIModal, setShowRedKPIModal] = useState(false);
  const [hasShownRedKPIModal, setHasShownRedKPIModal] = useState(false);
  
  // Card order state - nur temporär, wird bei Start zurückgesetzt wenn kein Favorit aktiv
  const [cardOrder, setCardOrder] = useState<{
    organizer?: string[];
    auftraggeber?: string[];
    techniker?: string[];
  }>({});

  // Initial loading simulation - nur wenn authentifiziert
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        
        // Check if onboarding should be shown
        const skipOnboarding = localStorage.getItem("skipOnboarding");
        if (!skipOnboarding) {
          setShowOnboardingModal(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setHasStarted(false);
    setIsLoading(true);
  };
  
  const handleStartOnboardingTour = () => {
    setShowOnboardingModal(false);
    setShowOnboardingTour(true);
  };
  
  const handleCloseOnboardingModal = () => {
    setShowOnboardingModal(false);
  };
  
  const handleCompleteOnboardingTour = () => {
    setShowOnboardingTour(false);
  };
  
  const handleManualStartTour = () => {
    setShowOnboardingTour(true);
  };

  // Reset modal flag when any filter changes
  useEffect(() => {
    setHasShownRedKPIModal(false);
    setShowRedKPIModal(false);
  }, [nutzergruppe, level, format, startDate, endDate, eventCount]);

  const handleStart = (
    tempNutzergruppe: string,
    tempLevel: string,
    tempFormat: string,
    tempStartDate: string,
    tempEndDate: string,
    tempEventCount: string,
    resetCardOrder: boolean = false
  ) => {
    // Wenn kein Favorit aktiv ist, Card Order zurücksetzen
    if (resetCardOrder) {
      setCardOrder({});
    }
    
    // Temporäre Werte in aktive Werte übernehmen
    setNutzergruppe(tempNutzergruppe);
    setFormat(tempFormat);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setEventCount(tempEventCount);

    // Wenn "Keine Angabe" als Level ausgewählt ist und die Meldung nicht unterdrückt wurde
    if (tempLevel === "Keine Angabe" && !dontShowModalAgain) {
      setShowModal(true);
      setLevel("Gering"); // Automatisch auf "Gering" setzen
    } else {
      setLevel(tempLevel);
    }
    
    setHasStarted(true);
    
    // Always show Red KPI Report if "Leitender Angestellter" is selected
    if (tempNutzergruppe === "Leitender Angestellter") {
      // Small delay to ensure state is updated
      setTimeout(() => {
        setShowRedKPIModal(true);
        setHasShownRedKPIModal(true);
      }, 100);
    }
  };

  const handleDontShowAgain = (dontShow: boolean) => {
    setDontShowModalAgain(dontShow);
  };
  
  const getRedKPIs = () => {
    // Static list of red KPIs for "Leitender Angestellter"
    return [
      {
        title: 'Stornierungsquote',
        value: '50%',
        tooltipContent: `Darstellung einer Kennzahl zum Anteil der stornierten Anmeldungen.\n\nInterpretationsstütze:\nGrün = <= 15%\nGelb = 16 – 25%\nRot = >= 26%\n\nBerechnung:\n= (Stornierungen / angemeldete Teilnehmer) *100`
      },
      {
        title: 'Technikkompatibilität (Location)',
        value: 'Ø50%',
        tooltipContent: `Darstellung einer Kennzahl, die aussagt zu welchem Grad die Technische Ausstattung passend zur Location war.\nInterpretationshilfe:\nGrün= >= 95%\nGelb = 94 – 60%\nRot= <= 59%\n\nBerechnung:\n-> Durchschnitt gewichteter Faktoren in Prozent`
      },
      {
        title: 'Technikkompatibilität (Format)',
        value: 'Ø50%',
        tooltipContent: `Darstellung einer Kennzahl, die aussagt zu welchem Grad die Technische Ausstattung passend zum Veranstaltungsformat war.\nInterpretationshilfe:\nGrün= >= 95%\nGelb = 94 – 60%\nRot= <= 59%\n\nBerechnung:\n-> Durchschnitt gewichteter Faktoren in Prozent`
      }
    ];
  };
  
  const handleCardOrderChange = (view: 'organizer' | 'auftraggeber' | 'techniker', order: string[]) => {
    setCardOrder(prev => ({
      ...prev,
      [view]: order
    }));
  };

  return (
    <ThemeProvider>
      {!isAuthenticated ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
          <Settings onLogout={handleLogout} onStartTour={handleManualStartTour} />
          <div className="max-w-[1600px] mx-auto space-y-6">
            {isLoading ? (
              <>
                <SkeletonFilterBar />
                <SkeletonGrid count={12} />
              </>
            ) : (
              <>
                <DashboardFilters onStart={handleStart} cardOrder={cardOrder} onCardOrderChange={handleCardOrderChange} />
                {hasStarted && <KPIGrid nutzergruppe={nutzergruppe} level={level} cardOrder={cardOrder} onCardOrderChange={handleCardOrderChange} />}
              </>
            )}
          </div>

          {showModal && (
            <LevelWarningModal
              onClose={() => setShowModal(false)}
              onDontShowAgain={handleDontShowAgain}
            />
          )}

          {showRedKPIModal && (
            <RedKPIReportModal
              onClose={() => setShowRedKPIModal(false)}
              redKPIs={getRedKPIs()}
            />
          )}
          
          {showOnboardingModal && (
            <OnboardingModal
              onStart={handleStartOnboardingTour}
              onClose={handleCloseOnboardingModal}
            />
          )}
          
          {showOnboardingTour && (
            <OnboardingTour onComplete={handleCompleteOnboardingTour} />
          )}
        </div>
      )}
    </ThemeProvider>
  );
}
