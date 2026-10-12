export type ExploreControl = 'forward' | 'backward' | 'left' | 'right' | 'sprint' | 'jump';

export const exploreKeyboardMap = [
  { name: 'forward' as const, keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward' as const, keys: ['ArrowDown', 's', 'S'] },
  { name: 'left' as const, keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right' as const, keys: ['ArrowRight', 'd', 'D'] },
  { name: 'sprint' as const, keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'jump' as const, keys: ['Space'] },
];
