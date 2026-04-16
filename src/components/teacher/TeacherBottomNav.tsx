import { Home, ClipboardCheck, PenSquare, User, Clock, UserCheck } from "lucide-react";

type TeacherTab = "home" | "attendance" | "activities" | "profile" | "punch" | "checkinout";

interface TeacherBottomNavProps {
  activeTab: TeacherTab;
  onTabChange: (tab: TeacherTab) => void;
}

const tabs = [
  { id: "home" as TeacherTab, label: "Home", icon: Home },
  { id: "punch" as TeacherTab, label: "Clock", icon: Clock },
  { id: "checkinout" as TeacherTab, label: "Kids", icon: UserCheck },
  { id: "activities" as TeacherTab, label: "Activities", icon: PenSquare },
  { id: "profile" as TeacherTab, label: "Profile", icon: User },
];

const TeacherBottomNav = ({ activeTab, onTabChange }: TeacherBottomNavProps) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-popover border-t border-border px-4 py-2 z-50">
    <div className="flex justify-around items-center max-w-md mx-auto">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
              isActive ? "bg-primary/10 scale-110" : ""
            }`}>
              <Icon className={`w-5 h-5 transition-all ${isActive ? "stroke-[2.75]" : "stroke-[2.25]"}`} />
            </div>
            <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default TeacherBottomNav;
