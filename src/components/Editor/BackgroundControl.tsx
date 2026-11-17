import React from "react";
import { Image } from "lucide-react";
import { ThemeBackground } from "../../types/theme";

interface BackgroundControlProps {
  background: ThemeBackground;
  onChange: (updatedBackground: ThemeBackground) => void;
}

const WALLPAPER_PRESETS = [
  {
    name: "Cyberpunk City",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Deep Nebula",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Nordic Mountains",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
  },
];

export const BackgroundControl: React.FC<BackgroundControlProps> = ({ background, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300">
          <Image className="w-4 h-4 text-pink-400" />
          <span>Фоновое изображение библиотеки</span>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...background, enabled: !background.enabled })}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            background.enabled ? "bg-pink-600" : "bg-[#252b3b]"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              background.enabled ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {background.enabled && (
        <div className="space-y-2.5 p-2.5 rounded-lg bg-[#141822] border border-[#212738]">
          <div>
            <label className="text-[11px] text-gray-300 font-medium block mb-1">
              Ссылка на изображение (URL)
            </label>
            <input
              type="text"
              placeholder="https://... или data:image/..."
              value={background.imageUrl}
              onChange={(e) => onChange({ ...background, imageUrl: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-[#0d1017] border border-[#262c3e] rounded text-gray-200 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Быстрые обои */}
          <div>
            <span className="text-[10px] text-gray-400 block mb-1">Готовые фоны:</span>
            <div className="flex items-center space-x-1.5">
              {WALLPAPER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => onChange({ ...background, imageUrl: preset.url })}
                  className="text-[10px] px-2 py-0.5 rounded bg-[#1e2434] hover:bg-[#283147] border border-white/5 text-gray-300 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Размытие */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-300">Размытие (Blur)</span>
              <span className="text-xs font-mono text-pink-400">{background.blurPx}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={background.blurPx}
              onChange={(e) => onChange({ ...background, blurPx: parseInt(e.target.value, 10) })}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>

          {/* Затемнение / Непрозрачность */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-300">Непрозрачность (Opacity)</span>
              <span className="text-xs font-mono text-pink-400">
                {Math.round(background.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.05}
              max={1.0}
              step={0.05}
              value={background.opacity}
              onChange={(e) => onChange({ ...background, opacity: parseFloat(e.target.value) })}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
