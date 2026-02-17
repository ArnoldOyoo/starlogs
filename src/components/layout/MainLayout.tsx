import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import StarParticles from "@/components/StarParticles";
import starlogsIcon from "@/assets/starlogs-icon.png";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background auth-wave-bg relative">
      {/* Global floating star particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarParticles count={60} />
      </div>
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="sticky top-0 h-screen hidden md:block z-10">
        <AppSidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />

      <main className="flex-1 overflow-auto scrollbar-thin relative z-10">
        {/* Mobile Header with hamburger */}
        <div className="sticky top-0 z-40 md:hidden bg-sidebar/95 backdrop-blur-sm border-b border-sidebar-border">
          <div className="flex items-center justify-between p-4">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={starlogsIcon} alt="StarLogs" className="w-8 h-8" />
              <div>
                <h1 className="font-display font-bold text-foreground text-lg leading-tight">StarLogs</h1>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Mission Control</span>
              </div>
            </a>
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
