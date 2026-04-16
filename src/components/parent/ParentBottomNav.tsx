import { Home, Activity, Baby, User, CreditCard } from "lucide-react";
import type { ParentTab } from "@/pages/ParentDashboard";

interface ParentBottomNavProps {
  activeTab: ParentTab;
  onTabChange: (tab: ParentTab) => void;
}

const tabs: { id: ParentTab; icon: React.ElementType; label: string }[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "activity", icon: Activity, label: "Activity" },
  { id: "child", icon: Baby, label: "Child" },
  { id: "billing", icon: CreditCard, label: "Billing" },
  { id: "profile", icon: User, label: "Profile" },
];

const ParentBottomNav = ({ activeTab, onTabChange }: ParentBottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-popover border-t border-border z-50">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive ? "bg-primary/10 scale-110" : ""
              }`}>
                <tab.icon className={`w-5 h-5 transition-all ${isActive ? "stroke-[2.75]" : "stroke-[2.25]"}`} strokeLinecap="round" strokeLinejoin="round" />
              </div>
              <span className={`text-[10px] transition-all ${isActive ? "font-semibold" : "font-medium"}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default ParentBottomNav;
