import React from "react";
import { Sparkles, Check, Zap } from "lucide-react";
import { ThemeConfig } from "../../types/theme";

interface PresetBarProps {
  presets: ThemeConfig[];
  savedThemes: ThemeConfig[];
  currentThemeId: string;
  onSelectTheme: (theme: ThemeConfig) => void;
  onApplyThemeDirectly?: (theme: ThemeConfig) => void;
}

export const PresetBar: React.FC<PresetBarProps> = ({
  presets,
  savedThemes,
  currentThemeId,
  onSelectTheme,
  onApplyThemeDirectly,
}) => {
  const allThemes = [
    ...presets,
    ...savedThemes.filter((s) => !presets.some((p) => p.metadata.id === s.metadata.id)),
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Встроенные пресеты ({allThemes.length})</span>
        </div>
        <span className="text-[10px] text-zinc-400 font-medium">Клик для мгновенного превью</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {allThemes.map((theme) => {
          const isSelected = theme.metadata.id === currentThemeId;
          const isPreset = presets.some((p) => p.metadata.id === theme.metadata.id);

          return (
            <div
              key={theme.metadata.id}
              onClick={() => onSelectTheme(theme)}
              className={`cursor-pointer text-left p-3 rounded-xl border transition-all duration-200 relative group flex flex-col justify-between backdrop-blur-md ${
                isSelected
                  ? "bg-zinc-800/80 border-blue-500/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40"
                  : "bg-zinc-900/60 border-white/[0.07] hover:bg-zinc-800/50 hover:border-white/15"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white truncate max-w-[125px]">
                    {theme.metadata.name}
                  </span>
                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  ) : isPreset ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                      пресет
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                      своя
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed mb-2.5">
                  {theme.metadata.description || "Пользовательская тема"}
                </p>
              </div>

              {/* Мини-палитра цветов */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <div className="flex items-center -space-x-1">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                    style={{ backgroundColor: theme.colors.accent }}
                    title={`Акцент: ${theme.colors.accent}`}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: theme.colors.primaryBackground }}
                    title={`Фон: ${theme.colors.primaryBackground}`}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/10 shadow-sm"
                    style={{ backgroundColor: theme.colors.cardBackground }}
                    title={`Карточка: ${theme.colors.cardBackground}`}
                  />
                </div>

                {onApplyThemeDirectly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyThemeDirectly(theme);
                    }}
                    title="Применить прямо сейчас"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-all transform active:scale-90"
                  >
                    <Zap className="w-3 h-3 fill-white" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
