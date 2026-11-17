import { useState, useEffect } from "react";
import {
  Globe,
  Sparkles,
  Palette,
  Sliders as SlidersIcon,
  Type,
  Layout,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
} from "lucide-react";
import { FullSteamStatus } from "./types/steam";
import { CommunityThemeItem, ThemeConfig } from "./types/theme";
import { tauriBridge } from "./services/tauriBridge";
import { StatusHeader } from "./components/Dashboard/StatusHeader";
import { CommunityCatalog } from "./components/Catalog/CommunityCatalog";
import { PresetBar } from "./components/Editor/PresetBar";
import { ColorPickers } from "./components/Editor/ColorPickers";
import { Sliders } from "./components/Editor/Sliders";
import { FontSelector } from "./components/Editor/FontSelector";
import { Toggles } from "./components/Editor/Toggles";
import { BackgroundControl } from "./components/Editor/BackgroundControl";
import { SteamPreview } from "./components/Preview/SteamPreview";
import { ProfileManager } from "./components/Profiles/ProfileManager";
import { CdpRequiredModal } from "./components/Modals/CdpRequiredModal";

type EditorTab = "catalog" | "presets" | "colors" | "geometry" | "typography" | "elements" | "profiles";

const FALLBACK_THEME: ThemeConfig = {
  version: 1,
  metadata: {
    id: "comm-fluent-win11",
    name: "Fluent for Steam (Windows 11)",
    author: "Fluent Team",
    version: "1.2.0",
    createdAt: "2026-11-17T00:00:00Z",
    description: "Оригинальный дизайн Windows 11 Fluent с эффектом полупрозрачности Mica",
  },
  colors: {
    accent: "#0078D4",
    accentHover: "#106EBE",
    primaryBackground: "#1C1C1C",
    secondaryBackground: "#242424",
    cardBackground: "#2E2E2E",
    cardHoverBackground: "#383838",
    textPrimary: "#FFFFFF",
    textSecondary: "#A0A0A0",
  },
  geometry: {
    cardRadiusPx: 10,
    buttonRadiusPx: 8,
  },
  typography: {
    fontFamily: "'Segoe UI Variable', 'Segoe UI', -apple-system, sans-serif",
    googleFontFamily: undefined,
  },
  background: {
    enabled: false,
    imageUrl: "",
    blurPx: 12,
    opacity: 0.3,
  },
  toggles: {
    hideWhatsNew: true,
    hideBottomDownloadBar: false,
    compactSidebar: false,
  },
};

