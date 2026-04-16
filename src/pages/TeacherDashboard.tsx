import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Bell, Home, Clock, UserCheck, ClipboardCheck, PenSquare, User, GraduationCap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import TeacherHome from "@/components/teacher/TeacherHome";
import TeacherAttendance from "@/components/teacher/TeacherAttendance";
import TeacherActivities from "@/components/teacher/TeacherActivities";
import TeacherProfile from "@/components/teacher/TeacherProfile";
import TeacherPunchClock from "@/components/teacher/TeacherPunchClock";
import TeacherChildCheckInOut from "@/components/teacher/TeacherChildCheckInOut";
import TeacherBottomNav from "@/components/teacher/TeacherBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import teacherAvatar from "@/assets/teacher-avatar.jpg";

type TeacherTab = "home" | "attendance" | "activities" | "profile" | "punch" | "checkinout";

const tabConfig: Record<TeacherTab, { title: string; rightLabel?: string }> = {
  home: { title: "" },
  attendance: { title: "Attendance" },
  activities: { title: "Activities" },
  profile: { title: "Profile" },
  punch: { title: "Punch Clock" },
  checkinout: { title: "Check In / Out" },
};

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState<TeacherTab>("home");
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const displayName = user?.user_metadata?.display_name || "Teacher";
  const greeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening";

  const isHome = activeTab === "home";
  const config = tabConfig[activeTab];

  const renderTab = () => {
    switch (activeTab) {
      case "home": return <TeacherHome />;
      case "attendance": return <TeacherAttendance />;
      case "activities": return <TeacherActivities />;
      case "profile": return <TeacherProfile />;
      case "punch": return <TeacherPunchClock />;
      case "checkinout": return <TeacherChildCheckInOut />;
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
          {isHome ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={teacherAvatar} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-xs text-muted-foreground">{greeting} 👋</p>
                  <h1 className="font-heading text-base font-bold text-foreground">{displayName}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs gap-1">
                  📚 Toddler 2
                </Badge>
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

        <div key={activeTab} className="flex-1 overflow-y-auto pb-20 animate-fade-in">
          {renderTab()}
        </div>
        <TeacherBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-popover border-r border-border p-6 flex flex-col gap-2">
        <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 stroke-[2.25]" /> Teacher
        </h2>
        {([
          { id: "home" as TeacherTab, label: "Home", icon: Home },
          { id: "punch" as TeacherTab, label: "Punch Clock", icon: Clock },
          { id: "checkinout" as TeacherTab, label: "Kid Check In/Out", icon: UserCheck },
          { id: "attendance" as TeacherTab, label: "Attendance", icon: ClipboardCheck },
          { id: "activities" as TeacherTab, label: "Activities", icon: PenSquare },
          { id: "profile" as TeacherTab, label: "Profile", icon: User },
        ] as const).map((item) => {
          const SideIcon = item.icon;
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-body transition-all duration-200 relative ${
                    activeTab === item.id
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1"
                  }`}
                >
                  {activeTab === item.id && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                  )}
                  <SideIcon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${activeTab === item.id ? "stroke-[2.5]" : "stroke-[2.25] group-hover:stroke-[2.5]"}`} />
                  {item.label}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </aside>
      <main key={activeTab} className="flex-1 p-8 max-w-4xl animate-fade-in">{renderTab()}</main>
    </div>
  );
};

export default TeacherDashboard;
