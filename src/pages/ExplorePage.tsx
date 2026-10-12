import { Canvas } from '@react-three/fiber';
import { Link, useNavigate } from 'react-router-dom';
import { Suspense, useEffect, useState } from 'react';
import { ExploreScene } from '../features/exploration/ExploreScene';
import { DeveloperPanel } from '../features/exploration/ui/DeveloperPanel';
import { DEFAULT_EXPLORE_SETTINGS } from '../features/exploration/config/explore-defaults';

export function ExplorePage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(DEFAULT_EXPLORE_SETTINGS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'follow' | 'orbit'>('follow');

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [navigate]);

  return (
    <section className="explore-page" aria-label="Ship exploration scene">
      <div className="explore-stage">
        <Canvas
          className="explore-canvas"
          camera={{ position: [0, 3.2, 9], fov: 45 }}
          dpr={[1, 1.5]}
          shadows
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          fallback={<div className="explore-fallback">This character scene needs WebGL. You can still use the rest of the portfolio.</div>}
        >
          <Suspense fallback={null}>
            <ExploreScene settings={settings} controlsEnabled={!panelOpen && cameraMode === 'follow'} cameraMode={cameraMode} />
          </Suspense>
        </Canvas>

        <div className="explore-hud">
          <div className="explore-status-group">
            <div className="explore-readout"><span className="status-dot"></span> SPIDERHAWK / WALK TEST</div>
            <Link className="explore-camera-toggle" to="/collision-lab">COLLISION LAB ↗</Link>
            <button className="explore-camera-toggle" type="button" aria-pressed={cameraMode === 'orbit'} onClick={() => setCameraMode((current) => current === 'follow' ? 'orbit' : 'follow')}>
              VIEW: {cameraMode === 'follow' ? 'FOLLOW' : 'ORBIT'} <span>↻</span>
            </button>
          </div>
          <Link className="button button-quiet explore-exit" to="/">← RETURN TO PORTFOLIO</Link>
          <div className="explore-controls">
            <span><kbd>W / ↑</kbd> <i>WALK</i></span>
            <span><kbd>A / D · ← / →</kbd> <i>TURN</i></span>
            <span><kbd>S / ↓</kbd> <i>TURN TO CAMERA</i></span>
            <span><kbd>SHIFT</kbd> <i>RUN</i></span>
            <span><kbd>SPACE</kbd> <i>JUMP</i></span>
            <span><kbd>ESC</kbd> <i>EXIT</i></span>
          </div>
        </div>
      </div>
      <DeveloperPanel open={panelOpen} onOpenChange={setPanelOpen} settings={settings} setSettings={setSettings} />
    </section>
  );
}
