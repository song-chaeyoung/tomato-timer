import type { TimerStatus, WorkerCommand, WorkerEvent } from '../types/timer'

let remainingSeconds = 0
let status: TimerStatus = 'idle'
let deadlineAt = 0
let timerId: number | null = null
let lastSentSeconds = -1

const post = (event: WorkerEvent) => {
  self.postMessage(event)
}

const stopLoop = () => {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
}

const getRemainingFromDeadline = () => {
  const diff = deadlineAt - Date.now()
  return Math.max(0, Math.ceil(diff / 1000))
}

const emitState = (at = Date.now()) => {
  post({
    type: 'STATE',
    status,
    remainingSeconds,
    at,
  })
}

const complete = (at = Date.now()) => {
  stopLoop()
  remainingSeconds = 0
  status = 'idle'
  deadlineAt = 0
  lastSentSeconds = 0
  post({ type: 'COMPLETED', at })
}

const tick = () => {
  if (status !== 'running') {
    return
  }

  const next = getRemainingFromDeadline()
  if (next === lastSentSeconds) {
    return
  }

  remainingSeconds = next
  lastSentSeconds = next
  const at = Date.now()
  post({ type: 'TICK', remainingSeconds: next, at })

  if (next <= 0) {
    complete(at)
  }
}

const startLoop = () => {
  stopLoop()
  timerId = self.setInterval(tick, 250)
}

const startRunning = (nextRemainingSeconds: number) => {
  const normalized = Math.max(0, Math.floor(nextRemainingSeconds))
  if (normalized <= 0) {
    complete()
    return
  }

  remainingSeconds = normalized
  status = 'running'
  deadlineAt = Date.now() + normalized * 1000
  lastSentSeconds = normalized
  emitState()
  startLoop()
}

self.onmessage = (event: MessageEvent<WorkerCommand>) => {
  const message = event.data

  switch (message.type) {
    case 'START': {
      startRunning(message.remainingSeconds)
      break
    }
    case 'PAUSE': {
      if (status !== 'running') {
        break
      }

      remainingSeconds = getRemainingFromDeadline()
      status = 'paused'
      deadlineAt = 0
      stopLoop()
      emitState()
      break
    }
    case 'RESUME': {
      if (status === 'running') {
        break
      }

      startRunning(remainingSeconds)
      break
    }
    case 'RESET': {
      stopLoop()
      remainingSeconds = Math.max(0, Math.floor(message.remainingSeconds))
      status = 'idle'
      deadlineAt = 0
      lastSentSeconds = remainingSeconds
      emitState()
      break
    }
    case 'SYNC': {
      stopLoop()
      remainingSeconds = Math.max(0, Math.floor(message.remainingSeconds))
      status = message.status

      if (status === 'running' && remainingSeconds > 0) {
        deadlineAt = Date.now() + remainingSeconds * 1000
        lastSentSeconds = remainingSeconds
        emitState()
        startLoop()
      } else {
        deadlineAt = 0
        lastSentSeconds = remainingSeconds
        emitState()
      }
      break
    }
    default: {
      break
    }
  }
}
