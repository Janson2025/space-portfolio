import { Bounds } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import type { ComponentType } from 'react';
import type { ExploreSettings } from '../config/explore-defaults';
import { GroundAndBounds, ShipCollision } from '../collision/ShipCollision';
import { SpiderhawkModel } from '../../hero-scene/models/SpiderhawkModel';
import { ShuttleScene } from './ShuttleScene';

export type ExploreSceneId = 'training' | 'shuttle' | 'spiderhawk';

export interface ExploreSceneContentProps {
  settings: ExploreSettings;
}

export interface ExploreSceneDefinition {
  id: ExploreSceneId;
  label: string;
  spawnPosition: (settings: ExploreSettings) => [number, number, number];
  component: ComponentType<ExploreSceneContentProps>;
}

function TrainingSceneContent(_props: ExploreSceneContentProps) {
  return (
    <>
      <GroundAndBounds size={24} />
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1, 1, 1]} position={[0, 1, 0]} />
        <mesh castShadow receiveShadow position={[0, 1, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#c87842" metalness={0.25} roughness={0.62} />
        </mesh>
      </RigidBody>
    </>
  );
}

function ShuttleSceneContent({ settings }: ExploreSceneContentProps) {
  return <ShuttleScene targetSize={settings.ship.targetSize} groundSize={settings.scene.groundSize} shieldOpacity={settings.ship.shieldStates['shield field']} />;
}

function SpiderhawkSceneContent({ settings }: ExploreSceneContentProps) {
  return (
    <>
      <GroundAndBounds size={settings.scene.groundSize} />
      <ShipCollision targetSize={settings.ship.targetSize} visible={settings.ship.showCollisionProxies} />
      <Bounds fit={false} clip={false}>
        <SpiderhawkModel targetSize={settings.ship.targetSize} alignToGround fitToBounds={false} shieldVisibility={settings.ship.shieldStates} />
      </Bounds>
    </>
  );
}

export const EXPLORE_SCENES: Record<ExploreSceneId, ExploreSceneDefinition> = {
  training: {
    id: 'training',
    label: 'Training: Ground + Cube',
    spawnPosition: () => [0, 10.82, 6],
    component: TrainingSceneContent,
  },
  shuttle: {
    id: 'shuttle',
    label: 'Shuttle Collision Test',
    spawnPosition: (settings) => [0, 0.82, settings.ship.targetSize * 0.437 + 8],
    component: ShuttleSceneContent,
  },
  spiderhawk: {
    id: 'spiderhawk',
    label: 'Spiderhawk Walk Test',
    spawnPosition: (settings) => [0, 0.82, settings.ship.targetSize * 0.437 + 8],
    component: SpiderhawkSceneContent,
  },
};
