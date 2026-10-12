import { Canvas } from '@react-three/fiber';
import { useEffect, useState, type ReactNode } from 'react';
import { ShipPreviewScene } from './scenes/ShipPreviewScene';

interface HeroSceneProps {
  fallback: ReactNode;
}

export function HeroScene({ fallback }: HeroSceneProps) {
  const [motionAllowed, setMotionAllowed] = useState(true);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setMotionAllowed(!preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  return (
    <div className="hero-scene" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        fallback={fallback}
      >
        <ShipPreviewScene motionAllowed={motionAllowed}/>
      </Canvas>
    </div>
  );
}
