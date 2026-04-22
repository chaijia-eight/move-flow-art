import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Settings as SettingsIcon, User } from "lucide-react";
import BlitzPuzzleCard from "@/components/BlitzPuzzleCard";
import { SEED_PUZZLES } from "@/data/seedPuzzles";

/**
 * Vertical-snap "For You" feed.
 * Mobile-first: full-bleed phone-shaped column.
 * Desktop: same column, centered on a dark backdrop (max-width 420px).
 */
export default function Home() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const puzzles = SEED_PUZZLES;

  // Track which puzzle is currently snapped into view.
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

  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      {/* Centered phone-shaped column */}
      <div className="relative w-full max-w-[420px] h-screen overflow-hidden border-x border-border/40">
        {/* Top tab bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none">
          <div className="flex gap-4 text-sm font-medium pointer-events-auto">
            <span className="text-foreground border-b-2 border-primary pb-0.5">For You</span>
            <span className="text-muted-foreground">Trending</span>
            <span className="text-muted-foreground">Following</span>
          </div>
        </div>

        {/* Snap scroller */}
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
                index={i}
                total={puzzles.length}
              />
            </div>
          ))}
        </div>

        {/* Bottom mobile nav (only inside the phone column) */}
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
