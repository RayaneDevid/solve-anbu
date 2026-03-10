import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* 暗部 watermark */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[500px] leading-none font-teko text-white/[0.03] select-none pointer-events-none whitespace-nowrap [writing-mode:horizontal-tb]">
        暗&nbsp;部
      </span>
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo + Title */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-4">
            <div className="absolute inset-0 blur-[24px] opacity-30 bg-[radial-gradient(circle,rgba(139,0,0,1)_0%,rgba(0,0,0,0)_70%)]" />
            <img
              src="/anbu-logo.png"
              alt="ANBU"
              className="relative w-20 h-20 object-contain drop-shadow-[0_0_24px_rgba(139,0,0,0.4)]"
            />
          </div>
          <h1 className="font-teko text-4xl tracking-[0.3em] text-accent uppercase">ANBU</h1>
          <p className="text-sm text-text-secondary tracking-widest">
            Forces Spéciales de Konoha
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
