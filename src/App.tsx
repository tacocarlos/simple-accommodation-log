import { useState } from "react";
import { ClassManager } from "@/components/ClassManager";
import { StudentManager } from "@/components/StudentManager";
import { AccommodationManager } from "@/components/AccommodationManager";
import { ClassSummary } from "@/components/ClassSummary";
import { ClassSummaryWithTracking } from "@/components/ClassSummaryWithTracking";
import { PeriodManager } from "@/components/PeriodManager";
import "./index.css";

type Tab =
  | "tracking"
  | "classes"
  | "students"
  | "accommodations"
  | "periods"
  | "summary";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("tracking");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">
            504 & IEP Accommodation Tracker
          </h1>
          <p className="text-muted-foreground">
            Track accommodations and daily service provision for students
          </p>
        </div>
      </header>

      <nav className="border-b bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("tracking")}
              className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === "tracking"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Service Tracking
              {activeTab === "tracking" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === "summary"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Class Summary
              {activeTab === "summary" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("classes")}
              className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === "classes"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Classes
              {activeTab === "classes" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === "students"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Students
              {activeTab === "students" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("accommodations")}
              className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === "accommodations"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Accommodations
              {activeTab === "accommodations" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("periods")}
              className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === "periods"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Six-Week Periods
              {activeTab === "periods" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto">
        {activeTab === "tracking" && <ClassSummaryWithTracking />}
        {activeTab === "summary" && <ClassSummary />}
        {activeTab === "classes" && <ClassManager />}
        {activeTab === "students" && <StudentManager />}
        {activeTab === "accommodations" && <AccommodationManager />}
        {activeTab === "periods" && <PeriodManager />}
      </main>
    </div>
  );
}

export default App;
