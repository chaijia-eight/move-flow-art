import { openings } from "@/data/openingTrees";
import { extractAllLines } from "@/lib/lineExtractor";
for (const o of openings) {
  console.log(o.id + ": " + extractAllLines(o).length);
}
