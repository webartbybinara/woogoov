import { Outlet } from "react-router-dom";
import { MobileNavigation } from "./MobileNavigation";
import { DesktopSidebar } from "./DesktopSidebar";

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        <DesktopSidebar />
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col md:min-h-screen">
          {/* Content Area */}
          <div className="flex-1 p-mobile-padding md:p-6 pb-20 md:pb-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}