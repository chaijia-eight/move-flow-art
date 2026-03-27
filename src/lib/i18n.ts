import { loadSettings } from "./settingsStore";
import { openingDescriptions, variationTranslations } from "./i18n-openings";

export type Language = "en" | "zh";

const translations = {
  // ==================== Common ====================
  back: { en: "Back", zh: "返回" },
  settings: { en: "Settings", zh: "设置" },
  white: { en: "White", zh: "白方" },
  black: { en: "Black", zh: "黑方" },
  loading: { en: "Loading...", zh: "加载中..." },
  cancel: { en: "Cancel", zh: "取消" },

  // ==================== Index / Home ====================
  appTagline: {
    en: "Learn chess openings at your own pace.",
    zh: "按自己的节奏学习国际象棋开局。",
  },
  recommendedNextStep: { en: "Recommended Next Step", zh: "推荐下一步" },
  openingProgress: { en: "Opening progress", zh: "开局进度" },
  start: { en: "Start", zh: "开始" },
  allMastered: { en: "All Mastered!", zh: "全部掌握！" },
  allMasteredDesc: { en: "You've mastered every line. Impressive.", zh: "你已经掌握了所有变化。令人印象深刻。" },
  progress: { en: "Progress", zh: "进度" },
  linesMastered: { en: "Lines Mastered", zh: "已掌握变化" },
  openingsStarted: { en: "Openings Started", zh: "已开始开局" },
  totalAttempts: { en: "Total Attempts", zh: "总尝试次数" },
  mastery: { en: "Mastery", zh: "掌握程度" },
  yourBookshelf: { en: "Your Bookshelf", zh: "你的书架" },
  yourGarden: { en: "Your Garden", zh: "你的花园" },
  createNewLine: { en: "Create New Line", zh: "创建新变化" },
  gardenEmpty: { en: "Your garden is empty. Create your first custom line!", zh: "你的花园是空的。创建你的第一条自定义变化！" },
  pickOpening: { en: "Pick an Opening", zh: "选择一个开局" },
  pickOpeningDesc: { en: "Choose an opening as your starting point. The first few moves will be locked, and you'll extend from there.", zh: "选择一个开局作为起点。前几步将被锁定，你将从那里开始扩展。" },
  baseOpening: { en: "Base Opening", zh: "基础开局" },
  buildingLine: { en: "Building Line", zh: "构建变化" },
  engineSuggests: { en: "Engine suggests", zh: "引擎建议" },
  moveIsGood: { en: "This move is also good!", zh: "这步棋也不错！" },
  moveIsBad: { en: "This move is not good.", zh: "这步棋不好。" },
  weSuggest: { en: "We suggest", zh: "我们建议" },
  wannaSwitch: { en: "Want to switch to your move?", zh: "要切换到你的走法吗？" },
  keepSuggested: { en: "Keep suggested", zh: "保留建议" },
  useMyMove: { en: "Use my move", zh: "使用我的走法" },
  keepBoth: { en: "Keep both", zh: "保留两者" },
  finishLine: { en: "Finish Line", zh: "完成变化" },
  lineTooShort: { en: "Line must be at least 9 moves", zh: "变化至少需要9步" },
  lineName: { en: "Line Name", zh: "变化名称" },
  saveLine: { en: "Save Line", zh: "保存变化" },
  customLine: { en: "Custom Line", zh: "自定义变化" },
  deleteLine: { en: "Delete", zh: "删除" },
  practiceCustom: { en: "Practice", zh: "练习" },
  evaluating: { en: "Evaluating...", zh: "评估中..." },
  depth: { en: "Depth", zh: "深度" },
  continuePracticing: { en: "Continue →", zh: "继续 →" },
  beginStudy: { en: "Begin →", zh: "开始 →" },
  mastered: { en: "Mastered", zh: "已精通" },
  continueReason: {
    en: (correct: number, total: number) => `Continue practicing — ${correct}/${total} correct`,
    zh: (correct: number, total: number) => `继续练习 — ${correct}/${total} 正确`,
  },
  startThisLine: { en: "Start this line", zh: "开始这条变化" },

  // ==================== Opening Card ====================
  family: { en: "Family", zh: "体系" },
  variations: { en: "variations", zh: "个变化" },
  lines: { en: "lines", zh: "条变化线路" },
  comingSoon: { en: "Coming soon", zh: "即将推出" },

  // ==================== StudyHub ====================
  openingNotFound: { en: "Opening not found.", zh: "未找到开局。" },
  playedAs: { en: "Played as", zh: "执棋方" },
  variationsLabel: { en: "Variations", zh: "变化" },
  totalLines: { en: "Total Lines", zh: "总变化线路" },
  masteredLabel: { en: "Mastered", zh: "已掌握" },
  studyModes: { en: "Study Modes", zh: "学习模式" },
  playThe: { en: "Play the", zh: "学习" },
  asWhiteLearn: { en: "As White — learn the main ideas", zh: "执白方——学习主要思路" },
  asBlackLearn: { en: "As Black — learn the main ideas", zh: "执黑方——学习主要思路" },
  playAgainstIt: { en: "Play Against It", zh: "对抗练习" },
  asWhiteChoose: { en: "As White — choose the opponent's line", zh: "执白方——选择对手的变化" },
  asBlackChoose: { en: "As Black — choose the opponent's line", zh: "执黑方——选择对手的变化" },
  linesToLearn: { en: "Lines to Learn", zh: "待学变化线路" },
  linesCount: { en: "lines", zh: "条" },
  correct: { en: "correct", zh: "正确" },
  vs: { en: "vs", zh: "对" },

  // ==================== Study Page ====================
  playAs: {
    en: (color: string) => `Play as ${color}`,
    zh: (color: string) => `执${color}`,
  },
  playAgainst: {
    en: (color: string) => `Play against (as ${color})`,
    zh: (color: string) => `对抗练习（执${color}）`,
  },
  reviewMode: { en: "Review Mode", zh: "复习模式" },
  challenge: { en: "CHALLENGE", zh: "挑战" },
  challengeMode: { en: "Challenge Mode", zh: "挑战模式" },
  noHints: { en: "No hints this time. Play the line from memory!", zh: "这次没有提示。凭记忆下棋吧！" },
  undo: { en: "Undo", zh: "悔棋" },
  redo: { en: "Redo", zh: "重做" },
  resetBoard: { en: "Reset board", zh: "重置棋盘" },
  lineCompleted: { en: "Line Completed", zh: "变化完成" },
  perfectRun: { en: "Perfect Run!", zh: "完美通关！" },
  hadMistakesMsg: {
    en: "You made it through, but had some mistakes. Try again for a perfect run!",
    zh: "你完成了，但有一些失误。再试一次，争取完美通关！",
  },
  greatJob: {
    en: (count: number) => `Great job! ${count} correct attempt${count > 1 ? "s" : ""}.`,
    zh: (count: number) => `太棒了！${count}次正确完成。`,
  },
  practiceAgain: { en: "Practice Again", zh: "再次练习" },
  nextLine: { en: "Next Line", zh: "下一条变化" },
  backToHub: { en: "Back to Hub", zh: "返回总览" },
  masteryQuestion: { en: "Do you think you've mastered this line?", zh: "你觉得你已经掌握了这条变化吗？" },
  completedCorrectly: {
    en: (count: number) => `You've completed it ${count} times correctly.`,
    zh: (count: number) => `你已经正确完成了${count}次。`,
  },
  notYet: { en: "Not yet, keep practicing", zh: "还没有，继续练习" },
  yesMastered: { en: "Yes, I've mastered it!", zh: "是的，我已经掌握了！" },
  moveHistory: { en: "Move History", zh: "走棋记录" },
  playFirstMove: { en: "Play your first move...", zh: "走出你的第一步..." },
  lineProgress: { en: "Line Progress", zh: "变化进度" },
  correctCount: { en: "correct", zh: "次正确" },
  totalCount: { en: "total", zh: "次总计" },
  aboutThisOpening: { en: "About This Opening", zh: "关于此开局" },
  yourOptions: { en: "Your Options", zh: "你的选择" },
  yourPlan: { en: "Your Plan", zh: "你的计划" },
  moves: { en: "moves", zh: "步" },
  customLines: { en: "Custom Lines", zh: "自定义变化" },
  customBranch: { en: "CUSTOM", zh: "自定义" },
  customBranchDesc: { en: "You're off-book. The engine evaluates each move.", zh: "你已偏离棋谱。引擎将评估每一步。" },
  customBranchStarted: { en: "Exploring your own line. The engine will guide you.", zh: "正在探索你自己的变化。引擎会指导你。" },
  evaluatingMove: { en: "Evaluating move...", zh: "评估走法中..." },
  moveIsValidAlt: {
    en: (san: string) => `${san} is a valid alternative. Want to explore this line?`,
    zh: (san: string) => `${san}是一个可行的替代走法。想探索这条变化吗？`,
  },
  lineRecorded: { en: "Line Recorded!", zh: "变化已记录！" },
  saveCustomLine: { en: "Save Custom Line", zh: "保存自定义变化" },
  saveCustomLineDesc: { en: "Save this line to practice it later and master it.", zh: "保存这条变化以便日后练习并掌握。" },
  lineSaved: { en: "Line Saved!", zh: "变化已保存！" },
  lineSavedDesc: { en: "Your custom line is now available in the opening's study hub.", zh: "你的自定义变化现在可以在开局学习中心找到。" },
  discard: { en: "Discard", zh: "放弃" },
  yourCustomLines: { en: "Your Custom Lines", zh: "你的自定义变化" },

  // ==================== Feedback ====================
  goodContinue: { en: "Good. Let's continue.", zh: "好的，继续。" },
  goodThisIs: {
    en: (name: string) => `Good. This is the ${name}.`,
    zh: (name: string) => `好的。这是${name}。`,
  },
  interestingMove: {
    en: "Interesting move. We don't have this in our study lines yet.",
    zh: "有趣的一步。我们的学习库中还没有这条变化。",
  },
  thatsThe: {
    en: (name: string) => `That's the ${name}! Want to switch to studying that opening?`,
    zh: (name: string) => `这是${name}！要切换到学习那个开局吗？`,
  },
  alsoGood: {
    en: (name: string) => `This move is also good — it's called the ${name}. Want to switch?`,
    zh: (name: string) => `这步棋也不错——叫做${name}。要切换吗？`,
  },
  switchedTo: {
    en: (name: string) => `Switched to the ${name}. Let's explore this line.`,
    zh: (name: string) => `已切换到${name}。让我们探索这条变化。`,
  },
  notBestMove: { en: "That's not the best move here.", zh: "这不是此处最佳的一步。" },
  tryInstead: { en: "Try", zh: "试试" },
  instead: { en: "instead.", zh: "。" },
  switchBtn: { en: "Switch", zh: "切换" },
  stayBtn: { en: "Stay", zh: "留下" },
  tryAgain: { en: "Try Again", zh: "重试" },
  studyingThe: {
    en: (name: string) => `You're studying the ${name}.`,
    zh: (name: string) => `你正在学习${name}。`,
  },
  nowExploring: {
    en: (name: string) => `You're now exploring the ${name}.`,
    zh: (name: string) => `你正在探索${name}。`,
  },

  // ==================== Settings ====================
  account: { en: "Account", zh: "账户" },
  signedInAs: { en: "Signed in as", zh: "已登录：" },
  signInToSync: { en: "Sign in to sync your progress across devices.", zh: "登录以在多设备间同步你的进度。" },
  signOut: { en: "Sign Out", zh: "退出登录" },
  signIn: { en: "Sign In", zh: "登录" },
  createAccount: { en: "Create Account", zh: "注册账号" },
  email: { en: "Email", zh: "邮箱" },
  password: { en: "Password", zh: "密码" },
  checkEmail: { en: "Check your email to confirm your account.", zh: "请查看邮箱确认你的账号。" },
  soundEffects: { en: "Sound Effects", zh: "音效" },
  toggleSounds: { en: "Toggle move and capture sounds.", zh: "切换走棋和吃子音效。" },
  enableSounds: { en: "Enable sounds", zh: "启用音效" },
  appearance: { en: "Appearance", zh: "外观" },
  toggleDarkLight: { en: "Toggle between dark and light mode.", zh: "切换深色和浅色模式。" },
  darkMode: { en: "Dark mode", zh: "深色模式" },
  resetProgress: { en: "Reset Progress", zh: "重置进度" },
  clearAllData: { en: "Clear all mastery and attempt data. This cannot be undone.", zh: "清除所有掌握和尝试数据。此操作无法撤销。" },
  resetAllProgress: { en: "Reset All Progress", zh: "重置所有进度" },
  confirmResetMsg: { en: "Confirm Reset — Are you sure?", zh: "确认重置——你确定吗？" },
  language: { en: "Language", zh: "语言" },
  selectLanguage: { en: "Choose your preferred language.", zh: "选择你的首选语言。" },
  english: { en: "English", zh: "English" },
  chinese: { en: "中文", zh: "中文" },

  // ==================== Subscription ====================
  subscription: { en: "Subscription", zh: "订阅" },
  freePlan: { en: "Free Plan", zh: "免费计划" },
  proPlan: { en: "Pro Plan", zh: "专业计划" },
  proPlanPrice: { en: "$5/month", zh: "$5/月" },
  currentPlan: { en: "Current Plan", zh: "当前计划" },
  upgradeToPro: { en: "Upgrade to Pro", zh: "升级到专业版" },
  manageSubscription: { en: "Manage Subscription", zh: "管理订阅" },
  freeFeatures: { en: "2 new lines/day · 1 practice/day · Cloud sync", zh: "每日2条新变化 · 每日1次练习 · 云同步" },
  proFeatures: { en: "Unlimited lines · Unlimited practice · Cloud sync", zh: "无限变化 · 无限练习 · 云同步" },
  dailyLimitReached: { en: "Daily limit reached", zh: "已达每日上限" },
  upgradeToLearnMore: { en: "Upgrade to Pro for unlimited lines", zh: "升级到专业版解锁无限变化" },
  practiceUsedToday: { en: "Practice used today", zh: "今日练习已用完" },
  upgradeToPracticeMore: { en: "Upgrade to Pro for unlimited practice", zh: "升级到专业版解锁无限练习" },
  linesUsedToday: {
    en: (used: number, max: number) => `${used}/${max} new lines today`,
    zh: (used: number, max: number) => `今日新变化 ${used}/${max}`,
  },
  unlimitedAccess: { en: "Unlimited", zh: "无限制" },
  dailyLimits: { en: "Today's Limits", zh: "今日限额" },
  newLines: { en: "New lines", zh: "新变化" },
  practice: { en: "Practice", zh: "练习" },
  requiresAccount: { en: "Create an account to start learning", zh: "创建账号开始学习" },

  // ==================== 404 ====================
  pageNotFound: { en: "Oops! Page not found", zh: "哎呀！页面未找到" },
  returnHome: { en: "Return to Home", zh: "返回首页" },

  // ==================== Chess Opening Names (Chinese) ====================
  openingName: {
    "italian-game": { en: "Italian Game", zh: "意大利开局" },
    "sicilian-defense": { en: "Sicilian Defense", zh: "西西里防御" },
    "queens-gambit": { en: "Queen's Gambit", zh: "后翼弃兵" },
    "kings-indian-defense": { en: "King's Indian Defense", zh: "王翼印度防御" },
    "french-defense": { en: "French Defense", zh: "法兰西防御" },
    "caro-kann-defense": { en: "Caro-Kann Defense", zh: "卡罗-卡恩防御" },
    "ruy-lopez": { en: "Ruy López", zh: "西班牙开局" },
    "london-system": { en: "London System", zh: "伦敦体系" },
    "scotch-game": { en: "Scotch Game", zh: "苏格兰开局" },
    "dutch-defense": { en: "Dutch Defense", zh: "荷兰防御" },
    "pirc-defense": { en: "Pirc Defense", zh: "皮尔茨防御" },
    "scandinavian-defense": { en: "Scandinavian Defense", zh: "斯堪的纳维亚防御" },
    "english-opening": { en: "English Opening", zh: "英格兰开局" },
    "nimzo-indian": { en: "Nimzo-Indian Defense", zh: "尼姆佐-印度防御" },
    "grunfeld-defense": { en: "Grünfeld Defense", zh: "格林菲尔德防御" },
    "alekhine-defense": { en: "Alekhine's Defense", zh: "阿廖欣防御" },
    "vienna-game": { en: "Vienna Game", zh: "维也纳开局" },
    "catalan-opening": { en: "Catalan Opening", zh: "卡塔兰开局" },
    "benoni-defense": { en: "Benoni Defense", zh: "贝诺尼防御" },
    "philidor-defense": { en: "Philidor Defense", zh: "菲利多尔防御" },
    "reti-opening": { en: "Réti Opening", zh: "列季开局" },
  } as Record<string, { en: string; zh: string }>,

  // ==================== Chess Family Names ====================
  familyName: {
    "Italian": { en: "Italian", zh: "意大利" },
    "Sicilian": { en: "Sicilian", zh: "西西里" },
    "Queen's Gambit": { en: "Queen's Gambit", zh: "后翼弃兵" },
    "King's Indian": { en: "King's Indian", zh: "王翼印度" },
    "French": { en: "French", zh: "法兰西" },
    "Caro-Kann": { en: "Caro-Kann", zh: "卡罗-卡恩" },
    "Ruy López": { en: "Ruy López", zh: "西班牙" },
    "London": { en: "London", zh: "伦敦" },
    "Scotch": { en: "Scotch", zh: "苏格兰" },
    "Dutch": { en: "Dutch", zh: "荷兰" },
    "Pirc": { en: "Pirc", zh: "皮尔茨" },
    "Scandinavian": { en: "Scandinavian", zh: "斯堪的纳维亚" },
    "English": { en: "English", zh: "英格兰" },
    "Nimzo-Indian": { en: "Nimzo-Indian", zh: "尼姆佐-印度" },
    "Grünfeld": { en: "Grünfeld", zh: "格林菲尔德" },
    "Alekhine": { en: "Alekhine", zh: "阿廖欣" },
    "Vienna": { en: "Vienna", zh: "维也纳" },
    "Catalan": { en: "Catalan", zh: "卡塔兰" },
    "Benoni": { en: "Benoni", zh: "贝诺尼" },
    "Philidor": { en: "Philidor", zh: "菲利多尔" },
    "Réti": { en: "Réti", zh: "列季" },
  } as Record<string, { en: string; zh: string }>,
} as const;

