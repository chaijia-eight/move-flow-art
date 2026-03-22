// Chinese translations for opening descriptions, variation names, descriptions, and plans

export const openingDescriptions: Record<string, { en: string; zh: string }> = {
  "italian-game": {
    en: "A classical opening developing the bishop to c4, targeting f7. Leads to rich tactical and strategic play.",
    zh: "经典开局，将象发展到c4，瞄准f7。带来丰富的战术和战略博弈。",
  },
  "sicilian-defense": {
    en: "The most popular response to 1.e4. Black fights for the center asymmetrically with sharp play.",
    zh: "对1.e4最流行的应对。黑方以不对称的激烈下法争夺中心。",
  },
  "queens-gambit": {
    en: "White offers a pawn to gain central control. Sophisticated with deep strategic themes.",
    zh: "白方弃兵以获得中心控制。精妙深邃，蕴含丰富的战略主题。",
  },
  "kings-indian": {
    en: "A hypermodern defense where Black lets White build a center, planning to strike back later.",
    zh: "一种超现代防御，黑方允许白方建立中心，计划稍后反击。",
  },
  "french-defense": {
    en: "A solid defense creating a pawn chain. Black aims for a counterattack on White's center.",
    zh: "一种坚实的防御，形成兵链。黑方旨在反击白方中心。",
  },
  "caro-kann": {
    en: "A reliable defense with solid pawn structure and flexible development.",
    zh: "一种可靠的防御，兵型坚固，发展灵活。",
  },
  "ruy-lopez": {
    en: "One of the oldest and most respected openings. White pressures Black's center through the a4-e8 diagonal.",
    zh: "最古老、最受尊敬的开局之一。白方通过a4-e8对角线对黑方中心施压。",
  },
  "london-system": {
    en: "A solid, easy-to-learn system for White. Develop Bf4, e3, Nf3 — reliable at every level.",
    zh: "白方坚实易学的体系。发展Bf4、e3、Nf3——在各级别都可靠。",
  },
  "scotch-game": {
    en: "White opens the center early with 3.d4. Direct and tactical — a favorite of Kasparov.",
    zh: "白方以3.d4早期打开中心。直接且富有战术性——卡斯帕罗夫的最爱。",
  },
  "dutch-defense": {
    en: "An ambitious defense with f5, fighting for kingside control from move one.",
    zh: "以f5进行的雄心勃勃的防御，从第一步就争夺王翼控制权。",
  },
  "pirc-defense": {
    en: "A flexible hypermodern defense — Black develops the bishop to g7 and strikes later.",
    zh: "一种灵活的超现代防御——黑方将象发展到g7，稍后发动攻击。",
  },
  "scandinavian-defense": {
    en: "Black immediately challenges e4 with d5. Simple and direct — great for beginners.",
    zh: "黑方立即以d5挑战e4。简单直接——非常适合初学者。",
  },
  "english-opening": {
    en: "1.c4 — a flexible flank opening that often transposes. Strategic and positional.",
    zh: "1.c4——灵活的侧翼开局，常常转化为其他开局。战略性强，注重局面。",
  },
  "nimzo-indian": {
    en: "One of Black's best responses to 1.d4. The pin on Nc3 creates lasting pressure.",
    zh: "黑方对1.d4最佳的应对之一。钉住Nc3造成持久的压力。",
  },
  "grunfeld-defense": {
    en: "Black strikes at the center with d5 after allowing e4. Dynamic and counterattacking.",
    zh: "黑方在允许e4后以d5反击中心。充满活力和反击性。",
  },
  "alekhine-defense": {
    en: "A provocative defense — Black lures White's pawns forward, then undermines them.",
    zh: "一种挑衅性的防御——黑方引诱白方兵前进，然后破坏它们。",
  },
  "vienna-game": {
    en: "White develops Nc3 before Nf3, allowing aggressive f4 gambits or positional Bc4 setups.",
    zh: "白方在Nf3之前发展Nc3，允许激进的f4弃兵或阵地型Bc4布局。",
  },
  "catalan-opening": {
    en: "A sophisticated opening where White fianchettoes on g2, combining Queen's Gambit ideas with a powerful bishop.",
    zh: "一种精妙的开局，白方在g2侧翼发展象，将后翼弃兵的思路与强力象结合。",
  },
  "benoni-defense": {
    en: "Black creates asymmetric pawn structure with c5 against d4, leading to dynamic kingside vs queenside battles.",
    zh: "黑方以c5对抗d4形成不对称兵型，带来王翼对后翼的激烈对抗。",
  },
  "philidor-defense": {
    en: "A solid but slightly passive defense with d6. Named after the legendary 18th-century player Philidor.",
    zh: "以d6进行的坚实但略显被动的防御。以18世纪传奇棋手菲利多尔命名。",
  },
  "reti-opening": {
    en: "A hypermodern opening — White controls the center with pieces rather than pawns. Flexible and transpositional.",
    zh: "一种超现代开局——白方用棋子而非兵来控制中心。灵活且富于转化。",
  },
};