export function App() {
  const [status, setStatus] = useState<FullSteamStatus | null>(null);
  const [communityCatalog, setCommunityCatalog] = useState<CommunityThemeItem[]>([]);
  const [presets, setPresets] = useState<ThemeConfig[]>([]);
  const [savedThemes, setSavedThemes] = useState<ThemeConfig[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(FALLBACK_THEME);
  const [activeTab, setActiveTab] = useState<EditorTab>("catalog");

  const [isApplying, setIsApplying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isCdpModalOpen, setIsCdpModalOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const refreshStatus = async () => {
    try {
      const s = await tauriBridge.getSteamStatus();
      setStatus(s);
    } catch (err) {
      console.error("Ошибка получения статуса Steam:", err);
    }
  };

  const refreshThemes = async () => {
    try {
      const comm = await tauriBridge.getCommunityThemes();
      setCommunityCatalog(comm);

      const p = await tauriBridge.getPresets();
      setPresets(p);

      const s = await tauriBridge.getSavedThemes();
      setSavedThemes(s);

      // Инициализируем тему первым хитом из каталога, если стоит дефолт
      if (comm.length > 0 && currentTheme.metadata.id === FALLBACK_THEME.metadata.id) {
        setCurrentTheme(comm[0].theme);
      }
    } catch (err) {
      console.error("Ошибка загрузки каталога тем:", err);
    }
  };

  useEffect(() => {
    refreshStatus();
    refreshThemes();

    const interval = setInterval(refreshStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApplyTheme = async (themeToApply = currentTheme) => {
    // Если Steam не запущен с CEF отладкой — открываем умное модальное окно с 1-клик решением!
    if (status && !status.isCdpActive) {
      setCurrentTheme(themeToApply);
      setIsCdpModalOpen(true);
      return;
    }

    try {
      setIsApplying(true);
      const count = await tauriBridge.applyThemeCdp(themeToApply);
      showToast(
        `Тема «${themeToApply.metadata.name}» успешно применена к ${count} окнам Steam!`
      );
      refreshStatus();
    } catch (err: unknown) {
      // Если пришла ошибка недоступности порта — перенаправляем в модалку
      if (String(err).includes("8080") || String(err).includes("порт")) {
        setIsCdpModalOpen(true);
      } else {
        showToast(`Ошибка применения: ${String(err)}`, true);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleRestartAndApply = async () => {
    try {
      setIsRestarting(true);
      showToast("Перезапуск Steam в режиме отладки CEF...");
      await tauriBridge.restartSteamWithDebugging();

      // Ожидаем появления порта и повторно применяем тему
      let applied = false;
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 1200));
        try {
          const freshStatus = await tauriBridge.getSteamStatus();
          setStatus(freshStatus);
          if (freshStatus.isCdpActive) {
            await tauriBridge.applyThemeCdp(currentTheme);
            applied = true;
            break;
          }
        } catch (_) {
          // ignore retry
        }
      }

      setIsCdpModalOpen(false);
      if (applied) {
        showToast(`Steam перезапущен! Тема «${currentTheme.metadata.name}» успешно применена.`);
      } else {
        showToast("Steam запущен. Нажмите «Применить тему» ещё раз, как только клиент загрузится.");
      }
      refreshStatus();
    } catch (err: unknown) {
      showToast(`Ошибка: ${String(err)}`, true);
    } finally {
      setIsRestarting(false);
    }
  };

  const handleCreateShortcut = async () => {
    try {
      const path = await tauriBridge.createSteamShortcut();
      showToast(`Ярлык успешно создан на Рабочем столе:\n${path}`);
    } catch (err: unknown) {
      showToast(`Ошибка создания ярлыка: ${String(err)}`, true);
    }
  };

  const handleResetSteam = async () => {
    if (
      confirm(
        "Сбросить оформление Steam до стандартного вида Valve? Будут сняты все стили и восстановлены исходные файлы."
      )
    ) {
      try {
        setIsResetting(true);
        const report = await tauriBridge.resetToDefaultSteam();
        showToast(report.message);
        refreshStatus();
      } catch (err: unknown) {
        showToast(`Ошибка сброса: ${String(err)}`, true);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleRestartSteam = async () => {
    try {
      setIsRestarting(true);
      showToast("Перезапуск Steam с параметром -cef-enable-debugging...");
      await tauriBridge.restartSteamWithDebugging();
      showToast("Steam успешно перезапущен с поддержкой кастомизации!");
      refreshStatus();
    } catch (err: unknown) {
      showToast(`Ошибка перезапуска: ${String(err)}`, true);
    } finally {
      setIsRestarting(false);
    }
  };

  const handleSelectManualPath = async () => {
    try {
      const chosenDir = await tauriBridge.pickDirectoryDialog();
      if (chosenDir) {
        const updatedStatus = await tauriBridge.setManualSteamPath(chosenDir);
        setStatus(updatedStatus);
        showToast(`Путь к Steam установлен: ${chosenDir}`);
      }
    } catch (err: unknown) {
      showToast(`Ошибка выбора пути: ${String(err)}`, true);
    }
  };

  const handleExportFolder = async () => {
    try {
      const dir = await tauriBridge.exportThemeFolder(currentTheme);
      showToast(`Тема успешно экспортирована для Millennium / SFP:\n${dir}`);
    } catch (err: unknown) {
      showToast(`Ошибка экспорта папки: ${String(err)}`, true);
    }
  };

  const handleSaveToUserThemes = async (themeToSave: ThemeConfig) => {
    try {
      await tauriBridge.saveCustomTheme(themeToSave);
      refreshThemes();
      showToast(`Тема «${themeToSave.metadata.name}» добавлена в ваши профили!`);
    } catch (err: unknown) {
      showToast(`Ошибка добавления темы: ${String(err)}`, true);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07090e] text-zinc-100 overflow-hidden select-none font-sans">
      {/* Верхний статус-бар */}
      <StatusHeader
        status={status}
        onRefreshStatus={refreshStatus}
        onApplyTheme={() => handleApplyTheme(currentTheme)}
        onResetSteam={handleResetSteam}
        onExportFolder={handleExportFolder}
        onCreateShortcut={handleCreateShortcut}
        isApplying={isApplying}
        isResetting={isResetting}
        isRestarting={isRestarting}
        onRestartSteam={handleRestartSteam}
        onSelectManualPath={handleSelectManualPath}
      />

      {/* Предупреждение о необходимости режима отладки, если Steam запущен обычным образом */}
      {status?.isProcessRunning && !status.isCdpActive && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Steam запущен в стандартном режиме. Для мгновенного применения тем без перезапуска требуется режим отладки CEF.
            </span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleCreateShortcut}
              className="px-2.5 py-1 rounded-md bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/50 text-amber-300 transition-colors flex items-center space-x-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Создать ярлык</span>
            </button>
            <button
              onClick={handleRestartSteam}
              disabled={isRestarting}
              className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {isRestarting ? "Перезапуск..." : "Перезапустить Steam"}
            </button>
          </div>
        </div>
      )}

      {/* Основная область */}
      <div className="flex-1 flex overflow-hidden">
        {/* Левая панель редактора */}
        <div className="w-[480px] flex flex-col bg-[#0b0e14]/90 backdrop-blur-xl border-r border-white/[0.08] flex-shrink-0 shadow-xl z-20">
          {/* Сегментированные вкладки в стиле Raycast / Apple HIG */}
          <div className="p-3 border-b border-white/[0.06]">
            <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950/80 rounded-xl border border-white/5 text-[11px] font-medium">
              <button
                onClick={() => setActiveTab("catalog")}
                className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "catalog"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Каталог</span>
              </button>

              <button
                onClick={() => setActiveTab("presets")}
                className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "presets"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Пресеты</span>
              </button>

              <button
                onClick={() => setActiveTab("colors")}
                className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "colors"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Цвета</span>
              </button>

              <button
                onClick={() => setActiveTab("geometry")}
                className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "geometry"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <SlidersIcon className="w-3.5 h-3.5" />
                <span>Радиусы</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950/80 rounded-xl border border-white/5 text-[11px] font-medium mt-1.5">
              <button
                onClick={() => setActiveTab("typography")}
                className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "typography"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Шрифт</span>
              </button>

              <button
                onClick={() => setActiveTab("elements")}
                className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "elements"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Вид и Фон</span>
              </button>

              <button
                onClick={() => setActiveTab("profiles")}
                className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "profiles"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Профили</span>
              </button>
            </div>
          </div>

          {/* Содержимое вкладки */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === "catalog" && (
              <CommunityCatalog
                catalog={communityCatalog}
                currentThemeId={currentTheme.metadata.id}
                onPreviewTheme={(theme) => setCurrentTheme(theme)}
                onApplyThemeDirectly={(theme) => handleApplyTheme(theme)}
                onSaveToUserThemes={handleSaveToUserThemes}
              />
            )}

            {activeTab === "presets" && (
              <PresetBar
                presets={presets}
                savedThemes={savedThemes}
                currentThemeId={currentTheme.metadata.id}
                onSelectTheme={(theme) => setCurrentTheme(theme)}
                onApplyThemeDirectly={(theme) => handleApplyTheme(theme)}
              />
            )}

            {activeTab === "colors" && (
              <ColorPickers
                colors={currentTheme.colors}
                onChange={(colors) => setCurrentTheme({ ...currentTheme, colors })}
              />
            )}

            {activeTab === "geometry" && (
              <Sliders
                geometry={currentTheme.geometry}
                onChange={(geometry) => setCurrentTheme({ ...currentTheme, geometry })}
              />
            )}

            {activeTab === "typography" && (
              <FontSelector
                typography={currentTheme.typography}
                onChange={(typography) => setCurrentTheme({ ...currentTheme, typography })}
              />
            )}

            {activeTab === "elements" && (
              <div className="space-y-4">
                <Toggles
                  toggles={currentTheme.toggles}
                  onChange={(toggles) => setCurrentTheme({ ...currentTheme, toggles })}
                />
                <div className="h-[1px] bg-white/5" />
                <BackgroundControl
                  background={currentTheme.background}
                  onChange={(background) => setCurrentTheme({ ...currentTheme, background })}
                />
              </div>
            )}

            {activeTab === "profiles" && (
              <ProfileManager
                currentTheme={currentTheme}
                savedThemes={savedThemes}
                onThemesUpdated={refreshThemes}
                onThemeLoaded={(theme) => setCurrentTheme(theme)}
                onShowMessage={showToast}
              />
            )}
          </div>
        </div>

        {/* Правая панель: Макет Steam */}
        <div className="flex-1 p-4 bg-[#06080c] overflow-hidden flex flex-col relative">
          <SteamPreview theme={currentTheme} />
        </div>
      </div>

      {/* Модальное окно умного подключения к Steam */}
      <CdpRequiredModal
        isOpen={isCdpModalOpen}
        onClose={() => setIsCdpModalOpen(false)}
        onRestartAndApply={handleRestartAndApply}
        onCreateShortcut={handleCreateShortcut}
        isRestarting={isRestarting}
        themeName={currentTheme.metadata.name}
      />

      {/* Уведомление (Toast) */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 max-w-md px-4 py-3 rounded-xl shadow-2xl border flex items-start space-x-3 text-xs backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200 ${
            toast.isError
              ? "bg-red-950/90 border-red-700/80 text-red-200 shadow-red-950/40"
              : "bg-emerald-950/90 border-emerald-700/80 text-emerald-200 shadow-emerald-950/40"
          }`}
        >
          {toast.isError ? (
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          )}
          <span className="whitespace-pre-line flex-1 font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-white/60 hover:text-white ml-2 flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
