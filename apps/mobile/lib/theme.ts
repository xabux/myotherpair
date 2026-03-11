// Design tokens matching the web app's dark theme CSS variables
export const colors = {
  background:       '#141210',   // hsl(30 10% 8%)
  card:             '#1F1C19',   // hsl(30 10% 12%)
  cardAlt:          '#252118',   // hsl(30 8% 18%)
  border:           '#2A2520',   // hsl(30 8% 22%)
  foreground:       '#F0EDE8',   // hsl(40 20% 95%)
  foregroundMuted:  '#8C8078',   // hsl(30 10% 55%)
  accent:           '#D4913A',   // hsl(38 65% 52%) — warm amber
  accentFg:         '#0F0D0A',
  muted:            '#1C1916',
  secondary:        '#252018',
  matchGreen:       '#3D9E6C',   // hsl(152 55% 42%)
  destructive:      '#C23636',
  leftShoe:         '#3D7EC7',   // hsl(215 65% 52%)
  rightShoe:        '#C23D64',   // hsl(345 60% 52%)
  white:            '#FFFFFF',
  overlay:          'rgba(0,0,0,0.5)',
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  '2xl': 48,
} as const;

export const radius = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl': 28,
  full: 9999,
} as const;

export const font = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   16,
  lg:   18,
  xl:   22,
  '2xl': 28,
  '3xl': 36,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
