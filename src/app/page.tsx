import { HeartWoodTimeline } from "@/components/HeartWoodTimeline";
import type { SkillData } from "@/components/HeartWoodTimeline";
import styles from "./page.module.css";

const skillOrder = [
  'CSS',
  'HTML',
  'Javascript',
  'NodeJS',
  'SCSS',
  'React',
  'Storybook',
  'TypeScript',
  'Svelte',
  'AI/Agentic'
]

const exampleData: SkillData = {
  '2025': [
    { skill: 'CSS', duration: [0, 12] },
    { skill: 'HTML', duration: [0, 12] },
    { skill: 'Javascript', duration: [0, 12] },
    { skill: 'NodeJS', duration: [0, 12] },
    { skill: 'React', duration: [0, 12] },
    { skill: 'Storybook', duration: [0, 12] },
    { skill: 'TypeScript', duration: [0, 12] },
    { skill: 'AI/Agentic', duration: [0, 12] },
  ],
  '2024': [
    { skill: 'CSS', duration: [0, 8] },
    { skill: 'HTML', duration: [0, 8] },
    { skill: 'Javascript', duration: [0, 8] },
    { skill: 'SCSS', duration: [0, 5] },
    { skill: 'NodeJS', duration: [0, 8] },
    { skill: 'React', duration: [0, 5] },
    { skill: 'Storybook', duration: [[0, 4], [5, 8]] },
    { skill: 'Svelte', duration: [[0, 5], [6, 8]] },
    { skill: 'TypeScript', duration: [[0, 5], [6, 8]] },
    { skill: 'AI/Agentic', duration: [10, 12] },
  ],
  '2023': [
    { skill: 'CSS', duration: [0, 12] },
    { skill: 'HTML', duration: [0, 12] },
    { skill: 'Javascript', duration: [0, 12] },
    { skill: 'SCSS', duration: [0, 8] },
    { skill: 'NodeJS', duration: [7, 12] },
    { skill: 'React', duration: [0, 11] },
    { skill: 'Storybook', duration: [0, 6] },
    { skill: 'Svelte', duration: [8, 11] },
    { skill: 'TypeScript', duration: [7, 12] },
  ],
  '2022': [
    { skill: 'CSS', duration: [0, 12] },
    { skill: 'HTML', duration: [0, 12] },
    { skill: 'Javascript', duration: [0, 12] },
    { skill: 'SCSS', duration: [0, 7] },
    { skill: 'NodeJS', duration: [0, 12] },
    { skill: 'React', duration: [0, 11] },
    { skill: 'Storybook', duration: [7, 12] },
  ],
  '2021': [
    { skill: 'CSS', duration: [0, 12] },
    { skill: 'HTML', duration: [0, 12] },
    { skill: 'Javascript', duration: [0, 12] },
    { skill: 'SCSS', duration: [0, 12] },
    { skill: 'NodeJS', duration: [0, 12] },
    { skill: 'React', duration: [0, 12] },   
  ]
};

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>Heartwood Timeline</h1>
      <div className={styles.timelineContainer}>
        <HeartWoodTimeline
          data={exampleData}
          skillOrder={skillOrder} 
          opacityFloor={0.1}
          maxZDepth={120}
          tiltFactor={3}
          perspective={800}
          opacityCurve={0.8}
        />
      </div>
    </main>
  );
}
