import React from "react";
import { Type } from "lucide-react";
import { ThemeTypography } from "../../types/theme";

interface FontSelectorProps {
  typography: ThemeTypography;
  onChange: (updatedTypography: ThemeTypography) => void;
}

interface FontOption {
  name: string;
  cssFamily: string;
  googleFamily?: string;
  category: "Sans-Serif" | "Monospace" | "System";
}

const AVAILABLE_FONTS: FontOption[] = [
  {
    name: "Системный по умолчанию",
    cssFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
    category: "System",
  },
  {
    name: "Inter",
    cssFamily: "'Inter', sans-serif",
    googleFamily: "Inter",
    category: "Sans-Serif",
  },
  {
    name: "Plus Jakarta Sans",
    cssFamily: "'Plus Jakarta Sans', sans-serif",
    googleFamily: "Plus Jakarta Sans",
    category: "Sans-Serif",
  },
  {
    name: "Space Grotesk",
    cssFamily: "'Space Grotesk', sans-serif",
    googleFamily: "Space Grotesk",
    category: "Sans-Serif",
  },
  {
    name: "JetBrains Mono",
    cssFamily: "'JetBrains Mono', monospace",
    googleFamily: "JetBrains Mono",
    category: "Monospace",
  },
  {
    name: "Fira Code",
    cssFamily: "'Fira Code', monospace",
    googleFamily: "Fira Code",
    category: "Monospace",
  },
  {
    name: "Poppins",
    cssFamily: "'Poppins', sans-serif",
    googleFamily: "Poppins",
    category: "Sans-Serif",
  },
  {
    name: "Rubik",
    cssFamily: "'Rubik', sans-serif",
    googleFamily: "Rubik",
    category: "Sans-Serif",
  },
  {
    name: "Nunito",
    cssFamily: "'Nunito', sans-serif",
    googleFamily: "Nunito",
    category: "Sans-Serif",
  },
  {
    name: "Roboto",
    cssFamily: "'Roboto', sans-serif",
    googleFamily: "Roboto",
    category: "Sans-Serif",
  },
  {
    name: "Montserrat",
    cssFamily: "'Montserrat', sans-serif",
    googleFamily: "Montserrat",
    category: "Sans-Serif",
  },
  {
    name: "Ubuntu",
    cssFamily: "'Ubuntu', sans-serif",
    googleFamily: "Ubuntu",
    category: "Sans-Serif",
  },
];

export const FontSelector: React.FC<FontSelectorProps> = ({ typography, onChange }) => {
  const currentFont =
    AVAILABLE_FONTS.find(
      (f) =>
        f.googleFamily === typography.googleFontFamily ||
        f.cssFamily === typography.fontFamily
    ) || AVAILABLE_FONTS[0];

  const handleSelect = (font: FontOption) => {
    onChange({
      fontFamily: font.cssFamily,
      googleFontFamily: font.googleFamily,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300">
        <Type className="w-4 h-4 text-purple-400" />
        <span>Основной шрифт клиента</span>
      </div>

      <div className="grid grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
        {AVAILABLE_FONTS.map((font) => {
          const isSelected =
            font.name === currentFont.name ||
            (font.googleFamily && font.googleFamily === typography.googleFontFamily);

          return (
            <button
              key={font.name}
              onClick={() => handleSelect(font)}
              className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                isSelected
                  ? "bg-purple-950/30 border-purple-500/60 text-white"
                  : "bg-[#141822] border-[#212738] text-gray-300 hover:bg-[#191f2d]"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium" style={{ fontFamily: font.cssFamily }}>
                  {font.name}
                </span>
                <span className="text-[10px] text-gray-500 font-sans">
                  The quick brown fox jumps over the lazy dog
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-gray-400 font-mono">
                {font.category}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
