import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RapierRigidBody, RigidBody, useRapier } from '@react-three/rapier';
import { Suspense, useEffect, useRef, useState } from 'react';
import { MathUtils, Vector3 } from 'three';
import type { Group } from 'three';
import { CharacterLoadBoundary, CharacterModel } from './CharacterModel';
import { FollowCamera } from '../camera/FollowCamera';
import type { ExploreControl } from '../input/exploreKeyboardMap';
import type { ExploreSettings } from '../config/explore-defaults';

const GRAVITY = 9.81;
const MAX_FALL_SPEED = 22;
type CharacterMotion = 'idle' | 'walking' | 'running' | 'jump' | 'runningJump';

interface ExplorerCharacterProps {
  settings: ExploreSettings['character'];
  spawnPosition: [number, number, number];
  controlsEnabled: boolean;
  cameraMode: 'follow' | 'orbit';
  sceneId: string;
}

export function ExplorerCharacter({ settings, spawnPosition, controlsEnabled, cameraMode, sceneId }: ExplorerCharacterProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const visualRef = useRef<Group>(null);
  const yawRef = useRef(Math.PI);
  const cameraYawRef = useRef(Math.PI);
  const verticalSpeedRef = useRef(0);
  const wasBackwardRef = useRef(false);
  const backwardTargetRef = useRef(Math.PI);
  const jumpPressedRef = useRef(false);
  const jumpWasRunningRef = useRef(false);
  const motionRef = useRef<CharacterMotion>('idle');
  const [motion, setMotion] = useState<CharacterMotion>('idle');
  const { world } = useRapier();
  const [, getControls] = useKeyboardControls<ExploreControl>();
  const controllerRef = useRef<ReturnType<typeof world.createCharacterController> | null>(null);
  const previousSceneRef = useRef(sceneId);
  const pendingSpawnRef = useRef<[number, number, number] | null>(null);

  useEffect(() => {
    if (previousSceneRef.current === sceneId) return;
    previousSceneRef.current = sceneId;
    pendingSpawnRef.current = spawnPosition;
    verticalSpeedRef.current = 0;
    yawRef.current = Math.PI;
    cameraYawRef.current = Math.PI;
    motionRef.current = 'idle';
    setMotion('idle');
  }, [sceneId, spawnPosition[0], spawnPosition[1], spawnPosition[2]]);

  useEffect(() => {
    const controller = world.createCharacterController(0.025);
    controller.enableAutostep(0.28, 0.16, true);
    controller.enableSnapToGround(0.3);
    controllerRef.current = controller;

    return () => {
      world.removeCharacterController(controller);
      controllerRef.current = null;
    };
  }, [world]);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    const controller = controllerRef.current;
    if (!body) return;
    if (pendingSpawnRef.current && body.isValid()) {
      const [x, y, z] = pendingSpawnRef.current;
      body.setTranslation({ x, y, z }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      pendingSpawnRef.current = null;
    }
    if (!controller) return;

    const currentControls = getControls();
    const controls = controlsEnabled ? currentControls : {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false,
    };
    const turning = Number(controls.left) - Number(controls.right);
    const backward = controls.backward;
    if (backward && !wasBackwardRef.current) backwardTargetRef.current = yawRef.current + Math.PI;
    wasBackwardRef.current = backward;
    if (backward) {
      backwardTargetRef.current += turning * settings.turnSpeed * delta;
      yawRef.current = MathUtils.damp(yawRef.current, backwardTargetRef.current, 5, delta);
    } else {
      yawRef.current += turning * settings.turnSpeed * delta;
      cameraYawRef.current = yawRef.current;
    }
    if (visualRef.current) visualRef.current.rotation.y = yawRef.current;

    const moving = controls.forward || backward;
    const running = moving && controls.sprint;
    const groundedBeforeMove = controller.computedGrounded();
    if (controls.jump && !jumpPressedRef.current && groundedBeforeMove) {
      verticalSpeedRef.current = settings.jumpImpulse;
      jumpWasRunningRef.current = running;
    }
    jumpPressedRef.current = controls.jump;

    const forward = new Vector3(Math.sin(yawRef.current), 0, Math.cos(yawRef.current));
    const speed = running ? settings.runSpeed : settings.walkSpeed;
    const direction = moving ? forward.multiplyScalar(speed) : new Vector3();

    verticalSpeedRef.current = Math.max(
      verticalSpeedRef.current - GRAVITY * delta,
      -MAX_FALL_SPEED,
    );
    const desiredMovement = {
      x: direction.x * delta,
      y: verticalSpeedRef.current * delta,
      z: direction.z * delta,
    };

    controller.computeColliderMovement(body.collider(0), desiredMovement);
    const correction = controller.computedMovement();
    const position = body.translation();
    body.setNextKinematicTranslation({
      x: position.x + correction.x,
      y: position.y + correction.y,
      z: position.z + correction.z,
    });

    const grounded = controller.computedGrounded();
    if (grounded && verticalSpeedRef.current < 0) verticalSpeedRef.current = 0;
    const nextMotion: CharacterMotion = !grounded
      ? (jumpWasRunningRef.current ? 'runningJump' : 'jump')
      : moving ? (running ? 'running' : 'walking') : 'idle';
    if (motionRef.current !== nextMotion) {
      motionRef.current = nextMotion;
      setMotion(nextMotion);
    }
  });

  return (
    <>
    <FollowCamera bodyRef={bodyRef} yawRef={cameraYawRef} enabled={cameraMode === 'follow'} resetKey={sceneId} />
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={spawnPosition}>
      <CapsuleCollider args={[0.5, 0.32]} />
      <group ref={visualRef} position={[0, -0.82, 0]} rotation={[0, Math.PI, 0]}>
                <CharacterLoadBoundary fallback={(
          <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.32, 1, 6, 10]} />
            <meshStandardMaterial color="#f0a65e" emissive="#5c2910" emissiveIntensity={0.25} roughness={0.72} />
          </mesh>
        )}>
          <Suspense fallback={(
            <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.32, 1, 6, 10]} />
              <meshStandardMaterial color="#f0a65e" emissive="#5c2910" emissiveIntensity={0.25} roughness={0.72} />
            </mesh>
          )}>
            <CharacterModel motion={motion} />
          </Suspense>
        </CharacterLoadBoundary>
      </group>
    </RigidBody>
    </>
  );
}
