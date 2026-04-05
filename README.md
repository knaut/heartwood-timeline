# Heartwood Timeline
This repo is a visualization of my skillset over time. Inspired by tree rings, the idea is to show individual skill durations (i.e. usage) in a given year, expressed as nested radial arcs. We can investigate the evolution of my skillset over time as we go further back in the past.

## Goals
An exportable React component that can be used in other React/Next applications. The repo should also contain its own Storybook where we can explore the visualization based on different settings.

Additionally, explore multi-agentic workflow and tooling. We are using multi-agent orchestration in a tight prompt-and-report pipeline to produce this work. As the repo progresses, so should our tooling.

## Prior Art
Heartwood is based off a prior repo, [HeartwoodVisualize](https://github.com/knaut/HeartwoodVisualize), which made its way to my professional website. At the time, there were many unexplored avenues. How far can we go with an agentic tooling? Since I've already written this repo myself, it's a good A/B candidate.

## How to use
Clone the repo, and then run `npm i` to install. `npm run dev` to run the local application, and `npm run storybook` to explore the Storybook instance locally.

You can also play with the configurable props, such as tilt factor and z-depth, on the [Storybook Deployment](https://knaut.github.io/heartwood-timeline/)

<img width="1084" height="927" alt="Screenshot 2026-04-04 at 7 49 04 PM" src="https://github.com/user-attachments/assets/83dd787c-b355-4916-8155-66ff4369d885" />
