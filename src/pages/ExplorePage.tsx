import { Canvas } from '@react-three/fiber';
import { Link, useNavigate } from 'react-router-dom';
import { Suspense, useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { ExploreScene } from '../features/exploration/ExploreScene';
import { DeveloperPanel } from '../features/exploration/ui/DeveloperPanel';
import { DEFAULT_EXPLORE_SETTINGS } from '../features/exploration/config/explore-defaults';
import { EXPLORE_SCENES, type ExploreSceneId } from '../features/exploration/scenes/sceneRegistry';

export function ExplorePage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(DEFAULT_EXPLORE_SETTINGS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'follow' | 'orbit'>('follow');
  const [sceneId, setSceneId] = useState<ExploreSceneId>('training');
  const [initialSceneReady, setInitialSceneReady] = useState(false);
  const { active, progress, errors } = useProgress();

  useEffect(() => {
    if (!active && (progress >= 100 || errors.length > 0)) setInitialSceneReady(true);
  }, [active, progress, errors.length]);

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
            <ExploreScene settings={settings} controlsEnabled={!panelOpen && cameraMode === 'follow'} cameraMode={cameraMode} sceneId={sceneId} />
          </Suspense>
        </Canvas>
        {(!initialSceneReady || active) && (
          <div role="status" aria-live="polite" style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'grid', placeItems: 'center', background: 'rgba(5, 12, 18, 0.88)', color: '#d9f4f1', fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase', pointerEvents: 'none' }}>
            Preparing {EXPLORE_SCENES[sceneId].label} · {Math.round(progress)}%
          </div>
        )}

        <div className="explore-hud">
          <div className="explore-status-group">
            <div className="explore-readout"><span className="status-dot"></span> {EXPLORE_SCENES[sceneId].label.toUpperCase()}</div>
            <div role="group" aria-label="Choose exploration scene" className="explore-scene-picker">
              {Object.values(EXPLORE_SCENES).map((scene) => (
                <button key={scene.id} className="explore-camera-toggle" type="button" aria-pressed={sceneId === scene.id} onClick={() => setSceneId(scene.id)}>
                  {scene.label}
                </button>
              ))}
            </div>
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
