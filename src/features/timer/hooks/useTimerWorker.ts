import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { TimerSnapshot, WorkerCommand, WorkerEvent } from '../../../types/timer'
import type { TimerWorkerControls } from '../types/timerFeature'

type TimerSnapshotBase = Pick<TimerSnapshot, 'phase' | 'focusCountInSet' | 'settings'>

type UseTimerWorkerOptions = {
  getCurrentSnapshotBase: () => TimerSnapshotBase
  onSnapshot: (snapshot: TimerSnapshot) => void
  onCompleted: (completedPhase: TimerSnapshot['phase'], at: number) => void
}

const buildWorkerSnapshot = (
  snapshotBase: TimerSnapshotBase,
  status: TimerSnapshot['status'],
  remainingSeconds: number,
  at: number,
): TimerSnapshot => ({
  ...snapshotBase,
  status,
  remainingSeconds,
  lastUpdatedAt: at,
})

export const useTimerWorker = (
  options: UseTimerWorkerOptions,
): TimerWorkerControls => {
  const workerRef = useRef<Worker | null>(null)
  const queuedWorkerCommandRef = useRef<WorkerCommand | null>(null)
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const postWorkerMessage = useCallback((message: WorkerCommand) => {
    const worker = workerRef.current
    if (worker) {
      worker.postMessage(message)
      return
    }

    queuedWorkerCommandRef.current = message
  }, [])

  useEffect(() => {
    const worker = new Worker(new URL('../../../workers/timer.worker.ts', import.meta.url), {
      type: 'module',
    })

    workerRef.current = worker

    worker.onmessage = (event: MessageEvent<WorkerEvent>) => {
      const message = event.data
      const snapshotBase = optionsRef.current.getCurrentSnapshotBase()

      switch (message.type) {
        case 'TICK': {
          optionsRef.current.onSnapshot(
            buildWorkerSnapshot(snapshotBase, 'running', message.remainingSeconds, message.at),
          )
          break
        }
        case 'STATE': {
          optionsRef.current.onSnapshot(
            buildWorkerSnapshot(
              snapshotBase,
              message.status,
              message.remainingSeconds,
              message.at,
            ),
          )
          break
        }
        case 'COMPLETED': {
          optionsRef.current.onCompleted(snapshotBase.phase, message.at)
          break
        }
        default: {
          break
        }
      }
    }

    const queued = queuedWorkerCommandRef.current
    if (queued) {
      worker.postMessage(queued)
      queuedWorkerCommandRef.current = null
    }

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const start = useCallback(
    (remainingSeconds: number) => {
      postWorkerMessage({ type: 'START', remainingSeconds })
    },
    [postWorkerMessage],
  )
  const pause = useCallback(() => {
    postWorkerMessage({ type: 'PAUSE' })
  }, [postWorkerMessage])
  const resume = useCallback(() => {
    postWorkerMessage({ type: 'RESUME' })
  }, [postWorkerMessage])
  const reset = useCallback(
    (remainingSeconds: number) => {
      postWorkerMessage({ type: 'RESET', remainingSeconds })
    },
    [postWorkerMessage],
  )
  const sync = useCallback(
    (status: TimerSnapshot['status'], remainingSeconds: number) => {
      postWorkerMessage({ type: 'SYNC', status, remainingSeconds })
    },
    [postWorkerMessage],
  )

  return useMemo(
    () => ({
      start,
      pause,
      resume,
      reset,
      sync,
    }),
    [pause, reset, resume, start, sync],
  )
}
