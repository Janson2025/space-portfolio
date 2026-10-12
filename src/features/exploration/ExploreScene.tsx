import { Environment, KeyboardControls, OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import { ExplorerCharacter } from './character/ExplorerCharacter';
import { exploreKeyboardMap } from './input/exploreKeyboardMap';
import { EXPLORE_SCENES, type ExploreSceneId } from './scenes/sceneRegistry';
import { GroundAndBounds } from './collision/ShipCollision';
import lighting from '../../config/scene-lighting.json';
import type { ExploreSettings } from './config/explore-defaults';

export function ExploreScene({ settings, controlsEnabled, cameraMode, sceneId }: { settings: ExploreSettings; controlsEnabled: boolean; cameraMode: 'follow' | 'orbit'; sceneId: ExploreSceneId }) {
  const light = lighting.exploration;
  const activeScene = EXPLORE_SCENES[sceneId];
  const SceneContent = activeScene.component;
  const spawnPosition = activeScene.spawnPosition(settings);
  const isTrainingScene = sceneId === 'training';
  const isShipScene = sceneId === 'spiderhawk';
  const orbitTarget: [number, number, number] = [spawnPosition[0], spawnPosition[1] + 0.65, spawnPosition[2]];
  const groundSize = isTrainingScene ? 24 : settings.scene.groundSize;
  const keyLightPosition: [number, number, number] = isShipScene ? [30, 75, 40] : [6, 12, 8];

  return (
    <KeyboardControls map={exploreKeyboardMap}>
      <color attach="background" args={[light.background]} />
      <fog attach="fog" args={[light.fog.color, isShipScene ? light.fog.near : 18, isShipScene ? settings.scene.fogFar : 100]} />
      <ambientLight intensity={isShipScene ? settings.scene.ambientIntensity : 1.35} color="#ffffff" />
      <directionalLight position={keyLightPosition} intensity={isShipScene ? light.directional.intensity : 3.2} color={light.directional.color} castShadow />
      <pointLight position={isShipScene ? light.point.position as [number, number, number] : [-3, 6, -4]} intensity={isShipScene ? light.point.intensity : 8} distance={isShipScene ? light.point.distance : 40} color={light.point.color} />
       <Environment preset="city" background={false} />

      <Physics gravity={[0, -9.81, 0]}>
        <Suspense fallback={<GroundAndBounds size={groundSize} />}>
          <SceneContent settings={settings} />
        </Suspense>
        <ExplorerCharacter settings={settings.character} spawnPosition={spawnPosition} controlsEnabled={controlsEnabled} cameraMode={cameraMode} sceneId={sceneId} />
      </Physics>
      <OrbitControls
        makeDefault
        enabled={cameraMode === 'orbit'}
        target={orbitTarget}
        minDistance={3}
        maxDistance={isTrainingScene ? 30 : settings.scene.groundSize * 0.9}
        minPolarAngle={0.08}
        maxPolarAngle={Math.PI * 0.48}
        enablePan
        enableDamping
        dampingFactor={0.08}
      />
    </KeyboardControls>
  );
}
