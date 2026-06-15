import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { ParticleBackground } from "./ParticleBackground";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen w-full">
      <ParticleBackground />
      <TopNav />
      <main className="relative z-10 pt-28">
        <div className="container mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};
