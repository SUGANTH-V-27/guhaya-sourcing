export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-primary)] px-4 py-10 md:px-6 md:py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
