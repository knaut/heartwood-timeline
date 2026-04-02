import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { HeartWoodTimeline } from '../components/HeartWoodTimeline/HeartWoodTimeline';
import type { SkillData } from '../components/HeartWoodTimeline/types';

// Example data and skill order from page.tsx
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
];

const exampleData: SkillData = {
  '2026': [
    { skill: 'CSS', duration: [0, 4] },
    { skill: 'HTML', duration: [0, 4] },
    { skill: 'Javascript', duration: [0, 4] },
    { skill: 'NodeJS', duration: [0, 4] },
    { skill: 'React', duration: [0, 4] },
    { skill: 'Storybook', duration: [0, 4] },
    { skill: 'TypeScript', duration: [0, 4] },
    { skill: 'AI/Agentic', duration: [0, 4] },
  ],
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

const meta = {
  title: 'Components/HeartWoodTimeline',
  component: HeartWoodTimeline,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    opacityFloor: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Minimum opacity for the oldest year layers',
    },
    maxZDepth: {
      control: { type: 'range', min: 0, max: 300, step: 10 },
      description: 'Maximum Z-axis depth in pixels for the 3D stack',
    },
    tiltFactor: {
      control: { type: 'range', min: 0, max: 5, step: 0.1 },
      description: 'Multiplier for perspective tilt sensitivity',
    },
    perspective: {
      control: { type: 'range', min: 200, max: 3000, step: 100 },
      description: 'CSS perspective value in pixels for 3D effect',
    },
    opacityCurve: {
      control: { type: 'range', min: 0, max: 2, step: 0.05 },
      description: 'Exponential curve factor for opacity falloff across years',
    },
    dimmedOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Opacity for skills when another skill is hovered in the legend',
    },
    tiltBoundary: {
      control: { type: 'range', min: 0, max: 300, step: 10 },
      description: 'Distance in pixels from viewport edge where tilt is frozen',
    },
    // Structural props excluded from controls
    data: {
      table: { disable: true },
    },
    skillOrder: {
      table: { disable: true },
    },
    tiltFreezeRefs: {
      table: { disable: true },
    },
  },
  args: {
    data: exampleData,
    skillOrder: skillOrder,
  },
} satisfies Meta<typeof HeartWoodTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with component's default prop values
export const Default: Story = {
  args: {
    opacityFloor: 0.5,
    maxZDepth: 60,
    tiltFactor: 1.0,
    perspective: 1200,
    opacityCurve: 0.35,
    dimmedOpacity: 0.1,
    tiltBoundary: 100,
  },
};
