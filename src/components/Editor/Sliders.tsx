import React from "react";
import { Sliders as SlidersIcon } from "lucide-react";
import { ThemeGeometry } from "../../types/theme";

interface SlidersProps {
  geometry: ThemeGeometry;
  onChange: (updatedGeometry: ThemeGeometry) => void;
}

export const Sliders: React.FC<SlidersProps> = ({ geometry, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300">
        <SlidersIcon className="w-4 h-4 text-emerald-400" />
        <span>Геометрия и скругления</span>
      </div>

      <div className="space-y-2.5">
        {/* Скругление карточек */}
        <div className="p-2.5 rounded-lg bg-[#141822] border border-[#212738]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-200">Скругление карточек игр</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
              {geometry.cardRadiusPx}px
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={0}
              max={32}
              step={1}
              value={geometry.cardRadiusPx}
              onChange={(e) =>
                onChange({
                  ...geometry,
                  cardRadiusPx: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div
              className="w-5 h-5 bg-emerald-500/20 border border-emerald-400 flex-shrink-0 transition-all"
              style={{ borderRadius: `${geometry.cardRadiusPx / 2}px` }}
            />
          </div>
        </div>

        {/* Скругление кнопок */}
        <div className="p-2.5 rounded-lg bg-[#141822] border border-[#212738]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-200">Скругление кнопок</span>
            <span className="text-xs font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
              {geometry.buttonRadiusPx}px
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={0}
              max={32}
              step={1}
              value={geometry.buttonRadiusPx}
              onChange={(e) =>
                onChange({
                  ...geometry,
                  buttonRadiusPx: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div
              className="w-8 h-4 bg-blue-500/20 border border-blue-400 flex-shrink-0 transition-all"
              style={{ borderRadius: `${geometry.buttonRadiusPx / 2}px` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
