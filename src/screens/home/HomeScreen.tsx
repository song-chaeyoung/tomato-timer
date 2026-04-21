import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCallback, useState, useSyncExternalStore } from "react";
import { useShallow } from "zustand/react/shallow";
import { getPhaseDurationSeconds } from "@/src/constants/timer";
import { DEFAULT_THEME_PREFERENCE } from "@/src/features/theme/constants/theme";
import { GrowthCard } from "@/src/features/progress/components/GrowthCard";
import { useUserProgress } from "@/src/features/progress/hooks/useUserProgress";
import { useThemePreference } from "@/src/features/theme/hooks/useThemePreference";
import { TimerControls } from "@/src/features/timer/components/TimerControls";
import { TimerDial } from "@/src/features/timer/components/TimerDial";
import { TimerSettingsPanel } from "@/src/features/timer/components/TimerSettingsPanel";
import { useTimerStore } from "@/src/store/timerStore";
import type { ThemeController, ThemePreference } from "@/src/types/theme";
import type { TimerSettings } from "@/src/types/timer";
import { useHomeTimerController } from "./hooks/useHomeTimerController";

type HomeScreenProps = {
  guestCharacterImageUrl: string | null;
};

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
  { value: "system", label: "시스템" },
];

const subscribeHydration = (onStoreChange: () => void) => {
  void onStoreChange;
  return () => undefined;
};

