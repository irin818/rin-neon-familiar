import { useCallback, useEffect, useRef, useState } from 'react'

export function useAmbientAudio() {
  const contextRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<OscillatorNode[]>([])
  const [enabled, setEnabled] = useState(false)

  const stop = useCallback(() => {
    nodesRef.current.forEach((node) => {
      try {
        node.stop()
      } catch {
        // Already stopped.
      }
    })
    nodesRef.current = []
    void contextRef.current?.close()
    contextRef.current = null
    setEnabled(false)
  }, [])

  const toggle = useCallback(() => {
    if (contextRef.current) {
      stop()
      return
    }

    const AudioContextClass = window.AudioContext
    const context = new AudioContextClass()
    contextRef.current = context
    const start = () => {
      if (contextRef.current !== context || context.state === 'closed') return
      const master = context.createGain()
      master.gain.setValueAtTime(0.018, context.currentTime)
      master.connect(context.destination)

      const oscillators = [55, 82.5].map((frequency, index) => {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = index === 0 ? 'sine' : 'triangle'
        oscillator.frequency.value = frequency
        gain.gain.value = index === 0 ? 0.7 : 0.18
        oscillator.connect(gain).connect(master)
        oscillator.start()
        return oscillator
      })

      nodesRef.current = oscillators
      setEnabled(true)
    }

    if (context.state === 'suspended') {
      void context.resume().then(start).catch(stop)
    } else {
      start()
    }
  }, [stop])

  useEffect(() => stop, [stop])

  return { enabled, toggle, stop }
}
