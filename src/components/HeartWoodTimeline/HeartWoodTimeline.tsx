'use client';

import { useMemo, useRef } from 'react';
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
  skillOrder?: string[];
  opacityFloor?: number;
  maxZDepth?: number;
  tiltFactor?: number;
  perspective?: number;
  opacityCurve?: number;
};

// ============================================================================
// Component
// ============================================================================

export function HeartWoodTimeline({
  data,
  skillOrder,
  opacityFloor = 0.5,
  maxZDepth = 60,
  tiltFactor = 1.0,
  perspective = 1200,
  opacityCurve = 0.35,
}: HeartWoodTimelineProps) {
  // Normalize data once when props change
  const normalizedData = useMemo(
    () => normalizeSkillData(data, skillOrder),
    [data, skillOrder]
  );

  // Ref for tilt control
  const stackRef = useRef<HTMLDivElement>(null);

  // Calculate the largest SVG size needed across all years
  const maxSvgSize = useMemo(() => {
    let maxSize = 0;
    normalizedData.forEach((yearData) => {
      const numRings = yearData.arcs.length;
      const maxRadius = BASE_RADIUS + numRings * (RING_WIDTH + RING_GAP);
      const svgSize = maxRadius * 2 + 20;
      if (svgSize > maxSize) {
        maxSize = svgSize;
      }
    });
    return maxSize;
  }, [normalizedData]);

  // Most recent year index (highest year number is at the end of the sorted array)
  const mostRecentIndex = normalizedData.length - 1;

  // Total years for Z-depth calculation
  const totalYears = normalizedData.length;

  // Mouse move handler for perspective tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stackRef.current) return;

    const rect = stackRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalized offset from center (-1 to 1)
    const normalizedX = (e.clientX - centerX) / (rect.width / 2);
    const normalizedY = (e.clientY - centerY) / (rect.height / 2);

    // Calculate tilt angles
    const tiltX = -normalizedY * 8 * tiltFactor;
    const tiltY = normalizedX * 8 * tiltFactor;

    // Apply tilt via CSS custom properties
    stackRef.current.style.setProperty('--tilt-x', `${tiltX}deg`);
    stackRef.current.style.setProperty('--tilt-y', `${tiltY}deg`);
  };

  // Mouse leave handler to reset tilt
  const handleMouseLeave = () => {
    if (!stackRef.current) return;
    stackRef.current.style.setProperty('--tilt-x', '0deg');
    stackRef.current.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <div className={styles.perspectiveWrapper} style={{ perspective: `${perspective}px` }}>
      <div
        ref={stackRef}
        className={styles.stackContainer}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width: maxSvgSize, height: maxSvgSize }}
      >
        {normalizedData.map((yearData, index) => {
          const yearOffset = mostRecentIndex - index;
          const translateZ = -yearOffset * (maxZDepth / (totalYears - 1 || 1));
          const opacity = opacityFloor + (1 - opacityFloor) * Math.exp(-opacityCurve * yearOffset);

          return (
            <YearChart
              key={yearData.year}
              yearData={yearData}
              svgSize={maxSvgSize}
              style={{
                transform: `translateZ(${translateZ}px)`,
                opacity,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Year Chart Subcomponent
// ============================================================================

type YearChartProps = {
  yearData: NormalizedYear;
  svgSize: number;
  style?: React.CSSProperties;
};

function YearChart({ yearData, svgSize, style }: YearChartProps) {
  return (
    <div className={styles.yearLayer} style={style}>
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
            <SkillArc key={`${arcData.skill}-${arcData.segmentIndex}`} arcData={arcData} />
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
