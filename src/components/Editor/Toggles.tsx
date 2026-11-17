import React from "react";
import { Layout } from "lucide-react";
import { ThemeToggles } from "../../types/theme";

interface TogglesProps {
  toggles: ThemeToggles;
  onChange: (updatedToggles: ThemeToggles) => void;
}

interface ToggleItemProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

const ToggleItem: React.FC<ToggleItemProps> = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#141822] border border-[#212738] hover:border-[#2b334a] transition-colors">
      <div className="pr-3">
        <div className="text-xs font-medium text-gray-200">{label}</div>
        <div className="text-[10px] text-gray-400">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-blue-600" : "bg-[#252b3b]"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export const Toggles: React.FC<TogglesProps> = ({ toggles, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300">
        <Layout className="w-4 h-4 text-cyan-400" />
        <span>Видимость элементов интерфейса</span>
      </div>

      <div className="space-y-2">
        <ToggleItem
          label="Скрыть блок «Что нового»"
          description="Убирает верхнюю ленту новостей и обновлений из библиотеки"
          checked={toggles.hideWhatsNew}
          onChange={(val) => onChange({ ...toggles, hideWhatsNew: val })}
        />

        <ToggleItem
          label="Скрыть нижнюю панель загрузки"
          description="Освобождает вертикальное пространство, скрывая статус закачек"
          checked={toggles.hideBottomDownloadBar}
          onChange={(val) => onChange({ ...toggles, hideBottomDownloadBar: val })}
        />

        <ToggleItem
          label="Компактная боковая панель"
          description="Уменьшает ширину и высоту строк списка игр"
          checked={toggles.compactSidebar}
          onChange={(val) => onChange({ ...toggles, compactSidebar: val })}
        />
      </div>
    </div>
  );
};
