import { StreakWidgets } from "@/components/streak-widgets";

export const metadata = { title: "Streak · Quiz Duel" };

export default function StreakPage() {
  return (
    <div className="space-y-8 py-10 sm:py-14">
      <div className="max-w-2xl space-y-3">
        <h1 className="text-[32px] leading-[1.15] tracking-tight sm:text-[40px]">Streak</h1>
        <p className="text-body-lg text-muted-foreground">
          Study a little every day. Each day you answer duel questions, review flashcards, practise with Raj or make a study set
          keeps your streak going, and Raj notices.
        </p>
      </div>
      <StreakWidgets />
    </div>
  );
}
