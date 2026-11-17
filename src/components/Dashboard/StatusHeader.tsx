import React from "react";
import {
  RotateCcw,
  Zap,
  FolderOpen,
  Download,
  Flame,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { FullSteamStatus } from "../../types/steam";

interface StatusHeaderProps {
  status: FullSteamStatus | null;
  onRefreshStatus: () => void;
  onApplyTheme: () => void;
  onResetSteam: () => void;
  onExportFolder: () => void;
  onCreateShortcut: () => void;
  isApplying: boolean;
  isResetting: boolean;
  isRestarting: boolean;
  onRestartSteam: () => void;
  onSelectManualPath: () => void;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({
  status,
  onRefreshStatus,
  onApplyTheme,
  onResetSteam,
  onExportFolder,
  onCreateShortcut,
  isApplying,
  isResetting,
  isRestarting,
  onRestartSteam,
  onSelectManualPath,
}) => {
  const isSteamDetected = status?.steamDetected ?? false;
  const isProcessRunning = status?.isProcessRunning ?? false;
  const isCdpActive = status?.isCdpActive ?? false;

  return (
    <header className="bg-[#0b0d13]/90 backdrop-blur-xl border-b border-white/[0.08] px-5 py-3 flex items-center justify-between select-none z-30 relative shadow-sm">
      {/* Бренд и статус */}
      <div className="flex items-center space-x-4">
        {/* Логотип */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/20">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm tracking-tight">Steamify</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                PRO 2.0
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">Студия визуальной кастомизации</p>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-white/10" />

        {/* Статусные пилюли */}
        <div className="flex items-center space-x-2">
          {/* Статус Steam */}
          <div
            className={`flex items-center space-x-2 px-2.5 py-1 rounded-full border text-[11px] font-medium backdrop-blur-md transition-all ${
              isSteamDetected
                ? isProcessRunning
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-zinc-800/80 border-white/10 text-zinc-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isProcessRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isSteamDetected
                    ? isProcessRunning
                      ? "bg-emerald-400"
                      : "bg-zinc-400"
                    : "bg-amber-400"
                }`}
              />
            </span>
            <span>
              {isSteamDetected
                ? isProcessRunning
                  ? `Steam активен (PID ${status?.processPid ?? ""})`
                  : "Steam не запущен"
                : "Steam не найден"}
            </span>

            <button
              onClick={onSelectManualPath}
              title="Указать путь вручную"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <FolderOpen className="w-3 h-3" />
            </button>
          </div>

          {/* Статус CEF Отладки */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium backdrop-blur-md transition-all ${
              isCdpActive
                ? "bg-sky-500/15 border-sky-500/30 text-sky-300 shadow-sm shadow-sky-500/10"
                : "bg-amber-500/15 border-amber-500/30 text-amber-300"
            }`}
          >
            <Zap className={`w-3 h-3 ${isCdpActive ? "text-sky-400 fill-sky-400 animate-pulse" : "text-amber-400"}`} />
            <span>
              {isCdpActive
                ? `CEF активен (${status?.cdpPort || 8080})`
                : "CEF не активен"}
            </span>
          </div>

          <button
            onClick={onRefreshStatus}
            title="Обновить статус"
            className="p-1.5 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex items-center space-x-2">
        {/* Кнопка создания ярлыка на рабочем столе */}
        <button
          onClick={onCreateShortcut}
          title="Создать ярлык Steam с кастомизацией на Рабочем столе"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Ярлык на стол</span>
        </button>

        {/* Перезапуск с отладкой */}
        <button
          onClick={onRestartSteam}
          disabled={isRestarting}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-200 hover:text-white transition-all disabled:opacity-50 shadow-sm"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRestarting ? "animate-spin text-sky-400" : ""}`} />
          <span>{isRestarting ? "Перезапуск..." : "Перезапустить с отладкой"}</span>
        </button>

        {/* Экспорт Millennium / SFP */}
        <button
          onClick={onExportFolder}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-200 hover:text-white transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span>Экспорт</span>
        </button>

        {/* Сброс */}
        <button
          onClick={onResetSteam}
          disabled={isResetting}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 text-red-300 hover:text-red-200 transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
          <span>Сброс</span>
        </button>

        {/* Главная кнопка: Применить тему */}
        <button
          onClick={onApplyTheme}
          disabled={isApplying}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-blue-600/30 transition-all transform active:scale-95 disabled:opacity-50 border border-white/20"
        >
          <Zap className={`w-3.5 h-3.5 ${isApplying ? "animate-spin" : "fill-white"}`} />
          <span>{isApplying ? "Применение..." : "Применить тему"}</span>
        </button>
      </div>
    </header>
  );
};
