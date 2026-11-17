import React from "react";
import { AlertCircle, RotateCcw, X, ExternalLink } from "lucide-react";

interface CdpRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartAndApply: () => void;
  onCreateShortcut: () => void;
  isRestarting: boolean;
  themeName: string;
}

export const CdpRequiredModal: React.FC<CdpRequiredModalProps> = ({
  isOpen,
  onClose,
  onRestartAndApply,
  onCreateShortcut,
  isRestarting,
  themeName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#13161f] border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Декоративное фоновое свечение */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3.5 mb-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Требуется режим кастомизации Steam
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Для применения темы «{themeName}»
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-zinc-300 relative z-10 mb-6 bg-zinc-900/60 p-3.5 rounded-xl border border-white/5">
          <p>
            Steam запущен в стандартном режиме без флага отладки CEF. Поэтому порт{" "}
            <span className="font-mono text-amber-300 font-semibold">8080</span> закрыт.
          </p>
          <p className="text-zinc-400">
            Steamify может автоматически перезапустить Steam с параметром{" "}
            <code className="text-blue-300 font-mono bg-blue-950/40 px-1 py-0.5 rounded border border-blue-800/30">
              -cef-enable-debugging
            </code>{" "}
            и сразу применить выбранную тему.
          </p>
        </div>

        <div className="space-y-2 relative z-10">
          <button
            onClick={onRestartAndApply}
            disabled={isRestarting}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isRestarting ? "animate-spin" : ""}`} />
            <span>
              {isRestarting ? "Перезапуск и применение..." : "Перезапустить Steam и применить тему"}
            </span>
          </button>

          <button
            onClick={onCreateShortcut}
            className="w-full py-2 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/5 text-zinc-300 text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Создать ярлык Steam с кастомизацией на Рабочем столе</span>
          </button>
        </div>
      </div>
    </div>
  );
};
