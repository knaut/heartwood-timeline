'use client';

import { useMemo } from 'react';
import { arc } from 'd3-shape';
import type { SkillData, NormalizedYear, NormalizedSkillArc } from './types';
import { normalizeSkillData, getSkillColor } from './data';
import styles from './HeartWoodTimeline.module.css';

// ============================================================================
// Arc Geometry Constants
// ============================================================================

/**
 * Base radius for the innermost ring in pixels.
 * This creates breathing room from the center point.
 */
const BASE_RADIUS = 40;

/**
 * Width of each skill ring in pixels.
 */
const RING_WIDTH = 20;

/**
 * Gap between adjacent rings in pixels.
 * Creates visual separation between skills.
 */
const RING_GAP = 12;

// ============================================================================
// Component Props
// ============================================================================

type HeartWoodTimelineProps = {
  data: SkillData;
};

// ============================================================================
// Component
// ============================================================================

export function HeartWoodTimeline({ data }: HeartWoodTimelineProps) {
  // Normalize data once when props change
  const normalizedData = useMemo(() => normalizeSkillData(data), [data]);

  return (
    <div className={styles.container}>
      {normalizedData.map((yearData) => (
        <YearChart key={yearData.year} yearData={yearData} />
      ))}
    </div>
  );
}

// ============================================================================
// Year Chart Subcomponent
// ============================================================================

type YearChartProps = {
  yearData: NormalizedYear;
};

function YearChart({ yearData }: YearChartProps) {
  // Calculate dimensions based on the number of rings
  const numRings = yearData.arcs.length;
  const maxRadius = BASE_RADIUS + numRings * (RING_WIDTH + RING_GAP);
  const svgSize = maxRadius * 2 + 20; // Add padding

  return (
    <div className={styles.yearContainer}>
      <h2 className={styles.yearLabel}>{yearData.year}</h2>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className={styles.svg}
      >
        {/* Center the visualization */}
        <g transform={`translate(${svgSize / 2}, ${svgSize / 2})`}>
          {yearData.arcs.map((arcData) => (
            <SkillArc key={arcData.skill} arcData={arcData} />
          ))}
        </g>
      </svg>
    </div>
  );
}

// ============================================================================
// Skill Arc Subcomponent
// ============================================================================

type SkillArcProps = {
  arcData: NormalizedSkillArc;
};

function SkillArc({ arcData }: SkillArcProps) {
  // Calculate radii based on ring index
  const innerRadius = BASE_RADIUS + arcData.ringIndex * (RING_WIDTH + RING_GAP);
  const outerRadius = innerRadius + RING_WIDTH;

  // Create D3 arc generator
  const arcGenerator = arc();

  // Generate the path data
  const pathData = arcGenerator({
    innerRadius,
    outerRadius,
    startAngle: arcData.startAngle,
    endAngle: arcData.endAngle,
  });

  // Get the color for this skill
  const fillColor = getSkillColor(arcData.skill);

  return (
    <path
      d={pathData || undefined}
      fill={fillColor}
      className={styles.arc}
      data-skill={arcData.skill}
    />
  );
}
