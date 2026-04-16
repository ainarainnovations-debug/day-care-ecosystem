import { useState } from "react";
import { CheckCircle2, Clock, UserCheck, UserX, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getChildPhoto } from "@/assets/childPhotos";

interface Child {
  id: string;
  name: string;
  parentName: string;
  checkedIn: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkedInBy: string | null;
}

const initialChildren: Child[] = [
  { id: "1", name: "Emma Wilson", parentName: "Jane Doe", checkedIn: true, checkInTime: "8:00 AM", checkOutTime: null, checkedInBy: "Ms. Sara" },
  { id: "2", name: "Liam Johnson", parentName: "Sarah Johnson", checkedIn: true, checkInTime: "8:15 AM", checkOutTime: null, checkedInBy: "Ms. Sara" },
  { id: "3", name: "Sofia Garcia", parentName: "Maria Garcia", checkedIn: true, checkInTime: "8:30 AM", checkOutTime: null, checkedInBy: "Ms. Sara" },
  { id: "4", name: "Noah Brown", parentName: "Mike Brown", checkedIn: false, checkInTime: null, checkOutTime: null, checkedInBy: null },
  { id: "5", name: "Ava Martinez", parentName: "Lisa Martinez", checkedIn: false, checkInTime: null, checkOutTime: null, checkedInBy: null },
  { id: "6", name: "Oliver Davis", parentName: "Tom Davis", checkedIn: false, checkInTime: null, checkOutTime: null, checkedInBy: null },
];

const TeacherChildCheckInOut = () => {
  const [children, setChildren] = useState<Child[]>(initialChildren);
  const [search, setSearch] = useState("");

  const now = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleCheckIn = (id: string) => {
    setChildren((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, checkedIn: true, checkInTime: now(), checkedInBy: "You" }
          : c
      )
    );
  };

  const handleCheckOut = (id: string) => {
    setChildren((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, checkedIn: false, checkOutTime: now() }
          : c
      )
    );
  };

  const checkedInCount = children.filter((c) => c.checkedIn).length;
  const filtered = children.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const checkedIn = filtered.filter((c) => c.checkedIn);
  const notCheckedIn = filtered.filter((c) => !c.checkedIn);

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* Summary */}
      <div className="bg-popover rounded-2xl border border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{checkedInCount} / {children.length}</p>
            <p className="text-xs text-muted-foreground">Children checked in</p>
          </div>
        </div>
        <Badge variant="secondary" className="rounded-full text-sm font-semibold">
          {Math.round((checkedInCount / children.length) * 100)}%
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search child..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl bg-secondary border-none"
        />
      </div>

      {/* Not Checked In */}
      {notCheckedIn.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Awaiting Check-In ({notCheckedIn.length})
          </p>
          <div className="space-y-2">
            {notCheckedIn.map((child) => (
              <div
                key={child.id}
                className="bg-popover rounded-2xl border border-border p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img src={getChildPhoto(child.name)} alt={child.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{child.name}</p>
                    <p className="text-xs text-muted-foreground">Parent: {child.parentName}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="rounded-xl h-9 bg-primary text-primary-foreground"
                  onClick={() => handleCheckIn(child.id)}
                >
                  <UserCheck className="w-4 h-4 mr-1" /> Check In
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checked In */}
      {checkedIn.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Checked In ({checkedIn.length})
          </p>
          <div className="space-y-2">
            {checkedIn.map((child) => (
              <div
                key={child.id}
                className="bg-light-sage/20 rounded-2xl border border-accent/15 p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={getChildPhoto(child.name)} alt={child.name} className="w-10 h-10 rounded-full object-cover" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-accent-foreground" />
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{child.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">In: {child.checkInTime}</span>
                      <span className="text-xs text-muted-foreground">· by {child.checkedInBy}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-9 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => handleCheckOut(child.id)}
                >
                  <UserX className="w-4 h-4 mr-1" /> Out
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherChildCheckInOut;
