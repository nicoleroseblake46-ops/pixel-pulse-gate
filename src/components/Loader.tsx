export const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
          <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" style={{ animationDuration: "1s" }} />
          <div className="absolute inset-2 rounded-full border-2 border-accent/30" />
          <div className="absolute inset-2 rounded-full border-b-2 border-accent animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
          </div>
        </div>
        <div className="font-display text-sm tracking-[0.4em] text-primary text-glow">LOADING</div>
      </div>
    </div>
  );
};
