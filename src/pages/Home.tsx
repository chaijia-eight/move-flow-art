import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Settings as SettingsIcon, User, Flame } from "lucide-react";
import BlitzPuzzleCard from "@/components/BlitzPuzzleCard";
import RewardToast, { type RewardEvent } from "@/components/RewardToast";
import { loadFeed, logInteraction, type FeedItem } from "@/lib/feedLoader";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";

export default function Home() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [puzzles, setPuzzles] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState<RewardEvent | null>(null);
  const rewardSeqRef = useRef(0);

  const { user } = useAuth();
  const { awardSolve, currentStreak } = useProgress();

  // Load personalized feed once user is known.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadFeed(user?.id ?? null).then((items) => {
      if (cancelled) return;
      setPuzzles(items);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Track active puzzle via scroll position.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onScroll = () => {
      const cardHeight = scroller.clientHeight;
      if (!cardHeight) return;
      const idx = Math.round(scroller.scrollTop / cardHeight);
      setActiveIndex((prev) => (prev === idx ? prev : idx));
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  const advance = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const next = Math.min(activeIndex + 1, puzzles.length - 1);
    scroller.scrollTo({ top: next * scroller.clientHeight, behavior: "smooth" });
  };

  const handleSolved = async (puzzle: FeedItem) => {
    // Difficulty 1-10 → 5-50 XP, plus 5 bonus when personalized.
    const xp = puzzle.difficulty * 5 + (puzzle.personalized ? 5 : 0);
    const result = await awardSolve(xp);
    rewardSeqRef.current += 1;
    const ev: RewardEvent = {
      id: rewardSeqRef.current,
      xp: result.xp,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      streakBumped: result.streakBumped,
      streak: result.streakBumped ? currentStreak + 1 : currentStreak,
    };
    setReward(ev);
    setTimeout(() => {
      setReward((curr) => (curr?.id === ev.id ? null : curr));
    }, 2400);

    if (user) {
      await logInteraction({
        userId: user.id,
        contentId: puzzle.id,
        isSeed: puzzle.isSeed,
        interactionType: "solved",
        xpEarned: xp,
        weaknessTagTargeted: puzzle.weaknessTag,
        wasPersonalized: puzzle.personalized,
      });
    }
  };

  const handleFailed = async (puzzle: FeedItem) => {
    if (user) {
      await logInteraction({
        userId: user.id,
        contentId: puzzle.id,
        isSeed: puzzle.isSeed,
        interactionType: "failed",
        xpEarned: 0,
        weaknessTagTargeted: puzzle.weaknessTag,
        wasPersonalized: puzzle.personalized,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[420px] h-screen overflow-hidden border-x border-border/40">
        {/* Top tab bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none">
          <div className="flex gap-4 text-sm font-medium pointer-events-auto">
            <span className="text-foreground border-b-2 border-primary pb-0.5">For You</span>
            <span className="text-muted-foreground">Trending</span>
            <span className="text-muted-foreground">Following</span>
          </div>
          {currentStreak > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold text-orange-400 pointer-events-auto">
              <Flame className="w-3.5 h-3.5" />
              {currentStreak}
            </div>
          )}
        </div>

        <RewardToast event={reward} />

        {/* Snap scroller */}
        {loading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Loading your feed…
          </div>
        ) : puzzles.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm px-6 text-center">
            No puzzles available yet.
          </div>
        ) : (
          <div
            ref={scrollerRef}
            className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {puzzles.map((puzzle, i) => (
              <div key={puzzle.id} className="h-screen w-full">
                <BlitzPuzzleCard
                  puzzle={puzzle}
                  isActive={i === activeIndex}
                  onAdvance={advance}
                  onSolved={handleSolved}
                  onFailed={handleFailed}
                  index={i}
                  total={puzzles.length}
                />
              </div>
            ))}
          </div>
        )}

        {/* Bottom mobile nav */}
        <div className="absolute bottom-0 inset-x-0 z-20 h-14 bg-background/90 backdrop-blur-md border-t border-border flex items-center justify-around">
          <button className="flex flex-col items-center gap-0.5 text-primary text-xs font-medium">
            <span className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">▶</span>
            Feed
          </button>
          <Link
            to="/create"
            className="flex flex-col items-center gap-0.5 text-muted-foreground text-xs hover:text-foreground"
          >
            <Plus className="w-5 h-5" />
            Create
          </Link>
          <Link
            to="/me"
            className="flex flex-col items-center gap-0.5 text-muted-foreground text-xs hover:text-foreground"
          >
            <User className="w-5 h-5" />
            Me
          </Link>
          <Link
            to="/settings"
            className="flex flex-col items-center gap-0.5 text-muted-foreground text-xs hover:text-foreground"
          >
            <SettingsIcon className="w-5 h-5" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
