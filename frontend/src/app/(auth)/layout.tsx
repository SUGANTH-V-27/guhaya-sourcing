export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#070b0e] overflow-hidden px-4 py-8">
      {/* Subtle misty smoke / vignette background effects matching reference */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,191,165,0.08)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-teal-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-teal-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/15 via-[#070b0e]/80 to-[#070b0e]" />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-[420px]">
        {children}
      </div>
    </div>
  );
}
