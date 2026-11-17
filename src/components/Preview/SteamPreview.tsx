import React, { useState } from "react";
import {
  Play,
  Search,
  Filter,
  Download,
  Clock,
  Trophy,
  Users,
  Minus,
  Square,
  X,
  ChevronDown,
  Monitor,
} from "lucide-react";
import { ThemeConfig } from "../../types/theme";

interface SteamPreviewProps {
  theme: ThemeConfig;
}

interface MockGame {
  id: string;
  title: string;
  hours: string;
  coverUrl: string;
}

const MOCK_GAMES: MockGame[] = [
  {
    id: "cs2",
    title: "Counter-Strike 2",
    hours: "1 428 ч.",
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "cyberpunk",
    title: "Cyberpunk 2077",
    hours: "184 ч.",
    coverUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "bg3",
    title: "Baldur's Gate 3",
    hours: "216 ч.",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "elden",
    title: "Elden Ring",
    hours: "312 ч.",
    coverUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "dota2",
    title: "Dota 2",
    hours: "2 890 ч.",
    coverUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "hades2",
    title: "Hades II",
    hours: "64 ч.",
    coverUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "hl_alyx",
    title: "Half-Life: Alyx",
    hours: "42 ч.",
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "witcher3",
    title: "The Witcher 3: Wild Hunt",
    hours: "175 ч.",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
  },
];

