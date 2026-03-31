import { HeartWoodTimeline } from "@/components/HeartWoodTimeline";
import type { SkillData } from "@/components/HeartWoodTimeline";
import styles from "./page.module.css";

const exampleData: SkillData = {
  "2023": [
    { skill: "CSS", duration: [0, 12] },
    { skill: "HTML", duration: [0, 12] },
    { skill: "Javascript", duration: [0, 12] },
    { skill: "SCSS", duration: [0, 8] },
    { skill: "NodeJS", duration: [7, 12] },
    { skill: "React", duration: [0, 11] },
    { skill: "Storybook", duration: [0, 6] },
    { skill: "Svelte", duration: [8, 11] },
    { skill: "TypeScript", duration: [7, 12] },
  ],
};

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>Heartwood Timeline</h1>
      <div className={styles.timelineContainer}>
        <HeartWoodTimeline data={exampleData} />
      </div>
    </main>
  );
}
