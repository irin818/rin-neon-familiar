import type { GameSettings, SceneId } from './types'

type CueId = 'ui' | 'collect' | 'danger' | 'graffiti-ok' | 'graffiti-fail' | 'sync' | 'dialogue'

const sceneFrequencies: Record<SceneId, number> = {
  'neon-balcony': 72,
  'service-corridor': 58,
  'signal-gate': 86,
  'rin-safehouse': 110,
  'rooftop-relay': 132,
}

export class AudioManager {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private music: GainNode | null = null
  private ambience: GainNode | null = null
  private effects: GainNode | null = null
  private dialogue: GainNode | null = null
  private drone: OscillatorNode | null = null
  private rainSource: AudioBufferSourceNode | null = null
  private scene: SceneId = 'neon-balcony'

  async unlock(settings: GameSettings) {
    try {
      if (!this.context || this.context.state === 'closed') this.createContext()
      if (this.context?.state === 'suspended') await this.context.resume()
      this.applySettings(settings)
      return true
    } catch {
      return false
    }
  }

  private createContext() {
    const context = new AudioContext()
    this.context = context
    this.master = context.createGain()
    this.music = context.createGain()
    this.ambience = context.createGain()
    this.effects = context.createGain()
    this.dialogue = context.createGain()
    this.music.connect(this.master)
    this.ambience.connect(this.master)
    this.effects.connect(this.master)
    this.dialogue.connect(this.master)
    this.master.connect(context.destination)

    const drone = context.createOscillator()
    const droneGain = context.createGain()
    drone.type = 'sine'
    drone.frequency.value = sceneFrequencies[this.scene]
    droneGain.gain.value = 0.024
    drone.connect(droneGain).connect(this.music)
    drone.start()
    this.drone = drone

    const rainBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
    const data = rainBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.18
    const rain = context.createBufferSource()
    const filter = context.createBiquadFilter()
    rain.buffer = rainBuffer
    rain.loop = true
    filter.type = 'bandpass'
    filter.frequency.value = 1450
    filter.Q.value = 0.34
    rain.connect(filter).connect(this.ambience)
    rain.start()
    this.rainSource = rain
  }

  applySettings(settings: GameSettings) {
    const now = this.context?.currentTime ?? 0
    this.master?.gain.setTargetAtTime(settings.masterVolume, now, 0.04)
    this.music?.gain.setTargetAtTime(settings.musicVolume, now, 0.04)
    this.ambience?.gain.setTargetAtTime(settings.ambienceVolume, now, 0.04)
    this.effects?.gain.setTargetAtTime(settings.effectsVolume, now, 0.04)
    this.dialogue?.gain.setTargetAtTime(settings.dialogueVolume, now, 0.04)
  }

  setScene(sceneId: SceneId) {
    this.scene = sceneId
    if (!this.context || !this.drone) return
    this.drone.frequency.setTargetAtTime(sceneFrequencies[sceneId], this.context.currentTime, 0.7)
  }

  playCue(cue: CueId) {
    const context = this.context
    const destination = cue === 'dialogue' ? this.dialogue : this.effects
    if (!context || !destination || context.state !== 'running') return
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const frequencies: Record<CueId, number> = {
      ui: 440,
      collect: 660,
      danger: 118,
      'graffiti-ok': 520,
      'graffiti-fail': 92,
      sync: 780,
      dialogue: 320,
    }
    oscillator.type = cue === 'danger' || cue === 'graffiti-fail' ? 'sawtooth' : 'sine'
    oscillator.frequency.value = frequencies[cue]
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(cue === 'dialogue' ? 0.025 : 0.08, context.currentTime + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (cue === 'danger' ? 0.42 : 0.19))
    oscillator.connect(gain).connect(destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.46)
  }

  async suspend() {
    try {
      if (this.context?.state === 'running') await this.context.suspend()
    } catch {
      // Audio is optional; gameplay continues.
    }
  }

  async resume() {
    try {
      if (this.context?.state === 'suspended') await this.context.resume()
    } catch {
      // Audio is optional; gameplay continues.
    }
  }

  async destroy() {
    try {
      this.drone?.stop()
      this.rainSource?.stop()
      await this.context?.close()
    } catch {
      // Already stopped.
    } finally {
      this.context = null
      this.drone = null
      this.rainSource = null
      this.master = null
      this.music = null
      this.ambience = null
      this.effects = null
      this.dialogue = null
    }
  }
}

export const neonAudio = new AudioManager()