export const SteamPreview: React.FC<SteamPreviewProps> = ({ theme }) => {
  const [selectedGameId, setSelectedGameId] = useState("cs2");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedGame = MOCK_GAMES.find((g) => g.id === selectedGameId) || MOCK_GAMES[0];
  const filteredGames = MOCK_GAMES.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { colors, geometry, typography, background, toggles } = theme;

  return (
    <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative select-none bg-black">
      {/* Рамка окна приложения с матовым затемнением */}
      <div className="h-7 px-3 bg-[#0a0c10] border-b border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500 z-20">
        <div className="flex items-center space-x-2">
          <Monitor className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-400">Steam Client — Живой предпросмотр темы</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-white/5">
            {theme.metadata.name}
          </span>
        </div>
      </div>

      {/* Окно Steam */}
      <div
        className="flex-1 flex flex-col overflow-hidden relative"
        style={{
          fontFamily: typography.fontFamily,
          backgroundColor: colors.primaryBackground,
          color: colors.textPrimary,
        }}
      >
        {/* Фоновый оверлей (если включен) */}
        {background.enabled && background.imageUrl && (
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-300"
            style={{
              backgroundImage: `url(${background.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: `blur(${background.blurPx}px)`,
              opacity: background.opacity,
              zIndex: 0,
            }}
          />
        )}

        {/* Верхний тулбар Steam */}
        <div
          className="h-10 px-4 flex items-center justify-between border-b relative z-10"
          style={{
            backgroundColor: colors.secondaryBackground,
            borderColor: "rgba(255, 255, 255, 0.07)",
          }}
        >
          <div className="flex items-center space-x-5">
            {/* Меню */}
            <div className="flex items-center space-x-3 text-[11px] text-zinc-400 font-medium">
              <span className="hover:text-white cursor-pointer transition-colors">Steam</span>
              <span className="hover:text-white cursor-pointer transition-colors">Вид</span>
              <span className="hover:text-white cursor-pointer transition-colors">Друзья</span>
              <span className="hover:text-white cursor-pointer transition-colors">Игры</span>
              <span className="hover:text-white cursor-pointer transition-colors">Справка</span>
            </div>

            <div className="h-4 w-[1px] bg-white/10" />

            {/* Вкладки навигации */}
            <div className="flex items-center space-x-5 text-xs font-bold uppercase tracking-wider">
              <span className="text-zinc-400 hover:text-white cursor-pointer transition-colors">
                МАГАЗИН
              </span>
              <span
                className="cursor-pointer relative py-2.5 transition-colors font-extrabold"
                style={{ color: colors.accent }}
              >
                БИБЛИОТЕКА
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full shadow-sm"
                  style={{
                    backgroundColor: colors.accent,
                    boxShadow: `0 0 10px ${colors.accent}`,
                  }}
                />
              </span>
              <span className="text-zinc-400 hover:text-white cursor-pointer transition-colors">
                СООБЩЕСТВО
              </span>
              <span className="text-zinc-400 hover:text-white cursor-pointer transition-colors">
                YOU
              </span>
            </div>
          </div>

          {/* Системные кнопки окна */}
          <div className="flex items-center space-x-2 text-zinc-400">
            <button className="p-1 hover:text-white transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-white transition-colors">
              <Square className="w-3 h-3" />
            </button>
            <button className="p-1 hover:text-red-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Основная рабочая область */}
        <div className="flex-1 flex overflow-hidden relative z-10">
          {/* Боковая панель списка игр */}
          <div
            className={`flex flex-col border-r transition-all duration-200 ${
              toggles.compactSidebar ? "w-52" : "w-64"
            }`}
            style={{
              backgroundColor: colors.secondaryBackground,
              borderColor: "rgba(255, 255, 255, 0.06)",
            }}
          >
            {/* Поиск */}
            <div className="p-2 border-b border-white/5 flex items-center space-x-1.5">
              <div className="flex-1 relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Поиск по названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-[11px] rounded bg-black/30 border border-white/5 text-zinc-200 focus:outline-none"
                  style={{ borderRadius: `${geometry.buttonRadiusPx / 2}px` }}
                />
              </div>
              <button className="p-1 hover:bg-white/5 rounded text-zinc-400 hover:text-white">
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Список */}
            <div className="flex-1 overflow-y-auto py-1">
              <div className="px-3 py-1 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                <span>ИЗБРАННОЕ ({filteredGames.length})</span>
                <ChevronDown className="w-3 h-3" />
              </div>

              {filteredGames.map((game) => {
                const isSelected = game.id === selectedGameId;

                return (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGameId(game.id)}
                    className={`w-full text-left px-3 flex items-center space-x-2 transition-all ${
                      toggles.compactSidebar ? "h-6 text-[11px]" : "h-8 text-xs"
                    }`}
                    style={{
                      backgroundColor: isSelected ? "rgba(255, 255, 255, 0.08)" : "transparent",
                      borderLeft: isSelected
                        ? `3px solid ${colors.accent}`
                        : "3px solid transparent",
                      color: isSelected ? colors.textPrimary : colors.textSecondary,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: isSelected
                          ? colors.accent
                          : "rgba(255, 255, 255, 0.2)",
                        boxShadow: isSelected ? `0 0 6px ${colors.accent}` : "none",
                      }}
                    />
                    <span className="truncate flex-1 font-medium">{game.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Главное содержимое библиотеки */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Баннер выбранной игры */}
            <div className="relative h-60 flex flex-col justify-end p-6 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                style={{
                  backgroundImage: `url(${selectedGame.coverUrl})`,
                  filter: "brightness(0.55)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 mb-2 inline-block">
                    ГОТОВА К ИГРЕ
                  </span>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
                    {selectedGame.title}
                  </h1>

                  <div
                    className="flex items-center space-x-4 mt-2 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>В игре: {selectedGame.hours}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Достижения: 48/64</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>В сети: 12 друзей</span>
                    </div>
                  </div>
                </div>

                {/* Кнопка запуска "ИГРАТЬ" */}
                <button
                  className="px-8 py-3 flex items-center space-x-2 font-bold text-sm text-white shadow-2xl transform active:scale-95 transition-all hover:brightness-110"
                  style={{
                    backgroundColor: colors.accent,
                    borderRadius: `${geometry.buttonRadiusPx}px`,
                    boxShadow: `0 8px 28px ${colors.accent}45`,
                  }}
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>ИГРАТЬ</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-6 flex-1">
              {/* Блок "Что нового" */}
              {!toggles.hideWhatsNew && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      ЧТО НОВОГО
                    </span>
                    <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                      Показать всё
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className="p-3.5 border transition-all hover:-translate-y-1 hover:shadow-lg"
                        style={{
                          backgroundColor: colors.cardBackground,
                          borderRadius: `${geometry.cardRadiusPx}px`,
                          borderColor: "rgba(255, 255, 255, 0.07)",
                        }}
                      >
                        <div className="text-[10px] text-emerald-400 font-semibold mb-1">
                          ОБНОВЛЕНИЕ #{idx}
                        </div>
                        <div className="text-xs font-bold text-white mb-1">
                          Сезонный патч и улучшение физики
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2">
                          Новые карты сообщества, переработанная физика гранат и оптимизация шейдеров CEF.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Сетка недавних игр */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    НЕДАВНИЕ ИГРЫ
                  </span>
                  <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                    Всего игр: 142
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3.5">
                  {MOCK_GAMES.map((game) => (
                    <div
                      key={game.id}
                      onClick={() => setSelectedGameId(game.id)}
                      className="group cursor-pointer border overflow-hidden transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl"
                      style={{
                        backgroundColor: colors.cardBackground,
                        borderRadius: `${geometry.cardRadiusPx}px`,
                        borderColor:
                          game.id === selectedGameId
                            ? colors.accent
                            : "rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <div className="aspect-[16/9] w-full overflow-hidden bg-black/40">
                        <img
                          src={game.coverUrl}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2.5">
                        <div className="text-xs font-semibold truncate text-white">
                          {game.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5 font-medium">
                          {game.hours}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Нижняя панель загрузки */}
        {!toggles.hideBottomDownloadBar && (
          <div
            className="h-9 px-4 flex items-center justify-between border-t text-xs relative z-10"
            style={{
              backgroundColor: colors.secondaryBackground,
              borderColor: "rgba(255, 255, 255, 0.07)",
            }}
          >
            <div className="flex items-center space-x-3">
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-white">ЗАГРУЗКИ (1/1)</span>
              <span className="text-zinc-400 text-[11px]">Counter-Strike 2 — 84%</span>
            </div>

            {/* Прогресс-бар */}
            <div className="flex items-center space-x-3">
              <div className="w-36 h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 shadow-sm"
                  style={{
                    width: "84%",
                    backgroundColor: colors.accent,
                    boxShadow: `0 0 6px ${colors.accent}`,
                  }}
                />
              </div>
              <span className="text-[11px] font-mono font-medium text-zinc-300">
                52.4 МБ/с
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
