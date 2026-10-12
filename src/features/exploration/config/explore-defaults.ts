export const SHIELD_IDS = ['bird shield', 'shuttle1 shield', 'shuttle2 shield', 'shuttle3 shield', 'shield field'] as const;

export type ShieldId = (typeof SHIELD_IDS)[number];
export type ExplorePanelTab = 'character' | 'ship' | 'scene';

export interface ExploreSettings {
  character: {
    walkSpeed: number;
    runSpeed: number;
    turnSpeed: number;
    jumpImpulse: number;
  };
  ship: {
    targetSize: number;
    shieldStates: Record<ShieldId, number>;
    showCollisionProxies: boolean;
  };
  scene: {
    groundSize: number;
    ambientIntensity: number;
    fogFar: number;
  };
}

export const DEFAULT_EXPLORE_SETTINGS: ExploreSettings = {
  character: { walkSpeed: 2.15, runSpeed: 4.2, turnSpeed: 2.6, jumpImpulse: 5.4 },
  ship: {
    targetSize: 96,
    shieldStates: {
      'bird shield': 0,
      'shuttle1 shield': 0,
      'shuttle2 shield': 0,
      'shuttle3 shield': 0,
      'shield field': 0,
    },
    showCollisionProxies: false,
  },
  scene: { groundSize: 240, ambientIntensity: 0.8, fogFar: 290 },
};

export const SHIELD_LABELS: Record<ShieldId, string> = {
  'bird shield': 'Spiderhawk',
  'shuttle1 shield': 'Shuttle 1',
  'shuttle2 shield': 'Shuttle 2',
  'shuttle3 shield': 'Shuttle 3',
  'shield field': 'Shuttle shield field',
};
