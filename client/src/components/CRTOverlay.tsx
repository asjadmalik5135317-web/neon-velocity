export function CRTOverlay() {
  return (
    <>
      <div className="scanlines fixed inset-0 pointer-events-none z-50 h-screen w-screen opacity-20" />
      <div className="crt-flicker fixed inset-0 pointer-events-none z-40 h-screen w-screen" />
      <div className="fixed inset-0 pointer-events-none z-50 h-screen w-screen bg-gradient-radial from-transparent to-black/60" />
    </>
  );
}
