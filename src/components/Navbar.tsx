import { LogIn, LogOut, Menu, X, Search, Shield, LayoutDashboard, MessageSquare, GraduationCap, Users, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) setScrolled(isScrolled);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleLogoClick = () => {
    if (user) {
      // Navigate to appropriate dashboard based on role
      if (userRole === "parent") {
        navigate("/parent/dashboard");
      } else if (userRole === "provider") {
        navigate("/provider/dashboard");
      } else if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-popover/95 backdrop-blur-md transition-all duration-300 ${
      scrolled ? 'shadow-md border-b border-border' : 'border-b border-transparent'
    }`}>
      <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-8">
        <button onClick={handleLogoClick} className="flex flex-col leading-tight cursor-pointer">
          <span className="font-heading text-xl font-bold text-foreground tracking-tight">care</span>
          <span className="font-heading text-xl font-bold text-foreground -mt-1 tracking-tight">connect</span>
        </button>

        <div className="hidden md:flex items-center gap-6">
          {!user && (
            <Link to="/search" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <Search className="w-4 h-4" /> Find Daycare
            </Link>
          )}

          {user && userRole === "parent" && (
            <>
              <Link to="/parent/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <LayoutDashboard className="w-4 h-4 stroke-[2.25]" /> Dashboard
              </Link>
              <Link to="/parent/messages" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <MessageSquare className="w-4 h-4 stroke-[2.25]" /> Messages
              </Link>
            </>
          )}

          {user && userRole === "provider" && (
            <>
              <Link to="/provider/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <LayoutDashboard className="w-4 h-4 stroke-[2.25]" /> Dashboard
              </Link>
              <Link to="/provider/capacity" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <Users className="w-4 h-4 stroke-[2.25]" /> Capacity
              </Link>
              <Link to="/provider/payments" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <DollarSign className="w-4 h-4 stroke-[2.25]" /> Payments
              </Link>
              <Link to="/parent/messages" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <MessageSquare className="w-4 h-4 stroke-[2.25]" /> Messages
              </Link>
            </>
          )}

          {user && userRole === "teacher" && (
            <Link to="/teacher/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <GraduationCap className="w-4 h-4 stroke-[2.25]" /> Dashboard
            </Link>
          )}

          {user && userRole === "admin" && (
            <Link to="/admin" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <Shield className="w-4 h-4" /> Admin
            </Link>
          )}

          {user && <NotificationBell />}

          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sm">
              <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
            </Button>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <LogIn className="w-4 h-4" /> Login
            </Link>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-popover border-t border-border px-6 py-4 space-y-3">
          {!user && (
            <Link to="/search" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>Find Daycare</Link>
          )}
          {user && userRole === "parent" && (
            <>
              <Link to="/parent/dashboard" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to="/parent/messages" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>Messages</Link>
            </>
          )}
          {user && userRole === "provider" && (
            <>
              <Link to="/provider/dashboard" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to="/provider/capacity" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>Capacity</Link>
              <Link to="/provider/payments" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>Payments</Link>
              <Link to="/parent/messages" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>Messages</Link>
            </>
          )}
          {user && userRole === "teacher" && (
            <Link to="/teacher/dashboard" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          )}
          {user && userRole === "admin" && (
            <Link to="/admin" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>Admin</Link>
          )}
          {user ? (
            <button className="block text-sm font-medium text-foreground" onClick={() => { handleSignOut(); setMobileOpen(false); }}>Sign Out</button>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
              <LogIn className="w-4 h-4" /> Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
