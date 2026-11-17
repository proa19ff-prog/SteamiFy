import React from "react";
import { Palette } from "lucide-react";
import { ThemeColors } from "../../types/theme";

interface ColorPickersProps {
  colors: ThemeColors;
  onChange: (updatedColors: ThemeColors) => void;
}

interface ColorFieldProps {
  label: string;
  description: string;
  value: string;
  onChange: (val: string) => void;
  presetSwatches?: string[];
}

const ColorField: React.FC<ColorFieldProps> = ({
  label,
  description,
  value,
  onChange,
  presetSwatches = [],
}) => {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.07] hover:border-white/15 transition-all">
      <div className="pr-2">
        <div className="text-xs font-semibold text-zinc-200">{label}</div>
        <div className="text-[10px] text-zinc-400">{description}</div>

        {presetSwatches.length > 0 && (
          <div className="flex items-center space-x-1 mt-1.5">
            {presetSwatches.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange(color)}
                className="w-3.5 h-3.5 rounded-full border border-black/40 hover:scale-125 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-2 py-1 text-xs font-mono bg-black/40 border border-white/10 rounded-lg text-zinc-200 uppercase focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 transition-all text-center"
        />
        <div className="relative w-7 h-7 rounded-lg border border-white/20 overflow-hidden cursor-pointer shadow-md shadow-black/40 hover:scale-105 transition-transform">
          <input
            type="color"
            value={value.length === 7 ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-3 -left-3 w-14 h-14 cursor-pointer border-0 p-0"
          />
        </div>
      </div>
    </div>
  );
};

export const ColorPickers: React.FC<ColorPickersProps> = ({ colors, onChange }) => {
  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    onChange({
      ...colors,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
      {/* Акцентные цвета */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
          <Palette className="w-3.5 h-3.5 text-blue-400" />
          <span>Акцентные цвета</span>
        </div>
        <ColorField
          label="Основной акцент"
          description="Кнопки запуска, активные пункты меню"
          value={colors.accent}
          onChange={(val) => handleColorChange("accent", val)}
          presetSwatches={["#0078D4", "#1DB954", "#38bdf8", "#fcee0a", "#cba6f7", "#ff5e00", "#10b981"]}
        />
        <ColorField
          label="Акцент при наведении"
          description="Ховер-состояние активных кнопок"
          value={colors.accentHover}
          onChange={(val) => handleColorChange("accentHover", val)}
        />
      </div>

      {/* Фоны */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Фоны и подложка
        </div>
        <ColorField
          label="Основной фон библиотеки"
          description="Подложка домашней страницы и библиотеки"
          value={colors.primaryBackground}
          onChange={(val) => handleColorChange("primaryBackground", val)}
          presetSwatches={["#000000", "#121212", "#181825", "#1c1c1c", "#242933", "#1d2021"]}
        />
        <ColorField
          label="Вторичный фон (боковая панель)"
          description="Панель списка игр и заголовки"
          value={colors.secondaryBackground}
          onChange={(val) => handleColorChange("secondaryBackground", val)}
          presetSwatches={["#080808", "#181818", "#1e1e2e", "#242424", "#2e3440", "#282828"]}
        />
      </div>

      {/* Карточки */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Карточки игр
        </div>
        <ColorField
          label="Фон карточек"
          description="Капсулы игр и плашки витрин"
          value={colors.cardBackground}
          onChange={(val) => handleColorChange("cardBackground", val)}
          presetSwatches={["#141414", "#242424", "#313244", "#2e2e2e", "#3b4252", "#3c3836"]}
        />
        <ColorField
          label="Фон карточек (ховер)"
          description="Цвет при наведении курсора"
          value={colors.cardHoverBackground}
          onChange={(val) => handleColorChange("cardHoverBackground", val)}
        />
      </div>

      {/* Текст */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Типографика и текст
        </div>
        <ColorField
          label="Основной текст"
          description="Названия игр и ключевые заголовки"
          value={colors.textPrimary}
          onChange={(val) => handleColorChange("textPrimary", val)}
        />
        <ColorField
          label="Вторичный текст"
          description="Время в игре, категории, даты"
          value={colors.textSecondary}
          onChange={(val) => handleColorChange("textSecondary", val)}
        />
      </div>
    </div>
  );
};
