export const springConfig = {
  gentle: { damping: 20, stiffness: 120, mass: 1 },
  bouncy: { damping: 10, stiffness: 200, mass: 1 },
  stiff: { damping: 30, stiffness: 400, mass: 1 },
  slow: { damping: 40, stiffness: 80, mass: 1.2 },
  wobbly: { damping: 8, stiffness: 180, mass: 1 },
};

export const timingConfig = {
  fast: { duration: 200 },
  normal: { duration: 300 },
  slow: { duration: 500 },
};

export const motiTransitions = {
  fadeIn: { type: 'timing' as const, duration: 300 },
  slideUp: { type: 'spring' as const, ...springConfig.gentle },
  scale: { type: 'spring' as const, ...springConfig.bouncy },
  stagger: (index: number) => ({ delay: index * 80, type: 'spring' as const, ...springConfig.gentle }),
};
