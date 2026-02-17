import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Map, BookOpen, Calendar, Newspaper, CloudSun, Settings, ChevronLeft, ChevronRight, LogIn, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import starlogsIcon from "@/assets/starlogs-icon.png";
const navItems = [{
  icon: LayoutDashboard,
  label: "Dashboard",
  path: "/"
}, {
  icon: CloudSun,
  label: "7-Day Forecast",
  path: "/forecast"
}, {
  icon: Map,
  label: "Sky Map",
  path: "/sky-map"
}, {
  icon: Images,
  label: "Astro Gallery",
  path: "/gallery"
}, {
  icon: BookOpen,
  label: "Logs",
  path: "/logs"
}, {
  icon: Calendar,
  label: "Events",
  path: "/events"
}, {
  icon: Newspaper,
  label: "News",
  path: "/news"
}];
export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const getInitials = () => {
    if (!user?.username) return "U";
    return user.username.slice(0, 2).toUpperCase();
  };
  return <aside className={cn("flex flex-col h-screen bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border/50 transition-all duration-300", collapsed ? "w-16" : "w-60")}>
      {/* Header */}
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-3 p-4 border-b border-sidebar-border hover:bg-sidebar-accent transition-colors w-full text-left"
      >
        <img src={starlogsIcon} alt="StarLogs" className={cn("flex-shrink-0", collapsed ? "w-8 h-8" : "w-10 h-10")} />
        {!collapsed && <div>
            <h1 className="font-display font-bold text-foreground text-lg leading-tight">StarLogs</h1>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Mission Control</span>
          </div>}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const linkContent = (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent",
                collapsed && "justify-center",
                isActive ? "bg-primary text-primary-foreground font-medium" : "text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Settings & Collapse */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <NavLink 
                to="/settings" 
                className={cn(
                  "flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200",
                  "hover:bg-sidebar-accent",
                  location.pathname === "/settings" ? "bg-primary text-primary-foreground font-medium" : "text-sidebar-foreground"
                )}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              Settings
            </TooltipContent>
          </Tooltip>
        ) : (
          <NavLink 
            to="/settings" 
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              "hover:bg-sidebar-accent",
              location.pathname === "/settings" ? "bg-primary text-primary-foreground font-medium" : "text-sidebar-foreground"
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Settings</span>
          </NavLink>
        )}

        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className={cn(
            "flex items-center px-3 py-2.5 rounded-lg w-full text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User Profile / Sign In */}
      {isAuthenticated ? (
        <>
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setProfileOpen(true)}
                  className="border-t border-sidebar-border w-full hover:bg-sidebar-accent transition-colors p-3 flex justify-center"
                >
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary font-medium text-sm">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                {user?.username}
              </TooltipContent>
            </Tooltip>
          ) : (
            <button 
              onClick={() => setProfileOpen(true)}
              className="border-t border-sidebar-border w-full hover:bg-sidebar-accent transition-colors p-4 text-left"
            >
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
            </button>
          )}
          <ProfileEditDialog open={profileOpen} onOpenChange={setProfileOpen} />
        </>
      ) : (
        collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button 
                onClick={() => navigate("/auth")}
                className="border-t border-sidebar-border w-full hover:bg-sidebar-accent transition-colors p-3 flex justify-center"
              >
                <LogIn className="w-5 h-5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              Sign In
            </TooltipContent>
          </Tooltip>
        ) : (
          <button 
            onClick={() => navigate("/auth")}
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
        )
      )}
    </aside>;
}