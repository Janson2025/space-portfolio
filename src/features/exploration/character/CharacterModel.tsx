import { useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { AnimationAction, AnimationMixer, Box3, Color, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { VRM, VRMLoaderPlugin } from '@pixiv/three-vrm';
import { retargetAnimation } from 'vrm-mixamo-retarget';
import kateUrl from '../../../../assets/models/Kate.vrm?url';
import idleUrl from '../../../../assets/animations/idle.fbx?url';
import walkingUrl from '../../../../assets/animations/walking.fbx?url';
import characterMaterialConfig from '../config/character-materials.json';

interface CharacterModelProps {
  motion: CharacterMotion;
}

type CharacterMotion = 'idle' | 'walking' | 'running' | 'jump' | 'runningJump';

interface CharacterActions {
  idle: AnimationAction;
  walking: AnimationAction;
}

interface EditableMToonMaterial {
  name: string;
  color?: Color;
  shadeColor?: Color;
  outlineColorFactor?: Color;
  shadingShiftFactor?: number;
  shadingToonyFactor?: number;
  outlineWidthFactor?: number;
  opacity?: number;
}

export function CharacterModel({ motion }: CharacterModelProps) {
  const gltf = useLoader(GLTFLoader, kateUrl, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });
  const [idleFbx, walkingFbx] = useLoader(FBXLoader, [idleUrl, walkingUrl]);
  const vrm = gltf.userData.vrm as VRM | undefined;
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionsRef = useRef<CharacterActions | null>(null);
  const previousMotionRef = useRef(motion);

  useEffect(() => {
    if (!vrm) return;
    const settingsByName = new Map(characterMaterialConfig.materials.map((settings) => [settings.name, settings]));
    vrm.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        const settings = settingsByName.get(material.name);
        if (!settings) continue;
        const editable = material as typeof material & EditableMToonMaterial;
        editable.color?.set(settings.color);
        if (settings.shadeColor) editable.shadeColor?.set(settings.shadeColor);
        if (settings.outlineColor) editable.outlineColorFactor?.set(settings.outlineColor);
        if (settings.shadingShiftFactor !== undefined) editable.shadingShiftFactor = settings.shadingShiftFactor;
        if (settings.shadingToonyFactor !== undefined) editable.shadingToonyFactor = settings.shadingToonyFactor;
        if (settings.outlineWidthFactor !== undefined) editable.outlineWidthFactor = settings.outlineWidthFactor;
        if (settings.opacity !== undefined) editable.opacity = settings.opacity;
      }
    });
  }, [vrm]);

  const clips = useMemo(() => {
    if (!vrm) return null;

    const idle = retargetAnimation(idleFbx, vrm, { logWarnings: false, animationClipName: 'mixamo.com' });
    const walking = retargetAnimation(walkingFbx, vrm, { logWarnings: false, animationClipName: 'mixamo.com' });
    if (!idle || !walking) throw new Error('Could not retarget the idle and walk clips to Kate.vrm.');
    return { idle, walking };
  }, [idleFbx, walkingFbx, vrm]);

  const transform = useMemo(() => {
    if (!vrm) return { position: [0, 0, 0] as [number, number, number], scale: 1 };

    vrm.scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(vrm.scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const scale = size.y > 0 ? 1.7 / size.y : 1;
    return {
      scale,
      position: [-center.x * scale, -box.min.y * scale, -center.z * scale] as [number, number, number],
    };
  }, [vrm]);

  useEffect(() => {
    if (!vrm || !clips) return;

    const mixer = new AnimationMixer(vrm.scene);
    const idle = mixer.clipAction(clips.idle);
    const walking = mixer.clipAction(clips.walking);
    idle.play();
    mixerRef.current = mixer;
    actionsRef.current = { idle, walking };

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(vrm.scene);
      mixerRef.current = null;
      actionsRef.current = null;
    };
  }, [clips, vrm]);

  useEffect(() => {
    const actions = actionsRef.current;
    if (!actions || previousMotionRef.current === motion) return;

    const moving = motion === 'walking' || motion === 'running' || motion === 'runningJump';
    const nextAction = moving ? actions.walking : actions.idle;
    const previousAction = moving ? actions.idle : actions.walking;
    nextAction.timeScale = motion === 'running' || motion === 'runningJump' ? 1.55 : 1;
    nextAction.reset().fadeIn(0.2).play();
    previousAction.crossFadeTo(nextAction, 0.2, false);
    previousMotionRef.current = motion;
  }, [motion, clips]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
    vrm?.update(delta);
  });

  if (!vrm) return null;

  return (
    <group position={transform.position} scale={transform.scale}>
      <primitive object={vrm.scene} dispose={null} />
    </group>
  );
}
