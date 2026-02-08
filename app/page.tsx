import dynamic from 'next/dynamic';
import GlassPanel from '../components/GlassPanel';

const VoxelScene = dynamic(() => import('../components/VoxelScene'), { ssr: false });

export default function Page() {
  return (
    <main style={{height:'100dvh', width:'100%', overflow:'hidden'}}>
      <VoxelScene />
      <div style={{position:'absolute', top:16, left:16, right:16, display:'flex', gap:16}}>
        <GlassPanel>
          <h1 style={{margin:0, fontSize:'1.1rem', letterSpacing:'.05em'}}>VoxelWorld</h1>
          <p style={{margin:'4px 0 0', fontSize:'.8rem', opacity:.8}}>WASD fly, QE up/down, click to look</p>
          <p style={{margin:'4px 0 0', fontSize:'.7rem', opacity:.6}}>
            (c) by <a 
              href="https://mangobanaani.github.io" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{color:'inherit', textDecoration:'none', borderBottom:'1px solid rgba(255,255,255,0.3)'}}
            >
              mangobanaani
            </a>
          </p>
        </GlassPanel>
      </div>
    </main>
  );
}
