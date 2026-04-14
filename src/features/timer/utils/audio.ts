export const playCompletionTone = () => {
  try {
    const AudioContextClass = window.AudioContext
    if (!AudioContextClass) {
      return
    }

    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'triangle'
    oscillator.frequency.value = 880
    gain.gain.value = 0.05

    oscillator.connect(gain)
    gain.connect(context.destination)

    oscillator.start()
    oscillator.stop(context.currentTime + 0.25)
    oscillator.onended = () => {
      void context.close()
    }
  } catch {
    return
  }
}

