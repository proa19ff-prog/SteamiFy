import React, { useState } from "react";
import { Save, FolderDown, FolderUp, Trash2 } from "lucide-react";
import { ThemeConfig } from "../../types/theme";
import { tauriBridge } from "../../services/tauriBridge";

interface ProfileManagerProps {
  currentTheme: ThemeConfig;
  savedThemes: ThemeConfig[];
  onThemesUpdated: () => void;
  onThemeLoaded: (theme: ThemeConfig) => void;
  onShowMessage: (text: string, isError?: boolean) => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  currentTheme,
  savedThemes,
  onThemesUpdated,
  onThemeLoaded,
  onShowMessage,
}) => {
  const [themeName, setThemeName] = useState(currentTheme.metadata.name);
  const [authorName, setAuthorName] = useState(currentTheme.metadata.author);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTheme = async () => {
    if (!themeName.trim()) {
      onShowMessage("Введите название темы.", true);
      return;
    }

    try {
      setIsSaving(true);
      const updatedTheme: ThemeConfig = {
        ...currentTheme,
        metadata: {
          ...currentTheme.metadata,
          id: currentTheme.metadata.id.startsWith("preset-")
            ? `user-${Date.now()}`
            : currentTheme.metadata.id,
          name: themeName.trim(),
          author: authorName.trim() || "Steamify User",
          createdAt: new Date().toISOString(),
        },
      };

      await tauriBridge.saveCustomTheme(updatedTheme);
      onThemesUpdated();
      onThemeLoaded(updatedTheme);
      onShowMessage(`Тема «${updatedTheme.metadata.name}» успешно сохранена!`);
    } catch (err: unknown) {
      onShowMessage(`Ошибка сохранения: ${String(err)}`, true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTheme = async (id: string, name: string) => {
    if (confirm(`Вы уверены, что хотите удалить сохранённую тему «${name}»?`)) {
      try {
        await tauriBridge.deleteCustomTheme(id);
        onThemesUpdated();
        onShowMessage(`Тема «${name}» удалена.`);
      } catch (err: unknown) {
        onShowMessage(`Ошибка удаления: ${String(err)}`, true);
      }
    }
  };

  const handleExportSteamify = async () => {
    try {
      const sanitizedName = currentTheme.metadata.name
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase();

      const savePath = await tauriBridge.saveSteamifyFileDialog(sanitizedName);
      if (savePath) {
        await tauriBridge.exportSteamifyFile(currentTheme, savePath);
        onShowMessage(`Тема успешно экспортирована в файл:\n${savePath}`);
      }
    } catch (err: unknown) {
      onShowMessage(`Ошибка экспорта: ${String(err)}`, true);
    }
  };

  const handleImportSteamify = async () => {
    try {
      const pickedFile = await tauriBridge.pickSteamifyFile();
      if (!pickedFile) return;

      const imported = await tauriBridge.importSteamifyFile(pickedFile);
      onThemeLoaded(imported);
      await tauriBridge.saveCustomTheme(imported);
      onThemesUpdated();
      onShowMessage(`Тема «${imported.metadata.name}» успешно импортирована и сохранена!`);
    } catch (err: unknown) {
      onShowMessage(`Ошибка импорта: ${String(err)}`, true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Сохранение текущей темы */}
      <div className="p-3 rounded-lg bg-[#141822] border border-[#212738] space-y-2.5">
        <span className="text-xs font-semibold text-gray-200 block">
          Сохранить текущие настройки как пресет
        </span>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-400 block mb-0.5">Название темы</label>
            <input
              type="text"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              placeholder="Моя тема"
              className="w-full px-2 py-1 text-xs bg-[#0d1017] border border-[#262c3e] rounded text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-0.5">Автор</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Имя автора"
              className="w-full px-2 py-1 text-xs bg-[#0d1017] border border-[#262c3e] rounded text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleSaveTheme}
          disabled={isSaving}
          className="w-full py-1.5 px-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Сохранение..." : "Сохранить тему в профили"}</span>
        </button>
      </div>

      {/* Экспорт и импорт .steamify */}
      <div className="p-3 rounded-lg bg-[#141822] border border-[#212738] space-y-2">
        <span className="text-xs font-semibold text-gray-200 block">
          Обмен темами (.steamify файл)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportSteamify}
            className="py-1.5 px-3 rounded-md bg-[#1d2230] hover:bg-[#252c3e] border border-[#2d354a] text-gray-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
          >
            <FolderDown className="w-3.5 h-3.5 text-blue-400" />
            <span>Экспорт .steamify</span>
          </button>

          <button
            onClick={handleImportSteamify}
            className="py-1.5 px-3 rounded-md bg-[#1d2230] hover:bg-[#252c3e] border border-[#2d354a] text-gray-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
          >
            <FolderUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Импорт .steamify</span>
          </button>
        </div>
      </div>

      {/* Список сохранённых тем пользователя */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-gray-300 block">
          Сохранённые темы пользователя ({savedThemes.length})
        </span>

        {savedThemes.length === 0 ? (
          <div className="p-3 rounded-lg border border-dashed border-white/10 text-center text-xs text-gray-500">
            Нет сохранённых пользовательских тем
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {savedThemes.map((st) => (
              <div
                key={st.metadata.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[#141822] border border-[#212738] text-xs"
              >
                <div
                  className="flex items-center space-x-2 cursor-pointer flex-1 truncate"
                  onClick={() => onThemeLoaded(st)}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: st.colors.accent }}
                  />
                  <span className="text-gray-200 font-medium truncate">
                    {st.metadata.name}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteTheme(st.metadata.id, st.metadata.name)}
                  className="p-1 text-gray-500 hover:text-red-400 transition-colors ml-2"
                  title="Удалить"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
