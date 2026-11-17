import React, { useState } from "react";
import {
  Globe,
  Search,
  Star,
  Download,
  Check,
  Zap,
  Tag,
  Sparkles,
} from "lucide-react";
import { CommunityThemeItem, ThemeConfig } from "../../types/theme";

interface CommunityCatalogProps {
  catalog: CommunityThemeItem[];
  currentThemeId: string;
  onPreviewTheme: (theme: ThemeConfig) => void;
  onApplyThemeDirectly: (theme: ThemeConfig) => void;
  onSaveToUserThemes: (theme: ThemeConfig) => void;
}

export const CommunityCatalog: React.FC<CommunityCatalogProps> = ({
  catalog,
  currentThemeId,
  onPreviewTheme,
  onApplyThemeDirectly,
  onSaveToUserThemes,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const categories = ["Все", "Fluent / Win11", "Catppuccin", "Минимализм", "Код и Ретро", "Гейминг"];

  const filteredItems = catalog.filter((item) => {
    const matchesCategory = selectedCategory === "Все" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSave = (item: CommunityThemeItem) => {
    onSaveToUserThemes(item.theme);
    setSavedIds((prev) => new Set(prev).add(item.id));
  };

  return (
    <div className="space-y-4">
      {/* Шапка каталога */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Каталог тем сообщества
            </h3>
            <p className="text-[10px] text-zinc-400">
              Популярные скины из GitHub и сообществ кастомизации Steam
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-white/5">
          {filteredItems.length} тем
        </span>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
        <input
          type="text"
          placeholder="Поиск по названию, тегам или автору..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-900/80 border border-white/10 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 transition-all"
        />
      </div>

      {/* Категории */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                : "bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Сетка карточек тем */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredItems.map((item) => {
          const isSelected = item.theme.metadata.id === currentThemeId;
          const isSaved = savedIds.has(item.id);

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all duration-200 backdrop-blur-md relative overflow-hidden group ${
                isSelected
                  ? "bg-zinc-800/60 border-blue-500/70 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
                  : "bg-zinc-900/50 border-white/[0.07] hover:bg-zinc-800/40 hover:border-white/15"
              }`}
            >
              {/* Верхняя строка карточки: название и палитра */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-1.5 mb-0.5">
                    <span className="font-semibold text-xs text-white group-hover:text-blue-400 transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-white/5 font-mono">
                      v{item.theme.metadata.version}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center space-x-2">
                    <span>by {item.author}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-0.5 text-amber-400 font-medium">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      <span>{item.stars.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-0.5 text-zinc-400">
                      <Download className="w-2.5 h-2.5" />
                      <span>{item.downloads}</span>
                    </div>
                  </div>
                </div>

                {/* Градиентные круги превью палитры */}
                <div className="flex items-center -space-x-1 p-1 rounded-full bg-black/40 border border-white/10 shadow-inner">
                  {item.previewGradient.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Описание */}
              <p className="text-[11px] text-zinc-300/90 leading-relaxed line-clamp-2 mb-2.5">
                {item.description}
              </p>

              {/* Теги */}
              <div className="flex items-center space-x-1.5 mb-3 flex-wrap gap-y-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-white/5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Кнопки действий */}
              <div className="flex items-center space-x-2 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => onPreviewTheme(item.theme)}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1 ${
                    isSelected
                      ? "bg-blue-600/30 border border-blue-500/50 text-blue-300"
                      : "bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-white/5"
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{isSelected ? "В предпросмотре" : "Примерить"}</span>
                </button>

                <button
                  onClick={() => handleSave(item)}
                  disabled={isSaved}
                  title="Сохранить в мои темы"
                  className={`py-1 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1 border ${
                    isSaved
                      ? "bg-emerald-950/40 border-emerald-700/50 text-emerald-300"
                      : "bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border-white/5"
                  }`}
                >
                  {isSaved ? <Check className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                  <span>{isSaved ? "Сохранено" : "В мои"}</span>
                </button>

                <button
                  onClick={() => onApplyThemeDirectly(item.theme)}
                  className="py-1 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm shadow-blue-600/20 flex items-center justify-center space-x-1"
                >
                  <Zap className="w-3 h-3 fill-white" />
                  <span>Применить</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
