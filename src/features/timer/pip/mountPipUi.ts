import { PHASE_LABEL } from "../../../constants/timer";
import { MODE_DIAL_THEME, STATUS_COPY, STATUS_TONE } from "../constants/ui";

const THEME_VARIABLE_PREFIXES = ["--font-", "--color-", "--shadow-"] as const;
const THEME_ATTRIBUTE_NAMES = ["data-theme", "data-theme-preference"] as const;

export const mountPipUi = (pipWindow: Window, channelName: string) => {
  const doc = pipWindow.document;
  doc.title = "토마토 PiP";

  const hostRoot = document.documentElement;
  const pipRoot = doc.documentElement;

  const syncThemeTokens = () => {
    const sourceStyles = window.getComputedStyle(hostRoot);
    for (let index = 0; index < sourceStyles.length; index += 1) {
      const name = sourceStyles[index];
      if (!THEME_VARIABLE_PREFIXES.some((prefix) => name.startsWith(prefix))) {
        continue;
      }
      const value = sourceStyles.getPropertyValue(name).trim();
      if (!value) {
        continue;
      }
      pipRoot.style.setProperty(name, value);
    }

    pipRoot.classList.toggle("dark", hostRoot.classList.contains("dark"));

    for (const attributeName of THEME_ATTRIBUTE_NAMES) {
      const attributeValue = hostRoot.getAttribute(attributeName);
      if (attributeValue === null) {
        pipRoot.removeAttribute(attributeName);
        continue;
      }
      pipRoot.setAttribute(attributeName, attributeValue);
    }
  };

  syncThemeTokens();

  const themeObserver = new MutationObserver(() => {
    syncThemeTokens();
  });
  themeObserver.observe(hostRoot, {
    attributes: true,
    attributeFilter: ["class", ...THEME_ATTRIBUTE_NAMES],
  });
  pipWindow.addEventListener(
    "pagehide",
    () => {
      themeObserver.disconnect();
    },
    { once: true },
  );

  doc.head.innerHTML = "";
  doc.body.innerHTML = `
    <div class="pip-shell">
      <div class="pip-dial-frame">
        <button type="button" class="pip-status" data-role="status" aria-label="타이머 상태">■</button>
        <span class="pip-badge" data-role="badge"></span>
        <div class="pip-dial">
          <div class="pip-ring" data-role="ring"></div>
          <div class="pip-inner" aria-hidden="true"></div>
          <div class="pip-ticks" data-role="ticks" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  `;

  const style = doc.createElement("style");
  style.textContent = `
    :root {
      color-scheme: light dark;
      font-family: var(--font-sans, 'Pretendard', 'Noto Sans KR', 'Segoe UI', sans-serif);
      background: var(--color-tomato-page, #fff7ed);
      color: var(--color-tomato-ink, #281507);
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    * {
      box-sizing: border-box;
    }
    *::-webkit-scrollbar {
      width: 0;
      height: 0;
      display: none;
    }
    body {
      margin: 0;
      padding: 4px;
      min-width: 0;
      overscroll-behavior: none;
      background:
        radial-gradient(360px 220px at 0% 0%, color-mix(in oklch, var(--color-tomato-card, #fffaf2) 86%, var(--color-tomato-page, #fff7ed)), transparent 72%),
        radial-gradient(280px 200px at 100% 0%, color-mix(in oklch, var(--color-tomato-accent, #f17a4a) 20%, var(--color-tomato-page, #fff7ed)), transparent 76%),
        linear-gradient(164deg, color-mix(in oklch, var(--color-tomato-page, #fff7ed) 90%, var(--color-tomato-card, #fffaf2)), var(--color-tomato-page, #fff7ed));
    }
    .pip-shell {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      border: none;
      background: color-mix(in oklch, var(--color-tomato-card, #fffaf2) 92%, var(--color-tomato-page, #fff7ed));
      box-shadow: 0 8px 16px rgba(99, 47, 14, 0.12);
      padding: 4px;
    }
    .pip-status {
      margin: 0;
      position: absolute;
      left: 8px;
      top: 8px;
      z-index: 2;
      display: grid;
      place-items: center;
      width: 14px;
      height: 14px;
      text-align: center;
      border: none;
      border-radius: 999px;
      padding: 0;
      background: transparent;
      font-size: 11px;
      line-height: 1;
      font-weight: 700;
      box-shadow: none;
      cursor: pointer;
      animation: pip-status-shift 220ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .pip-dial-frame {
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      border: none;
      background: transparent;
      padding: 3px;
      box-shadow: none;
    }
    .pip-badge {
      position: absolute;
      left: 50%;
      top: 6px;
      transform: translateX(-50%);
      width: 20px;
      height: 3px;
      border-radius: 999px;
      background: var(--color-phase-focus-badge, #ff8f42);
    }
    .pip-dial {
      position: relative;
      aspect-ratio: 1 / 1;
      width: 100%;
      max-height: 100%;
      overflow: hidden;
      border-radius: 999px;
      border: 1px solid color-mix(in oklch, var(--pip-ring-border, #ebdbcb) 65%, white);
      background: var(--pip-ring-bg, #f8f0e8);
    }
    .pip-ring {
      position: absolute;
      inset: 7px;
      border-radius: 999px;
      box-shadow: inset 0 1px 1px var(--color-dial-gloss, rgba(255, 255, 255, 0.72));
      transition: background 260ms linear;
    }
    .pip-inner {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 26px;
      height: 26px;
      transform: translate(-50%, -50%);
      border-radius: 999px;
      border: none;
      background: var(--pip-core-bg, #fffdfb);
      box-shadow: 0 2px 6px var(--pip-core-shadow, rgba(77, 66, 56, 0.12));
    }
    .pip-ticks {
      position: absolute;
      inset: 11px;
    }
    .pip-tick-layer {
      position: absolute;
      inset: 0;
    }
    .pip-tick {
      position: absolute;
      left: 50%;
      top: 2%;
      transform: translateX(-50%);
      border-radius: 999px;
      width: 1.25px;
      height: 5px;
      background: var(--pip-tick-minor, #95806c);
    }
    .pip-tick.is-major {
      width: 1.6px;
      height: 9px;
      background: var(--pip-tick-major, #6f5645);
    }
    @keyframes pip-status-shift {
      from {
        transform: translateY(4px);
        opacity: 0.6;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .pip-status {
        animation: none;
      }
    }
  `;

  const script = doc.createElement("script");
  script.text = `
    (() => {
      const channel = new BroadcastChannel(${JSON.stringify(channelName)});
      const phaseLabels = ${JSON.stringify(PHASE_LABEL)};
      const dialThemes = ${JSON.stringify(MODE_DIAL_THEME)};
      const statusCopyMap = ${JSON.stringify(STATUS_COPY)};
      const statusToneMap = ${JSON.stringify(STATUS_TONE)};
      const statusSymbolMap = { idle: '■', running: '▶', paused: 'Ⅱ' };
      const controlActionLabelMap = { START: '시작', PAUSE: '일시정지', RESUME: '재개' };

      let snapshot = null;
      let durations = null;
      let tickCacheKey = '';
      let previousStatus = null;

      const ringElement = document.querySelector('[data-role="ring"]');
      const ticksElement = document.querySelector('[data-role="ticks"]');
      const badgeElement = document.querySelector('[data-role="badge"]');
      const statusElement = document.querySelector('[data-role="status"]');
      const frameElement = document.querySelector('.pip-dial-frame');
      const dialElement = document.querySelector('.pip-dial');
      const innerElement = document.querySelector('.pip-inner');

      const resolvePrimaryControlAction = () => {
        if (!snapshot) {
          return null;
        }
        if (snapshot.status === 'running') {
          return 'PAUSE';
        }
        if (snapshot.status === 'paused') {
          return 'RESUME';
        }
        return 'START';
      };

      const renderTicks = (totalMinutes, dialTheme) => {
        if (!ticksElement) {
          return;
        }
        const key = totalMinutes + '-' + dialTheme.tickMajor + '-' + dialTheme.tickMinor;
        if (tickCacheKey === key) {
          return;
        }
        tickCacheKey = key;
        const majorTickInterval = totalMinutes <= 10 ? 1 : 5;
        const unitAngle = 360 / totalMinutes;
        const markup = Array.from({ length: totalMinutes }, (_, value) => {
          const isMajor = value % majorTickInterval === 0;
          const className = isMajor ? 'pip-tick is-major' : 'pip-tick';
          const color = isMajor ? dialTheme.tickMajor : dialTheme.tickMinor;
          return '<span class="pip-tick-layer" style="transform: rotate(' + (value * unitAngle) + 'deg)"><span class="' + className + '" style="background:' + color + '"></span></span>';
        }).join('');
        ticksElement.innerHTML = markup;
      };

      const applyStatusTone = (status) => {
        if (!statusElement) {
          return;
        }
        const tone = statusToneMap[status] || statusToneMap.idle;
        statusElement.style.color = tone.text;
        if (previousStatus !== status) {
          statusElement.style.animation = 'none';
          void statusElement.offsetHeight;
          statusElement.style.animation = '';
          previousStatus = status;
        }
      };

      const applyDialSurface = (dialTheme) => {
        if (frameElement) {
          frameElement.style.setProperty('--pip-frame-border', dialTheme.frameBorder);
          frameElement.style.setProperty('--pip-frame-bg', dialTheme.frameBackground);
        }
        if (dialElement) {
          dialElement.style.setProperty('--pip-ring-border', dialTheme.ringBorder);
          dialElement.style.setProperty('--pip-ring-bg', dialTheme.ringBackground);
          dialElement.style.setProperty('--pip-tick-minor', dialTheme.tickMinor);
          dialElement.style.setProperty('--pip-tick-major', dialTheme.tickMajor);
        }
        if (innerElement) {
          innerElement.style.setProperty('--pip-core-border', dialTheme.coreBorder);
          innerElement.style.setProperty('--pip-core-bg', dialTheme.coreBackground);
          innerElement.style.setProperty('--pip-core-shadow', dialTheme.coreShadow);
        }
      };

      const render = () => {
        if (!snapshot || !durations) {
          return;
        }

        const totalSeconds = durations[snapshot.phase] || 1;
        const progress = Math.max(0, Math.min(100, (snapshot.remainingSeconds / totalSeconds) * 100));
        const progressDegrees = progress * 3.6;
        const totalMinutes = Math.max(1, Math.floor(totalSeconds / 60));
        const dialTheme = dialThemes[snapshot.phase] || dialThemes.focus;
        const statusCopy = statusCopyMap[snapshot.status] || statusCopyMap.idle;

        renderTicks(totalMinutes, dialTheme);
        applyDialSurface(dialTheme);
        applyStatusTone(snapshot.status);

        if (statusElement) {
          const action = resolvePrimaryControlAction();
          const actionLabel = action ? controlActionLabelMap[action] : null;
          statusElement.textContent = statusSymbolMap[snapshot.status] || statusSymbolMap.idle;
          statusElement.title = actionLabel
            ? statusCopy.label + ' · 클릭하여 ' + actionLabel
            : statusCopy.label;
          statusElement.setAttribute(
            'aria-label',
            actionLabel
              ? statusCopy.label + ', 클릭하여 ' + actionLabel
              : statusCopy.label,
          );
        }
        if (ringElement) {
          if (progressDegrees <= 0) {
            ringElement.style.background = 'conic-gradient(from -90deg, ' + dialTheme.empty + ' 0deg, ' + dialTheme.empty + ' 360deg)';
          } else if (progressDegrees >= 360) {
            ringElement.style.background = 'conic-gradient(from -90deg, ' + dialTheme.fillStart + ' 0deg, ' + dialTheme.fillEnd + ' 360deg)';
          } else {
            const blendDegrees = 0.9;
            const blendStart = Math.max(0, progressDegrees - blendDegrees);
            const blendEnd = Math.min(360, progressDegrees + blendDegrees);
            const blendColor = 'color-mix(in oklch, ' + dialTheme.fillEnd + ' 56%, ' + dialTheme.empty + ')';
            ringElement.style.background = 'conic-gradient(from -90deg, ' + dialTheme.fillStart + ' 0deg, ' + dialTheme.fillEnd + ' ' + blendStart + 'deg, ' + blendColor + ' ' + progressDegrees + 'deg, ' + dialTheme.empty + ' ' + blendEnd + 'deg, ' + dialTheme.empty + ' 360deg)';
          }
        }
        if (badgeElement) {
          badgeElement.style.backgroundColor = dialTheme.badge;
        }

        document.title = '토마토 PiP - ' + phaseLabels[snapshot.phase] + ' ' + snapshot.focusCountInSet + '/' + snapshot.settings.longBreakInterval;
      };

      if (statusElement) {
        statusElement.addEventListener('click', () => {
          const action = resolvePrimaryControlAction();
          if (!action) {
            return;
          }
          channel.postMessage({ type: 'CONTROL', action });
        });
      }

      channel.onmessage = (event) => {
        const message = event.data;
        if (!message || message.type !== 'SNAPSHOT') {
          return;
        }

        snapshot = message.snapshot;
        durations = message.durations;
        render();
      };

      channel.postMessage({ type: 'REQUEST_SYNC' });
      window.addEventListener('beforeunload', () => channel.close());
    })();
  `;

  doc.head.append(style);
  doc.body.append(script);
};
