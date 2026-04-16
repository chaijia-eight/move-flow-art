// === RPG Constants & Utilities ===

export interface RankDef {
  id: string;
  label: string;
  minXp: number;
  icon: string;
  color: string;
  description: string;
}

export const RANKS: RankDef[] = [
  { id: "novice", label: "Novice", minXp: 0, icon: "♟", color: "text-muted-foreground", description: "Plain tunic, wooden sword" },
  { id: "apprentice", label: "Apprentice", minXp: 10000, icon: "♞", color: "text-blue-400", description: "Leather armor, iron sword" },
  { id: "smith", label: "Smith", minXp: 47500, icon: "♜", color: "text-purple-400", description: "Chainmail, glowing hammer" },
  { id: "tactician", label: "Tactician", minXp: 172500, icon: "♛", color: "text-orange-400", description: "Runed robes, floating pieces" },
  { id: "grandmaster", label: "Grandmaster", minXp: 797500, icon: "♚", color: "text-yellow-400", description: "Obsidian armor, crown of light" },
];

export function getRankForXp(xp: number): RankDef {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) return RANKS[i];
  }
  return RANKS[0];
}

export function getNextRank(xp: number): RankDef | null {
  const current = getRankForXp(xp);
  const idx = RANKS.findIndex((r) => r.id === current.id);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

// XP per level by tier
function xpForLevel(level: number): number {
  if (level <= 10) return 1000;
  if (level <= 25) return 2500;
  if (level <= 50) return 5000;
  if (level <= 75) return 10000;
  return 25000;
}

export function getLevelFromXp(xp: number): number {
  let remaining = xp;
  let level = 1;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return level;
}

export function getXpProgressInLevel(xp: number): { current: number; needed: number } {
  let remaining = xp;
  let level = 1;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { current: remaining, needed: xpForLevel(level) };
}

// Streak multiplier
export function getStreakMultiplier(days: number): number {
  if (days >= 30) return 2.0;
  if (days >= 7) return 1.5;
  if (days >= 3) return 1.2;
  return 1.0;
}

export function getStreakLabel(days: number): string | null {
  if (days >= 30) return "Unbroken";
  if (days >= 7) return "On Fire";
  if (days >= 3) return "Warming Up";
  return null;
}

// XP reward constants
export const XP_REWARDS = {
  dailyRitualQuest: 150,
  dailyRitualBonus: 200, // all 3 complete
  pillarFloorClear: 200,
  trialBase: 20,
  perfectMultiplier: 2,
  speedBonus: 0.5, // +50%
};

export const EMBER_REWARDS = {
  dailyRitualQuest: 10,
  dailyRitualBonus: 25,
  pillarFloorClear: 30,
  perfectTrial: 5,
};

// Quest types for daily rituals
export interface QuestType {
  id: string;
  name: string;
  description: string;
  icon: string;
  pillar: "tactical" | "positional" | "endgame";
  goalCount: number;
  timeLimitSeconds?: number;
}

export const QUEST_TYPES: QuestType[] = [
  { id: "fork_hunt", name: "Slay the Fork Fiend", description: "Find knight forks", icon: "⚔️", pillar: "tactical", goalCount: 5, timeLimitSeconds: 180 },
  { id: "pin_master", name: "The Pin Weaver", description: "Find pins and skewers", icon: "📌", pillar: "tactical", goalCount: 5, timeLimitSeconds: 180 },
  { id: "mate_patterns", name: "Checkmate Forge", description: "Find checkmates", icon: "👑", pillar: "tactical", goalCount: 5 },
  { id: "defend_draw", name: "Defend the Castle", description: "Hold losing positions to draw", icon: "🛡️", pillar: "endgame", goalCount: 3 },
  { id: "speed_trial", name: "The Speed Trial", description: "Solve puzzles with 80%+ accuracy", icon: "⚡", pillar: "tactical", goalCount: 10, timeLimitSeconds: 150 },
  { id: "endgame_convert", name: "The Closer", description: "Convert winning endgames", icon: "🏆", pillar: "endgame", goalCount: 3 },
  { id: "pawn_play", name: "Pawn Storm", description: "Find pawn breakthroughs", icon: "🏰", pillar: "positional", goalCount: 5 },
  { id: "piece_activity", name: "Awaken the Pieces", description: "Improve piece placement", icon: "🗡️", pillar: "positional", goalCount: 5 },
];

export function generateDailyQuests(weakPillar?: string): QuestType[] {
  const shuffled = [...QUEST_TYPES].sort(() => Math.random() - 0.5);
  const quests: QuestType[] = [];
  // Prioritize weak pillar
  if (weakPillar) {
    const weak = shuffled.find((q) => q.pillar === weakPillar);
    if (weak) quests.push(weak);
  }
  for (const q of shuffled) {
    if (quests.length >= 3) break;
    if (!quests.find((e) => e.id === q.id)) quests.push(q);
  }
  return quests.slice(0, 3);
}

// Vault shop items
export interface VaultItem {
  id: string;
  type: "theme" | "piece_set" | "title" | "cosmetic";
  name: string;
  description: string;
  cost: number;
  rarity: "common" | "rare" | "legendary";
  preview?: string;
}

export const VAULT_ITEMS: VaultItem[] = [
  { id: "theme-wood", type: "theme", name: "Oakwood", description: "Classic warm wood grain", cost: 50, rarity: "common" },
  { id: "theme-marble", type: "theme", name: "Marble Hall", description: "Polished white marble", cost: 100, rarity: "common" },
  { id: "theme-obsidian", type: "theme", name: "Obsidian", description: "Dark volcanic glass", cost: 200, rarity: "rare" },
  { id: "theme-ice", type: "theme", name: "Frozen Lake", description: "Glacial ice with frost", cost: 200, rarity: "rare" },
  { id: "theme-lava", type: "theme", name: "Molten Core", description: "Cracked earth with lava glow", cost: 500, rarity: "legendary" },
  { id: "theme-neon", type: "theme", name: "Neon Grid", description: "Cyberpunk neon wireframe", cost: 500, rarity: "legendary" },
  { id: "pieces-minimalist", type: "piece_set", name: "Minimalist", description: "Clean geometric pieces", cost: 150, rarity: "common" },
  { id: "pieces-fantasy", type: "piece_set", name: "Fantasy", description: "Dragon-themed set", cost: 300, rarity: "rare" },
  { id: "pieces-futuristic", type: "piece_set", name: "Futuristic", description: "Holographic pieces", cost: 300, rarity: "rare" },
  { id: "title-fork-fiend", type: "title", name: "The Fork Fiend", description: "Master of double attacks", cost: 100, rarity: "common" },
  { id: "title-endgame-closer", type: "title", name: "Endgame Closer", description: "Finisher of games", cost: 100, rarity: "common" },
  { id: "title-speed-demon", type: "title", name: "Speed Demon", description: "Lightning solver", cost: 200, rarity: "rare" },
  { id: "title-unbroken", type: "title", name: "Unbroken", description: "30-day streak achieved", cost: 0, rarity: "legendary" },
];

export function getRarityColor(rarity: VaultItem["rarity"]): string {
  switch (rarity) {
    case "common": return "text-muted-foreground";
    case "rare": return "text-blue-400";
    case "legendary": return "text-yellow-400";
  }
}