function HomeScreen({ guestCharacterImageUrl }: HomeScreenProps) {
  const { data: session, status: sessionStatus } = useSession();
  const themeController: ThemeController = useThemePreference();
  const { theme, resolvedTheme, setTheme } = themeController;
  const isHydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  const renderedTheme = isHydrated ? theme : DEFAULT_THEME_PREFERENCE;
  const renderedResolvedTheme = isHydrated ? resolvedTheme : "light";
  const {
    phase,
    focusCountInSet,
    settings,
    status,
    remainingSeconds,
    lastUpdatedAt,
    setStatus,
    resetAll,
    applySettings,
    hydrate,
    advancePhaseAfterCompletion,
  } = useTimerStore(
    useShallow((state) => ({
      phase: state.phase,
      focusCountInSet: state.focusCountInSet,
      settings: state.settings,
      status: state.status,
      remainingSeconds: state.remainingSeconds,
      lastUpdatedAt: state.lastUpdatedAt,
      setStatus: state.setStatus,
      resetAll: state.resetAll,
      applySettings: state.applySettings,
      hydrate: state.hydrate,
      advancePhaseAfterCompletion: state.advancePhaseAfterCompletion,
    })),
  );

  const {
    progress,
    isLoading: isProgressLoading,
    error: progressError,
    recordFocusCompletion,
  } = useUserProgress({ sessionStatus });

  const handleFocusCompleted = useCallback(
    async (completedAt: number, completedSettings: TimerSettings) => {
      await recordFocusCompletion({
        completedAt,
        focusSeconds: getPhaseDurationSeconds("focus", completedSettings),
        focusMinutes: completedSettings.focusMinutes,
      });
    },
    [recordFocusCompletion],
  );

  const {
    pipSupported,
    pipError,
    runPrimaryAction,
    resetTimer,
    handleOpenPipWindow,
    handleSettingsChange,
  } = useHomeTimerController({
    phase,
    focusCountInSet,
    settings,
    status,
    remainingSeconds,
    lastUpdatedAt,
    setStatus,
    resetAll,
    applySettings,
    hydrate,
    advancePhaseAfterCompletion,
    onFocusCompleted: handleFocusCompleted,
  });

  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  return (
    <main className="relative isolate flex min-h-screen w-full items-start justify-center px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <section className="tomato-shell-enter tomato-shell-pixel pixel-corners relative grid w-full max-w-[1080px] content-start gap-4 overflow-hidden rounded-[24px] border border-tomato-border/75 bg-tomato-card p-[clamp(14px,2vw,22px)] shadow-[var(--shadow-shell)]">
        <div
          className="pixel-matrix pixel-matrix-left pointer-events-none absolute -left-8 -top-10 h-40 w-44"
          aria-hidden="true"
        />
        <div
          className="pixel-matrix pixel-matrix-right pointer-events-none absolute -bottom-10 -right-8 h-32 w-36"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-tomato-accent/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[var(--color-leaf-accent)]/8 blur-3xl"
          aria-hidden="true"
        />

        <header className="tomato-shell-content relative flex flex-wrap items-start justify-between gap-4 text-left">
          <div className="flex min-w-0 items-start gap-3.5">
            <Image
              src="/LOGO.png"
              alt="토마토 타이머 로고"
              width={52}
              height={52}
              className="tomato-logo h-[52px] w-[52px] shrink-0 rounded-[11px] border border-tomato-border-soft/75 bg-[var(--color-tomato-panel-elevated)] object-cover p-[2px]"
            />
            <div className="min-w-0 space-y-1.5">
              <p className="tomato-callout pixel-corners-sm m-0 inline-flex max-w-fit text-[11px] font-semibold tracking-[0.02em]">
                집중력이 흐려질 때
              </p>
              <h1 className="tomato-title m-0 font-display text-[clamp(30px,5.8vw,50px)] text-tomato-title">
                뽀모도로 타이머
              </h1>
              <p className="m-0 text-[13px] leading-5 text-tomato-help">
                지금 시작하고, 리듬을 유지하고, 루틴을 완성하세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-[12px] border border-tomato-border-soft/70 bg-[var(--color-tomato-panel)] px-3 py-2">
            <div className="space-y-0.5">
              <p className="m-0 text-[10px] font-semibold tracking-[0.04em] text-tomato-meta">
                THEME
              </p>
              <p className="m-0 text-[11px] text-tomato-help">
                현재 {renderedResolvedTheme === "dark" ? "다크" : "라이트"}
              </p>
            </div>
            <div
              role="group"
              aria-label="테마 선택"
              className="grid grid-cols-3 overflow-hidden rounded-[10px] border border-tomato-border-soft bg-[var(--color-tomato-panel-elevated)]"
            >
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-label={`${option.label} 테마로 전환`}
                  aria-pressed={renderedTheme === option.value}
                  className="cursor-pointer border-r border-tomato-border-soft/60 px-2.5 py-1.5 text-[11px] font-semibold text-tomato-subtle transition-colors last:border-r-0 hover:bg-[var(--color-tomato-button-soft)] aria-pressed:bg-[var(--color-tomato-accent)] aria-pressed:text-white"
                  onClick={() => setTheme(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="tomato-shell-content relative grid gap-4 lg:grid-cols-[minmax(0,1.22fr)_minmax(300px,0.78fr)] lg:items-start lg:gap-5">
          <TimerDial
            phase={phase}
            focusCountInSet={focusCountInSet}
            settings={settings}
            status={status}
            remainingSeconds={remainingSeconds}
          />

          <section className="pixel-corners flex flex-col gap-3.5 rounded-[18px] border border-tomato-border-soft/60 bg-[var(--color-tomato-panel)] p-3.5 sm:p-4">
            <TimerControls
              status={status}
              pipSupported={Boolean(pipSupported)}
              onRunPrimaryAction={runPrimaryAction}
              onResetTimer={resetTimer}
              onOpenPipWindow={handleOpenPipWindow}
            />

            <button
              type="button"
              className="cursor-pointer rounded-xl border border-tomato-border-soft bg-[var(--color-tomato-button-soft)] px-4 py-3 text-sm font-semibold text-tomato-ink-strong transition-[transform,box-shadow,background-color,border-color] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1px] hover:border-tomato-border hover:bg-[var(--color-tomato-panel-elevated)] active:translate-y-0"
              onClick={() => {
                setIsSettingsDialogOpen(true);
              }}
            >
              세트 설정
            </button>

            <GrowthCard
              sessionStatus={sessionStatus}
              progress={progress}
              isLoading={isProgressLoading}
              error={progressError}
              userName={session?.user?.name}
              guestCharacterImageUrl={guestCharacterImageUrl}
            />

            <TimerSettingsPanel
              open={isSettingsDialogOpen}
              onOpenChange={setIsSettingsDialogOpen}
              settings={settings}
              disabled={status !== "idle"}
              onSave={handleSettingsChange}
            />

            <div className="space-y-1">
              {pipSupported === false && (
                <p className="mb-0 text-[13px] leading-5 text-tomato-help">
                  현재 브라우저에서는 작은 PiP 창을 지원하지 않습니다.
                </p>
              )}

              {pipError && (
                <p className="mb-0 text-[13px] font-medium leading-5 text-tomato-error">
                  {pipError}
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default HomeScreen;
