import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildPhaseDurations,
  PIP_CHANNEL_NAME,
} from "../../../constants/timer";
import type {
  PipMessageFromMain,
  PipMessageToMain,
  TimerSnapshot,
} from "../../../types/timer";
import type { PipBridgeOptions } from "../types/timerFeature";
import { mountPipUi } from "../pip/mountPipUi";

type DocumentPictureInPictureHandle = {
  requestWindow: (options?: {
    width?: number;
    height?: number;
  }) => Promise<Window>;
};

const getDocumentPictureInPicture = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const scope = window as Window & {
    documentPictureInPicture?: DocumentPictureInPictureHandle;
  };
  return scope.documentPictureInPicture;
};

export const usePipBridge = (options: PipBridgeOptions) => {
  const [pipError, setPipError] = useState<string | null>(null);
  const [pipSupported, setPipSupported] = useState<boolean | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setPipSupported(Boolean(getDocumentPictureInPicture()));
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  const pushSnapshotToPip = useCallback((snapshot: TimerSnapshot) => {
    const channel = channelRef.current;
    if (!channel) {
      return;
    }

    const message: PipMessageFromMain = {
      type: "SNAPSHOT",
      snapshot,
      durations: buildPhaseDurations(snapshot.settings),
    };

    channel.postMessage(message);
  }, []);

  const openPipWindow = useCallback(async () => {
    const pip = getDocumentPictureInPicture();
    if (!pip) {
      setPipError("이 브라우저는 Document PiP를 지원하지 않습니다.");
      return;
    }

    const opened = pipWindowRef.current;
    if (opened && !opened.closed) {
      opened.focus();
      return;
    }

    try {
      const nextWindow = await pip.requestWindow({ width: 200, height: 260 });
      pipWindowRef.current = nextWindow;
      setPipError(null);
      mountPipUi(nextWindow, PIP_CHANNEL_NAME);

      nextWindow.addEventListener("pagehide", () => {
        if (pipWindowRef.current === nextWindow) {
          pipWindowRef.current = null;
        }
      });

      pushSnapshotToPip(optionsRef.current.snapshot);
    } catch {
      setPipError(
        "PiP 창을 열 수 없습니다. 브라우저 권한 상태를 확인해주세요.",
      );
    }
  }, [pushSnapshotToPip]);

  useEffect(() => {
    const channel = new BroadcastChannel(PIP_CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<PipMessageToMain>) => {
      const message = event.data;
      if (!message) {
        return;
      }

      if (message.type === "REQUEST_SYNC") {
        pushSnapshotToPip(optionsRef.current.snapshot);
        return;
      }

      if (message.type !== "CONTROL") {
        return;
      }

      if (message.action === "START") {
        optionsRef.current.onStart();
        return;
      }

      if (message.action === "PAUSE") {
        optionsRef.current.onPause();
        return;
      }

      if (message.action === "RESUME") {
        optionsRef.current.onResume();
        return;
      }

      if (message.action === "RESET") {
        optionsRef.current.onReset();
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [pushSnapshotToPip]);

  useEffect(() => {
    pushSnapshotToPip(options.snapshot);
  }, [options.snapshot, pushSnapshotToPip]);

  useEffect(() => {
    return () => {
      const pipWindow = pipWindowRef.current;
      if (pipWindow && !pipWindow.closed) {
        pipWindow.close();
      }
    };
  }, []);

  return {
    pipSupported,
    pipError,
    openPipWindow,
  };
};
