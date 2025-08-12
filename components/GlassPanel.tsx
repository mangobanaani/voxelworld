import { ReactNode } from 'react';

export default function GlassPanel({ children }: { children: ReactNode }) {
  return (
    <div className="glass" style={{padding:'12px 16px', borderRadius:16, backdropFilter:'blur(18px) saturate(160%)', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', boxShadow:'0 4px 24px -4px rgba(0,0,0,0.4)', color:'#fff'}}>
      {children}
    </div>
  );
}
