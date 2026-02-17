import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Map, BookOpen, Calendar, Newspaper, CloudSun, Settings, LogIn, Images, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import starlogsIcon from "@/assets/starlogs-icon.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: CloudSun, label: "7-Day Forecast", path: "/forecast" },
  { icon: Map, label: "Sky Map", path: "/sky-map" },
  { icon: Images, label: "Astro Gallery", path: "/gallery" },
  { icon: BookOpen, label: "Logs", path: "/logs" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: Newspaper, label: "News", path: "/news" },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const getInitials = () => {
    if (!user?.username) return "U";
    return user.username.slice(0, 2).toUpperCase();
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar/90 backdrop-blur-xl border-sidebar-border/50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <button 
            onClick={() => handleNavClick("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src={starlogsIcon} alt="StarLogs" className="w-10 h-10" />
            <div className="text-left">
              <h1 className="font-display font-bold text-foreground text-lg leading-tight">StarLogs</h1>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Mission Control</span>
            </div>
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left",
                  "hover:bg-sidebar-accent",
                  isActive ? "bg-primary text-primary-foreground font-medium" : "text-sidebar-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => handleNavClick("/settings")}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left",
              "hover:bg-sidebar-accent",
              location.pathname === "/settings" ? "bg-primary text-primary-foreground font-medium" : "text-sidebar-foreground"
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Settings</span>
          </button>
        </div>

        {/* User Profile / Sign In */}
        {isAuthenticated ? (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/20 text-primary font-medium text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => handleNavClick("/auth")}
            className="border-t border-sidebar-border w-full hover:bg-sidebar-accent transition-colors p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                <LogIn className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Sign In</p>
                <p className="text-xs text-muted-foreground">Access your account</p>
              </div>
            </div>
          </button>
        )}
      </SheetContent>
    </Sheet>
  );
}