export const variationTranslations: Record<string, { name: { en: string; zh: string }; description: { en: string; zh: string }; plan: { en: string; zh: string } }> = {
  // Italian Game
  "giuoco-piano": {
    name: { en: "Giuoco Piano", zh: "意大利柔和局" },
    description: { en: "The quiet game — solid development with c3 and d4.", zh: "柔和的棋局——以c3和d4进行坚实的发展。" },
    plan: { en: "Aim for a strong center with c3 and d4. Castle kingside, develop pieces actively, and launch a central attack. The result is an open, tactical middlegame where White has a slight space advantage.", zh: "以c3和d4建立强大的中心。王翼易位，积极发展棋子，发起中心进攻。结果是一个开放的、战术性的中局，白方有轻微的空间优势。" },
  },
  "two-knights": {
    name: { en: "Two Knights Defense", zh: "双马防御" },
    description: { en: "Black plays Nf6 instead of Bc5 for sharper play.", zh: "黑方走Nf6而非Bc5，寻求更激烈的下法。" },
    plan: { en: "As White, attack with d4 and aim for the Fried Liver or Traxler. As Black, challenge White's center early and seek active piece play. Leads to sharp, tactical positions with chances for both sides.", zh: "执白方，以d4进攻，瞄准炸肝攻击或特拉克斯勒反击。执黑方，早期挑战白方中心，寻求积极的子力活动。带来激烈的战术性局面，双方都有机会。" },
  },
  "evans-gambit": {
    name: { en: "Evans Gambit", zh: "埃文斯弃兵" },
    description: { en: "White sacrifices a pawn with b4 for rapid development.", zh: "白方以b4弃兵换取快速发展。" },
    plan: { en: "Sacrifice the b4 pawn to deflect Black's bishop, then build a powerful center with c3 and d4. Develop rapidly and attack the kingside. White gets a dangerous initiative in exchange for a pawn.", zh: "牺牲b4兵以偏转黑方的象，然后以c3和d4建立强大中心。快速发展并进攻王翼。白方以一个兵换取危险的先手。" },
  },
  // Sicilian Defense
  "najdorf": {
    name: { en: "Najdorf Variation", zh: "纳伊道夫变例" },
    description: { en: "The sharpest and most popular Sicilian — 5...a6.", zh: "最激烈、最流行的西西里变例——5...a6。" },
    plan: { en: "As Black, play a6 to control b5 and prepare queenside expansion with b5. Aim for counterplay on the c-file and queenside while White attacks the kingside. A complex, double-edged battle.", zh: "执黑方，走a6控制b5并准备以b5进行后翼扩张。在c线和后翼寻求反击，同时白方进攻王翼。复杂的双刃对抗。" },
  },
  "dragon": {
    name: { en: "Dragon Variation", zh: "龙式变例" },
    description: { en: "Black fianchettoes the bishop for kingside pressure.", zh: "黑方侧翼发展象，对王翼施压。" },
    plan: { en: "Fianchetto the bishop on g7, aiming it at White's queenside. Castle kingside and attack on the c-file. White often castles queenside and attacks your king — it's a race. Exciting, razor-sharp play.", zh: "在g7侧翼发展象，瞄准白方后翼。王翼易位并在c线进攻。白方通常后翼易位并进攻你的王——这是一场竞速。激动人心的超激烈下法。" },
  },
  "classical-sic": {
    name: { en: "Classical Variation", zh: "古典变例" },
    description: { en: "Black develops the knight to c6 for classical play.", zh: "黑方将马发展到c6，进行古典下法。" },
    plan: { en: "Develop naturally with Nc6 to pressure d4. Aim for queenside play and central control. A well-rounded setup that avoids the sharpest theoretical lines while keeping dynamic chances.", zh: "以Nc6自然发展，对d4施压。瞄准后翼和中心控制。一种全面的布局，避开最激烈的理论变化，同时保持动态机会。" },
  },
  "scheveningen": {
    name: { en: "Scheveningen", zh: "斯赫弗宁根变例" },
    description: { en: "Flexible with e6 — sets up a strong pawn duo.", zh: "以e6灵活应对——建立强大的兵对。" },
    plan: { en: "Build a solid pawn structure with d6+e6. Develop flexibly and prepare breaks like d5 or b5. The position is rich and strategic — Black has a resilient setup with long-term counterplay.", zh: "以d6+e6建立坚固的兵型。灵活发展并准备d5或b5的突破。局面丰富且富有战略性——黑方拥有有韧性的阵型和长期反击。" },
  },
  // Queen's Gambit
  "qgd": {
    name: { en: "Queen's Gambit Declined", zh: "后翼弃兵拒受" },
    description: { en: "Black declines with e6, maintaining solid structure.", zh: "黑方以e6拒绝弃兵，保持坚固阵型。" },
    plan: { en: "As White, build a strong center and develop pieces to active squares. Aim for a minority attack on the queenside (b4-b5) or a central breakthrough with e4. White maintains a lasting positional edge.", zh: "执白方，建立强大中心并将棋子发展到活跃位置。瞄准后翼少数派进攻(b4-b5)或以e4进行中心突破。白方保持持久的阵地优势。" },
  },
  "qga": {
    name: { en: "Queen's Gambit Accepted", zh: "后翼弃兵接受" },
    description: { en: "Black takes the pawn, aiming to equalize.", zh: "黑方吃兵，旨在求和。" },
    plan: { en: "As White, reclaim the pawn and exploit your development advantage. Push e4 to dominate the center. As Black, hold onto the pawn temporarily while developing. The position often simplifies with a slight White edge.", zh: "执白方，夺回兵并利用发展优势。推e4控制中心。执黑方，在发展的同时暂时保持多兵。局面通常简化，白方略优。" },
  },
  "slav": {
    name: { en: "Slav Defense", zh: "斯拉夫防御" },
    description: { en: "Black supports d5 with c6 — solid and flexible.", zh: "黑方以c6支撑d5——坚固且灵活。" },
    plan: { en: "As Black, maintain the d5 pawn with c6 and develop the bishop to f5 or g4 before playing e6. A rock-solid structure that avoids the bad bishop problem of the QGD. Aim for equality with chances.", zh: "执黑方，以c6维持d5兵并在走e6之前将象发展到f5或g4。坚如磐石的阵型，避免了后翼弃兵拒受中的坏象问题。以有机会的方式争取均势。" },
  },
  // King's Indian
  "classical-kid": {
    name: { en: "Classical KID", zh: "古典王翼印度" },
    description: { en: "Nf3 + Be2 setup — the main battleground.", zh: "Nf3 + Be2阵型——主要战场。" },
    plan: { en: "As Black, let White build the center, then strike with e5 and f5. Launch a kingside attack while White expands on the queenside. The result is a thrilling race between opposite-side attacks.", zh: "执黑方，让白方建立中心，然后以e5和f5反击。在白方后翼扩张时发起王翼进攻。结果是双方异翼进攻的惊心动魄的竞速。" },
  },
  "samisch": {
    name: { en: "Sämisch Variation", zh: "塞米施变例" },
    description: { en: "White plays f3 for an aggressive kingside setup.", zh: "白方走f3进行激进的王翼布阵。" },
    plan: { en: "As White, build a massive center with f3 and Be3, then castle queenside and launch a pawn storm. As Black, strike with c5 or e5 and counterattack. Double-edged with fireworks on both flanks.", zh: "执白方，以f3和Be3建立庞大中心，然后后翼易位发起兵暴。执黑方，以c5或e5反击。双刃局面，两翼都有激烈战斗。" },
  },
  // French Defense
  "winawer": {
    name: { en: "Winawer Variation", zh: "维纳韦尔变例" },
    description: { en: "Black pins the knight with Bb4 — sharp and complex.", zh: "黑方以Bb4钉住马——激烈且复杂。" },
    plan: { en: "As Black, pin the knight with Bb4, creating immediate tension. After White plays e5, undermine the center with c5 and f6. The result is a sharp, imbalanced position where Black gets queenside play against White's kingside space.", zh: "执黑方，以Bb4钉住马，造成即时紧张。白方走e5后，以c5和f6破坏中心。结果是激烈的不平衡局面，黑方获得后翼反击来对抗白方的王翼空间。" },
  },
  "classical-french": {
    name: { en: "Classical French", zh: "古典法兰西" },
    description: { en: "Black plays Nf6, a solid and traditional approach.", zh: "黑方走Nf6，坚实而传统的下法。" },
    plan: { en: "Develop the knight to f6 attacking e4, then play c5 to challenge the center. Aim for a solid pawn structure and piece activity. Black gets a reliable, slightly cramped but resilient position.", zh: "将马发展到f6进攻e4，然后走c5挑战中心。追求坚固的兵型和子力活跃。黑方获得可靠的、略显拥挤但有韧性的阵地。" },
  },
  "advance-french": {
    name: { en: "Advance Variation", zh: "推进变例" },
    description: { en: "White pushes e5 early, locking the center.", zh: "白方早期推e5，锁住中心。" },
    plan: { en: "As Black, attack the pawn chain base with c5 and prepare f6 to undermine e5. Develop the dark-squared bishop actively via a5 or b4. The position becomes a strategic battle around the center pawns.", zh: "执黑方，以c5攻击兵链根部并准备f6破坏e5。通过a5或b4积极发展黑格象。局面变成围绕中心兵的战略对抗。" },
  },
  // Caro-Kann
  "classical-ck": {
    name: { en: "Classical Caro-Kann", zh: "古典卡罗-卡恩" },
    description: { en: "Bf5 develops naturally and solidly.", zh: "Bf5自然而坚实地发展。" },
    plan: { en: "Develop the bishop to f5 before playing e6, avoiding the 'French bishop' problem. Build a solid structure and aim for a safe, slightly inferior but very playable middlegame. Excellent for grinding down opponents.", zh: "在走e6之前将象发展到f5，避免"法兰西坏象"问题。建立坚固阵型，追求安全的、略逊但非常可下的中局。非常适合磨练对手。" },
  },
  "advance-ck": {
    name: { en: "Advance Caro-Kann", zh: "推进卡罗-卡恩" },
    description: { en: "White pushes e5, locking the center early.", zh: "白方推e5，早期锁住中心。" },
    plan: { en: "As Black, attack the pawn chain with c5 and prepare Nc6 and Bf5. Undermine White's center and aim for piece activity. A strategic battle where Black has clear plans against the overextended pawns.", zh: "执黑方，以c5攻击兵链并准备Nc6和Bf5。破坏白方中心，追求子力活跃。黑方对过度伸展的兵有明确计划的战略对抗。" },
  },
  "modern-ck": {
    name: { en: "Modern Caro-Kann", zh: "现代卡罗-卡恩" },
    description: { en: "Nd7 keeps flexible — a modern approach.", zh: "Nd7保持灵活——现代下法。" },
    plan: { en: "Develop Nd7 to keep options open for the knight and bishop. Play Ngf6 and aim for e6, Bd6 setups. A flexible approach that avoids the sharpest lines and gives Black a solid position with counterplay.", zh: "发展Nd7为马和象保持选择余地。走Ngf6并瞄准e6、Bd6的布局。灵活的下法，避开最激烈的变化，给黑方一个有反击机会的坚实阵地。" },
  },
  // Ruy López
  "morphy-defense": {
    name: { en: "Morphy Defense", zh: "莫菲防御" },
    description: { en: "a6 challenges the bishop — the main line.", zh: "a6挑战白方象——主线。" },
    plan: { en: "As White, maintain pressure on e5 via the bishop and build a strong center. As Black, play a6 to force the bishop to retreat, then aim for d5 counterplay. The position is rich with strategic depth — a lifelong opening.", zh: "执白方，通过象对e5保持压力并建立强大中心。执黑方，走a6迫使象后退，然后瞄准d5反击。局面蕴含丰富的战略深度——一生值得研究的开局。" },
  },
  "berlin-defense": {
    name: { en: "Berlin Defense", zh: "柏林防御" },
    description: { en: "Ultra-solid — the 'Berlin Wall' endgame.", zh: "超级坚固——"柏林墙"残局。" },
    plan: { en: "As Black, simplify into the Berlin endgame after Nf6. Trade queens early and aim for a solid, slightly worse but very holdable endgame. White has a small edge but Black's position is fortress-like.", zh: "执黑方，走Nf6后简化进入柏林残局。早期兑换皇后，瞄准坚固的、略逊但非常可守的残局。白方有微小优势但黑方阵地如堡垒一般。" },
  },
  // London System
  "london-classical": {
    name: { en: "Classical London", zh: "古典伦敦" },
    description: { en: "The standard 2...d5 3.e3 e6 setup with Nd2, c3, Ngf3, Bd3.", zh: "标准的2...d5 3.e3 e6阵型，配合Nd2、c3、Ngf3、Bd3。" },
    plan: { en: "Develop solidly with Bf4, e3, Bd3, Nbd2, and c3. Build a fortress-like structure, then expand with e4 when ready. The London gives White a safe, easy-to-play position with clear plans in the middlegame.", zh: "以Bf4、e3、Bd3、Nbd2和c3坚实发展。建立堡垒般的阵型，准备好时以e4扩张。伦敦体系给白方一个安全、易下的阵地，中局有明确计划。" },
  },
  "london-c5": {
    name: { en: "Early c5 Counter", zh: "早期c5反击" },
    description: { en: "Black challenges with c5 immediately — leads to dynamic play.", zh: "黑方立即以c5挑战——带来充满活力的对弈。" },
    plan: { en: "As White, maintain the d4 pawn with c3 and develop naturally. As Black, challenge with c5 to open the position. The fight centers on whether White's solid structure or Black's activity prevails.", zh: "执白方，以c3维持d4兵并自然发展。执黑方，以c5挑战以打开局面。争夺焦点在于白方的坚固阵型还是黑方的活跃占上风。" },
  },
  "london-bf5": {
    name: { en: "Bishop Sortie", zh: "象出击" },
    description: { en: "Black develops Bf5 early to trade light-squared bishops.", zh: "黑方早期发展Bf5以兑换白格象。" },
    plan: { en: "As Black, develop Bf5 to trade off the potentially bad bishop. As White, avoid the trade and maintain the bishop pair. The position is balanced with clear strategic themes for both sides.", zh: "执黑方，发展Bf5以兑换可能的坏象。执白方，避免兑换并保持双象。局面平衡，双方都有明确的战略主题。" },
  },
  "anti-london": {
    name: { en: "Anti-London with e6", zh: "反伦敦e6" },
    description: { en: "Black plays e6 to transpose into QGD-like positions.", zh: "黑方走e6转化为类似后翼弃兵拒受的局面。" },
    plan: { en: "As Black, play e6 followed by c5 to challenge the center. Aim to neutralize White's London setup by creating central tension. The result is a balanced middlegame with chances for active piece play.", zh: "执黑方，走e6然后c5挑战中心。通过制造中心紧张来化解白方伦敦体系。结果是平衡的中局，双方都有积极子力活动的机会。" },
  },
  // Scotch Game
  "classical-scotch": {
    name: { en: "Classical Scotch", zh: "古典苏格兰" },
    description: { en: "Bc5 against the knight — principled development.", zh: "以Bc5对抗马——原则性的发展。" },
    plan: { en: "As White, dominate the center after the early d4 exchange. Place the knight actively on d4 and develop quickly. As Black, challenge with Bc5 and aim for piece activity. An open, tactical middlegame with clear plans.", zh: "执白方，在早期d4兑换后控制中心。将马积极放在d4并快速发展。执黑方，以Bc5挑战并追求子力活跃。开放的战术性中局，计划明确。" },
  },
  "scotch-four-knights": {
    name: { en: "Scotch Four Knights", zh: "苏格兰四马" },
    description: { en: "Nf6 leads to four knights territory.", zh: "Nf6导向四马局面。" },
    plan: { en: "Both sides develop knights actively. White aims for a slight central advantage while Black seeks equality through active piece play. The position is solid and strategic with fewer tactical fireworks.", zh: "双方积极发展马。白方追求轻微的中心优势，黑方通过积极子力活动寻求均势。局面坚实且富有战略性，战术激烈程度较低。" },
  },
  // Dutch Defense
  "classical-dutch": {
    name: { en: "Classical Dutch", zh: "古典荷兰" },
    description: { en: "e6 + Be7 — solid and traditional.", zh: "e6 + Be7——坚实而传统。" },
    plan: { en: "As Black, control e4 with f5 and develop solidly with e6, Be7, O-O. Aim for a kingside attack with pieces behind the f-pawn. White has more central space but Black has clear attacking chances.", zh: "执黑方，以f5控制e4并以e6、Be7、O-O坚实发展。以f兵后方的棋子瞄准王翼进攻。白方有更多中心空间但黑方有明确的进攻机会。" },
  },
  "leningrad-dutch": {
    name: { en: "Leningrad Dutch", zh: "列宁格勒荷兰" },
    description: { en: "g6 + Bg7 — a KID-like structure.", zh: "g6 + Bg7——类似王翼印度的阵型。" },
    plan: { en: "Fianchetto the bishop and combine it with the f5 pawn for a powerful kingside presence. Play e5 when the time is right to seize space. A dynamic, fighting setup with real attacking potential.", zh: "侧翼发展象并与f5兵配合形成强大的王翼存在。在适当时机走e5抢占空间。充满活力的战斗阵型，有真正的进攻潜力。" },
  },
  "stonewall-dutch": {
    name: { en: "Stonewall Dutch", zh: "石墙荷兰" },
    description: { en: "d5 creates a wall — ultra-solid.", zh: "d5形成一道墙——超级坚固。" },
    plan: { en: "Set up pawns on d5, e6, f5, c6 to form an unbreakable wall. Develop pieces behind the wall and aim for a kingside attack with Qf3, Bd6, and Ne4. Solid but with real attacking chances.", zh: "在d5、e6、f5、c6设立兵形成坚不可摧的墙。在墙后发展棋子，以Qf3、Bd6和Ne4瞄准王翼进攻。坚固但有真正的进攻机会。" },
  },
  // Pirc Defense
  "classical-pirc": {
    name: { en: "Classical Pirc", zh: "古典皮尔茨" },
    description: { en: "Nf3 + Be2 — restrained but potent.", zh: "Nf3 + Be2——克制但有力。" },
    plan: { en: "As Black, develop flexibly with g6, Bg7, d6, and Nf6. Let White overextend in the center, then strike back with c5 or e5. A patient, hypermodern approach that punishes aggressive play.", zh: "执黑方，以g6、Bg7、d6和Nf6灵活发展。让白方在中心过度伸展，然后以c5或e5反击。耐心的超现代下法，惩罚激进的下法。" },
  },
  "austrian-attack": {
    name: { en: "Austrian Attack", zh: "奥地利进攻" },
    description: { en: "f3 — White plays aggressively.", zh: "f3——白方激进下法。" },
    plan: { en: "As White, build a massive center with f4 and e5, aiming to crush Black's setup. As Black, survive the early pressure and counterattack once White overextends. High-tension chess with decisive games.", zh: "执白方，以f4和e5建立庞大中心，旨在粉碎黑方阵型。执黑方，在白方过度伸展后生存早期压力并反击。高度紧张的棋局，胜负分明。" },
  },
  // Scandinavian
  "qxd5-scandi": {
    name: { en: "Qxd5 Scandinavian", zh: "Qxd5斯堪的纳维亚" },
    description: { en: "Recapture with the queen — the classic approach.", zh: "以皇后吃回——经典下法。" },
    plan: { en: "As Black, recapture with the queen and develop quickly after Qa5 or Qd6. White gains a tempo with Nc3 but Black gets rapid development. Aim for a solid, easy-to-play position with clear piece activity.", zh: "执黑方，以皇后吃回并在Qa5或Qd6后快速发展。白方以Nc3获得一步棋但黑方获得快速发展。追求坚实、易下的阵地，子力活跃明确。" },
  },
  "modern-scandi": {
    name: { en: "Modern Scandinavian", zh: "现代斯堪的纳维亚" },
    description: { en: "Nf6 — recapture with the knight instead.", zh: "Nf6——改用马吃回。" },
    plan: { en: "Recapture with the knight, keeping the queen safe. Play g6 and Bg7 for a King's Indian-like setup, or c6 and e6 for a solid structure. Less common but avoids the queen being harassed early.", zh: "以马吃回，保护皇后安全。走g6和Bg7形成类似王翼印度的阵型，或走c6和e6形成坚固阵型。不太常见但避免皇后早期被骚扰。" },
  },
  // English Opening
  "reversed-sicilian": {
    name: { en: "Reversed Sicilian", zh: "反西西里" },
    description: { en: "After e5, White plays a Sicilian with an extra tempo.", zh: "在e5后，白方以多一步棋下西西里。" },
    plan: { en: "As White, play a Sicilian Defense with colors reversed and an extra move. Fianchetto with g3, Bg2 and control the center. The extra tempo gives White a comfortable edge with flexible development options.", zh: "执白方，以反色多一步棋下西西里防御。以g3、Bg2侧翼发展并控制中心。多出的一步棋给白方舒适的优势和灵活的发展选择。" },
  },
  "four-knights-english": {
    name: { en: "Four Knights English", zh: "四马英格兰" },
    description: { en: "Symmetrical development — strategic maneuvering.", zh: "对称发展——战略性的机动。" },
    plan: { en: "Both sides develop knights symmetrically. White aims to exploit the first-move advantage through subtle positional play. A strategic, slow-burning opening where understanding trumps memorization.", zh: "双方对称发展马。白方通过微妙的阵地下法利用先手优势。战略性的、慢热型开局，理解比记忆更重要。" },
  },
  // Nimzo-Indian
  "classical-nimzo": {
    name: { en: "Classical Nimzo", zh: "古典尼姆佐" },
    description: { en: "Qc2 avoids doubled pawns — the main line.", zh: "Qc2避免叠兵——主线。" },
    plan: { en: "As White, play Qc2 to prevent doubled c-pawns after Bxc3. Aim for a strong center with e4 and develop harmoniously. As Black, seek counterplay with c5, d5, and active piece play. A deep, strategic battle.", zh: "执白方，走Qc2防止Bxc3后叠c兵。瞄准以e4建立强大中心并和谐发展。执黑方，以c5、d5和积极子力活动寻求反击。深入的战略对抗。" },
  },
  "rubinstein-nimzo": {
    name: { en: "Rubinstein Nimzo", zh: "鲁宾斯坦尼姆佐" },
    description: { en: "e3 — solid and positional.", zh: "e3——坚实且注重阵地。" },
    plan: { en: "As White, play e3 and develop the bishop to d3. Accept doubled pawns if Black takes on c3 — the bishop pair compensates. As Black, maintain pressure on the center and exploit the doubled pawns. A classic positional struggle.", zh: "执白方，走e3并将象发展到d3。如果黑方在c3吃掉，接受叠兵——双象作为补偿。执黑方，保持对中心的压力并利用叠兵。经典的阵地对抗。" },
  },
  // Grünfeld
  "exchange-grunfeld": {
    name: { en: "Exchange Grünfeld", zh: "兑换格林菲尔德" },
    description: { en: "White takes on d5 and plays e4 — the critical test.", zh: "白方在d5吃掉并走e4——关键考验。" },
    plan: { en: "As White, build a powerful center with e4 and d4, then defend it. As Black, attack the center relentlessly with c5, Nc6, Bg7, and pieces. The ultimate clash: central pawns vs piece pressure.", zh: "执白方，以e4和d4建立强大中心，然后防守。执黑方，以c5、Nc6、Bg7和棋子无情地进攻中心。终极对抗：中心兵vs子力压力。" },
  },
  "russian-grunfeld": {
    name: { en: "Russian System", zh: "俄罗斯体系" },
    description: { en: "Nf3 — more restrained and positional.", zh: "Nf3——更克制且注重阵地。" },
    plan: { en: "As White, avoid the sharp Exchange lines and build a slower, more positional advantage. As Black, develop flexibly and seek counterplay. A calmer approach that still offers White a slight edge.", zh: "执白方，避开激烈的兑换变化，建立更慢、更阵地化的优势。执黑方，灵活发展并寻求反击。更平静的方式，但白方仍有轻微优势。" },
  },
  // Alekhine
  "four-pawns-alekhine": {
    name: { en: "Four Pawns Attack", zh: "四兵进攻" },
    description: { en: "White pushes d4 — the most aggressive test.", zh: "白方推d4——最激进的考验。" },
    plan: { en: "As White, push pawns aggressively to crush Black's position. As Black, provoke weaknesses in the pawn chain and strike back with c5, d6, and piece activity. High-risk, high-reward for both sides.", zh: "执白方，激进推兵以粉碎黑方阵地。执黑方，在兵链中制造弱点并以c5、d6和子力活动反击。双方都是高风险高回报。" },
  },
  "exchange-alekhine": {
    name: { en: "Exchange Variation", zh: "兑换变例" },
    description: { en: "White plays d3 — quiet and positional.", zh: "白方走d3——安静且注重阵地。" },
    plan: { en: "As White, keep a modest but stable center with d3. Develop solidly and aim for a small, lasting edge. As Black, equalize comfortably and aim for active piece play. A quieter but strategically rich line.", zh: "执白方，以d3保持适度但稳定的中心。坚实发展，追求微小但持久的优势。执黑方，舒适地追求均势并瞄准积极子力活动。更安静但战略丰富的变化。" },
  },
  // Vienna Game
  "vienna-gambit": {
    name: { en: "Vienna Gambit", zh: "维也纳弃兵" },
    description: { en: "f4 — aggressive and sharp, attacking Black's center.", zh: "f4——激进而犀利，进攻黑方中心。" },
    plan: { en: "Sacrifice or exchange the f-pawn to blast open the f-file and attack Black's king. Develop rapidly with Bc4 and Nf3. White aims for a sharp, tactical assault — play for the attack or nothing.", zh: "牺牲或兑换f兵以打开f线进攻黑方王。以Bc4和Nf3快速发展。白方瞄准犀利的战术进攻——进攻就是一切。" },
  },
  "vienna-italian": {
    name: { en: "Vienna Italian", zh: "维也纳意大利" },
    description: { en: "Bc4 — a trappy line with Qh5 threats.", zh: "Bc4——带有Qh5威胁的陷阱变化。" },
    plan: { en: "Develop the bishop to c4 targeting f7, with ideas of Qh5+ tricks. Combine Nc3's support with aggressive piece play. White gets a dynamic position with multiple tactical threats in the early middlegame.", zh: "将象发展到c4瞄准f7，配合Qh5+的战术。结合Nc3的支持进行激进的子力活动。白方获得充满活力的阵地，早期中局有多重战术威胁。" },
  },
  "vienna-nc6": {
    name: { en: "Vienna with Nc6", zh: "维也纳Nc6" },
    description: { en: "Black mirrors with Nc6 — symmetrical and strategic.", zh: "黑方以Nc6对称——对称且富有战略性。" },
    plan: { en: "Both sides develop knights to the center. White aims to exploit the initiative with f4 or Bc4 ideas. A balanced, classical position where both sides have equal chances and clear development plans.", zh: "双方将马发展到中心。白方以f4或Bc4的想法利用先手。平衡的古典局面，双方机会均等，发展计划清晰。" },
  },
  // Catalan
  "open-catalan": {
    name: { en: "Open Catalan", zh: "开放卡塔兰" },
    description: { en: "Black takes on c4 — White's Bg2 pressures the queenside.", zh: "黑方在c4吃掉——白方Bg2对后翼施压。" },
    plan: { en: "As White, let Black take on c4 and recover it with Bg2's long diagonal pressure. The bishop on g2 becomes a monster, controlling the center and queenside. White gets a lasting positional advantage with pressure on b7 and d5.", zh: "执白方，让黑方在c4吃掉并以Bg2的长对角线压力夺回。g2上的象变成怪兽，控制中心和后翼。白方获得持久的阵地优势，对b7和d5施压。" },
  },
  "closed-catalan": {
    name: { en: "Closed Catalan", zh: "封闭卡塔兰" },
    description: { en: "Black keeps the center closed with Nbd7.", zh: "黑方以Nbd7保持封闭中心。" },
    plan: { en: "As White, build pressure on the queenside with the Bg2 and prepare e4 or b3. As Black, maintain a solid structure with Nbd7 and aim for c5 or e5 breaks. A deep positional battle with slow maneuvering.", zh: "执白方，以Bg2在后翼建立压力并准备e4或b3。执黑方，以Nbd7保持坚固阵型并瞄准c5或e5突破。深入的阵地对抗，缓慢机动。" },
  },
  // Benoni
  "modern-benoni": {
    name: { en: "Modern Benoni", zh: "现代贝诺尼" },
    description: { en: "e4 — the critical test with a strong center vs Black's activity.", zh: "e4——强大中心对黑方活跃的关键考验。" },
    plan: { en: "As Black, accept a space disadvantage in exchange for queenside counterplay with a6, b5, and activity on the c-file. White has a strong center but Black's pieces are active. A dynamic, unbalanced fight.", zh: "执黑方，接受空间劣势以换取后翼反击，包括a6、b5和c线的活动。白方有强大中心但黑方棋子活跃。充满活力的不平衡对抗。" },
  },
  "fianchetto-benoni": {
    name: { en: "Fianchetto Benoni", zh: "侧翼发展贝诺尼" },
    description: { en: "g3 — a quieter approach with long-term pressure.", zh: "g3——更安静的长期施压方式。" },
    plan: { en: "As White, fianchetto and maintain a flexible center. The Bg2 supports e4 and controls key central squares. As Black, use the c5 pawn to create queenside counterplay. A more strategic, positional approach.", zh: "执白方，侧翼发展并保持灵活中心。Bg2支持e4并控制关键中心格。执黑方，利用c5兵制造后翼反击。更具战略性的阵地下法。" },
  },
  // Philidor
  "philidor-main": {
    name: { en: "Philidor Main Line", zh: "菲利多尔主线" },
    description: { en: "Nf6 and Nbd7 — the classical setup.", zh: "Nf6和Nbd7——古典阵型。" },
    plan: { en: "As Black, build a solid fortress with d6, Nf6, Be7, O-O, and Nbd7. Prepare the f5 or d5 break when the time is right. Slightly cramped but rock-solid — ideal for patient players who like to grind.", zh: "执黑方，以d6、Nf6、Be7、O-O和Nbd7建立坚固堡垒。在适当时机准备f5或d5突破。略显拥挤但坚如磐石——适合喜欢慢磨的耐心棋手。" },
  },
  "hanham-philidor": {
    name: { en: "Hanham Philidor", zh: "汉纳姆菲利多尔" },
    description: { en: "Nd7 first — a more flexible move order.", zh: "先走Nd7——更灵活的走子顺序。" },
    plan: { en: "Develop Nd7 first to support e5 and keep options open for the king's knight. A more flexible version of the Philidor that avoids some of White's sharpest lines. Solid and reliable.", zh: "先发展Nd7以支撑e5并为王翼马保持选择余地。菲利多尔更灵活的版本，避开白方一些最激烈的变化。坚实可靠。" },
  },
  // Réti
  "reti-accepted": {
    name: { en: "Réti Accepted", zh: "列季接受" },
    description: { en: "e6 and classical development — rich strategic play.", zh: "e6和古典发展——丰富的战略性下法。" },
    plan: { en: "As White, use Nf3 and c4 to control the center from the flanks. Fianchetto with g3, Bg2 and transpose into favorable positions. A flexible, transpositional opening where understanding matters more than memorization.", zh: "执白方，以Nf3和c4从侧翼控制中心。以g3、Bg2侧翼发展并转化为有利局面。灵活的、富于转化的开局，理解比记忆更重要。" },
  },
  "reti-kia": {
    name: { en: "King's Indian Attack", zh: "王翼印度进攻" },
    description: { en: "g3 + Bg2 — a universal system for White.", zh: "g3 + Bg2——白方的万能体系。" },
    plan: { en: "Set up with g3, Bg2, d3, Nbd2, e4 — a universal system playable against almost anything. Aim for a kingside attack with e4-e5 and piece pressure. Safe, solid, and easy to play at any level.", zh: "以g3、Bg2、d3、Nbd2、e4布阵——几乎可以对付任何开局的万能体系。以e4-e5和子力压力瞄准王翼进攻。安全、坚实，在任何级别都易于下。" },
  },
};