type TranslationKey = keyof typeof translations;

export function getLanguage(): Language {
  return loadSettings().language || "en";
}

export function t(key: TranslationKey): string {
  const lang = getLanguage();
  const entry = translations[key];
  if (!entry) return key;
  if (typeof entry === "object" && "en" in entry && typeof entry.en === "string") {
    return (entry as any)[lang] || (entry as any).en;
  }
  return key;
}

// For function-type translations
export function tf<T extends (...args: any[]) => string>(key: TranslationKey): T {
  const lang = getLanguage();
  const entry = translations[key];
  if (!entry) return ((...args: any[]) => key) as T;
  return ((entry as any)[lang] || (entry as any).en) as T;
}

// For nested lookups like opening names
export function tn(key: TranslationKey, subKey: string): string {
  const lang = getLanguage();
  const entry = (translations as any)[key];
  if (!entry || !entry[subKey]) return subKey;
  return entry[subKey][lang] || entry[subKey].en || subKey;
}

// Translate opening description
export function tDesc(openingId: string, fallback: string): string {
  const lang = getLanguage();
  const entry = openingDescriptions[openingId];
  if (!entry) return fallback;
  return entry[lang] || entry.en || fallback;
}

// Translate variation field (name, description, plan)
export function tVar(variationId: string, field: "name" | "description" | "plan", fallback: string): string {
  const lang = getLanguage();
  const entry = variationTranslations[variationId];
  if (!entry || !entry[field]) return fallback;
  return entry[field][lang] || entry[field].en || fallback;
}
