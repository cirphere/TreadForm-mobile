export const colors = {
  danger: '#FF3D3D',
  dangerBg: '#FFE9E9',
  warn: '#F5A623',
  warnBg: '#FFF4DB',
  good: '#1FBA66',
  goodBg: '#E3F8EC',

  primary: '#0066FF',
  primaryStrong: '#005EEB',
  primaryHeavy: '#0054D1',

  labelStrong: '#000000',
  labelNormal: '#000000',
  labelNeutral: 'rgba(46, 47, 51, 0.88)',
  labelAlt: 'rgba(55, 56, 60, 0.61)',
  labelAssist: 'rgba(55, 56, 60, 0.28)',
  labelDisable: 'rgba(55, 56, 60, 0.16)',

  bgNormal: '#FFFFFF',
  bgAlt: '#F7F7F8',

  lineNormal: 'rgba(112, 115, 124, 0.22)',
  lineAlt: 'rgba(112, 115, 124, 0.08)',

  cam: '#0B0D10',
  skeleton: '#5BE5C6',

  cool96: '#E1E2E4',
  cool98: '#F4F4F5',
} as const;

export function statusColor(status: string): string {
  if (['heel_strike', 'stiff_knee', 'over_stride', 'high_oscillation', 'danger'].includes(status)) {
    return colors.danger;
  }
  if (['borderline', 'forefoot_strike', 'warn'].includes(status)) {
    return colors.warn;
  }
  return colors.good;
}
