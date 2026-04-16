import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Bell, MessageSquare, Home, Activity, Baby, User, CreditCard, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import ParentHome from "@/components/parent/ParentHome";
import ParentActivity from "@/components/parent/ParentActivity";
import ParentChildProfile from "@/components/parent/ParentChildProfile";
import ParentProfile from "@/components/parent/ParentProfile";
import ParentBilling from "@/components/parent/ParentBilling";
import ParentEvents from "@/components/parent/ParentEvents";
import ParentBottomNav from "@/components/parent/ParentBottomNav";

export type ParentTab = "home" | "activity" | "child" | "profile" | "billing" | "events";

const tabConfig: Record<ParentTab, { title: string; rightLabel?: string }> = {
  home: { title: "" },
  activity: { title: "Activity & Attendance" },
  child: { title: "Child Profile", rightLabel: "Monthly" },
  profile: { title: "Parent Profile" },
  billing: { title: "Billing" },
  events: { title: "Event", rightLabel: "Season" },
};

const ParentDashboard = () => {
  const [activeTab, setActiveTab] = useState<ParentTab>("home");
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Parent";
  const greeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening";

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <ParentHome onNavigate={setActiveTab} />;
      case "activity":
        return <ParentActivity />;
      case "child":
        return <ParentChildProfile />;
      case "profile":
        return <ParentProfile />;
      case "billing":
        return <ParentBilling />;
      case "events":
        return <ParentEvents />;
      default:
        return <ParentHome onNavigate={setActiveTab} />;
    }
  };

  const isHome = activeTab === "home";
  const config = tabConfig[activeTab];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile: sticky top bar */}
      {isMobile && (
        <div className="sticky top-0 z-30 bg-popover border-b border-border px-4 py-3">
          {isHome ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{greeting} 👋</p>
                <h1 className="font-heading text-lg font-bold text-foreground">{displayName}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate("/parent/messages")} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-foreground" />
                </button>
                <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center relative">
                  <Bell className="w-5 h-5 text-foreground" />
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab("home")} className="p-1">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <h1 className="font-heading text-lg font-bold text-foreground">{config.title}</h1>
              </div>
              {config.rightLabel && (
                <Badge className="bg-primary/10 text-primary text-xs">{config.rightLabel}</Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Desktop: show Navbar */}
      {!isMobile && <Navbar />}

      <div className="flex-1 flex">
        {/* Desktop: sidebar tabs */}
        {!isMobile && (
          <aside className="w-56 border-r border-border bg-popover p-4 space-y-1 hidden md:block">
            {([
              { id: "home" as ParentTab, label: "Home", icon: Home },
              { id: "activity" as ParentTab, label: "Activity", icon: Activity },
              { id: "child" as ParentTab, label: "Children", icon: Baby },
              { id: "profile" as ParentTab, label: "My Profile", icon: User },
              { id: "billing" as ParentTab, label: "Billing", icon: CreditCard },
              { id: "events" as ParentTab, label: "Events", icon: CalendarDays },
            ] as const).map((tab) => {
              const SideIcon = tab.icon;
              return (
                <Tooltip key={tab.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`group w-full text-left px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all duration-200 flex items-center gap-3 relative ${
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1"
                      }`}
                    >
                      {activeTab === tab.id && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                      )}
                      <SideIcon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${activeTab === tab.id ? "stroke-[2.5]" : "stroke-[2.25] group-hover:stroke-[2.5]"}`} />
                      {tab.label}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {tab.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </aside>
        )}

        {/* Content area */}
        <div key={activeTab} className={`flex-1 overflow-y-auto animate-fade-in ${isMobile ? "pb-20" : ""}`}>
          <div className={!isMobile ? "max-w-2xl mx-auto" : ""}>
            {renderScreen()}
          </div>
        </div>
      </div>

      {/* Mobile: bottom nav */}
      {isMobile && <ParentBottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
};

export default ParentDashboard;
