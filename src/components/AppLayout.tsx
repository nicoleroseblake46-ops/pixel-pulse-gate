import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { ParticleBackground } from "./ParticleBackground";
import { MobileNav } from "./MobileNav";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen w-full">
      <ParticleBackground />
      <AppSidebar />
      <MobileNav />
      <main className="relative z-10 md:ml-64">
        <div className="container mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
};
