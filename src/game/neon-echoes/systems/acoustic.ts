export const ACOUSTIC_TARGET = { frequency: 68, phase: 37 }

export function computeSyncError(frequency: number, phase: number) {
  const frequencyError = Math.abs(frequency - ACOUSTIC_TARGET.frequency) / 100
  const phaseError = Math.abs(phase - ACOUSTIC_TARGET.phase) / 100
  return Math.round(Math.min(100, Math.sqrt(frequencyError ** 2 + phaseError ** 2) * 118))
}

export function isAcousticSyncComplete(frequency: number, phase: number) {
  return computeSyncError(frequency, phase) <= 8
}

export function waveformPath(value: number, phase: number, width = 680, height = 170) {
  const points: string[] = []
  const amplitude = height * 0.28
  const center = height / 2
  const cycles = 2.2 + value / 38
  const phaseRadians = phase / 100 * Math.PI * 2
  for (let x = 0; x <= width; x += 8) {
    const y = center + Math.sin((x / width) * Math.PI * 2 * cycles + phaseRadians) * amplitude
    points.push(`${x === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return points.join(' ')
}
