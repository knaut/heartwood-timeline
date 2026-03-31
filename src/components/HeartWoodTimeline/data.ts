/**
 * HeartWood Timeline — Data Layer
 *
 * ARCHITECTURAL DECISION: Array-based normalized structure
 *
 * The internal representation uses Array<NormalizedYear>, where each year
 * contains Array<NormalizedSkillArc>. This choice is driven by:
 *
 * 1. ITERATION ORDER GUARANTEES
 *    Years must render in chronological order. While ES2015+ Objects iterate
 *    integer-like string keys in numeric order, an explicit sorted array
 *    makes the contract visible and debuggable. No implicit engine behavior.
 *
 * 2. STABLE SKILL RING ORDERING
 *    Skills within a year are sorted alphabetically during normalization.
 *    This guarantees consistent ring positions across renders regardless of
 *    the order skills appear in the raw data. Determinism over magic.
 *
 * 3. D3 COMPATIBILITY
 *    D3's data-binding model (selection.data()) is designed for arrays.
 *    Passing an array of arc descriptors to d3.arc() generators is the
 *    natural path. No conversion layer needed at render time.
 *
 * 4. PRE-COMPUTED ANGLES
 *    Month-to-radians conversion happens once during normalization, not on
 *    every render. The normalized structure stores startAngle/endAngle
 *    ready for D3's arc generator.
 *
 * 5. COLOR LOOKUP
 *    SKILL_COLORS remains a plain Record<string, string> for O(1) lookup.
 *    This is separate from the iteration structure because color lookup
 *    happens per-arc during rendering, not during data traversal.
 *
 * Alternative structures rejected:
 * - Map: Adds overhead without benefit; we don't need Map-specific features
 * - Set: Not applicable; we have key-value/indexed data, not unique items
 * - Object with year keys: Implicit iteration order, harder to test
 */

import type {
  SkillData,
  SkillEntry,
  NormalizedSkillArc,
  NormalizedYear,
  NormalizedSkillData,
  SkillColorMap,
} from './types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Brand colors for each skill.
 *
 * These values come from official brand guidelines or common community usage.
 * Unknown skills should fall back to a neutral color in the rendering layer.
 */
export const SKILL_COLORS: SkillColorMap = {
  CSS: '#2965f1',
  SCSS: '#cd669a',
  HTML: '#f06529',
  Javascript: '#f0db4f',
  React: '#61dafb',
  Svelte: '#ff3e00',
  TypeScript: '#3178c6',
  NodeJS: '#8bc500',
  Storybook: '#ff4785',
  'AI/Agentic': '#000000',
} as const;

/**
 * Fallback color for skills not in the color map.
 */
export const DEFAULT_SKILL_COLOR = '#888888';

/**
 * Total months in a year, used for angle calculations.
 */
const MONTHS_IN_YEAR = 12;

/**
 * Full circle in radians.
 */
const TAU = 2 * Math.PI;

// ============================================================================
// Normalization Functions
// ============================================================================

/**
 * Converts a month index (0-12) to radians.
 *
 * Month 0 (January) = 0 radians (12 o'clock, top of circle)
 * Month 3 (April) = PI/2 radians (3 o'clock)
 * Month 6 (July) = PI radians (6 o'clock)
 * Month 9 (October) = 3*PI/2 radians (9 o'clock)
 * Month 12 (end of December) = 2*PI radians (full circle)
 *
 * @param month - Month index where 0 = January start, 12 = December end
 * @returns Angle in radians, clockwise from top
 */
function monthToRadians(month: number): number {
  return (month / MONTHS_IN_YEAR) * TAU;
}

/**
 * Normalizes a single skill entry into an arc descriptor.
 *
 * @param entry - Raw skill entry from props
 * @param ringIndex - The ring position (0 = innermost)
 * @returns Normalized arc with pre-computed angles
 */
function normalizeSkillEntry(
  entry: SkillEntry,
  ringIndex: number
): NormalizedSkillArc {
  const [startMonth, endMonth] = entry.duration;

  return {
    skill: entry.skill,
    startAngle: monthToRadians(startMonth),
    endAngle: monthToRadians(endMonth),
    duration: entry.duration,
    ringIndex,
  };
}

/**
 * Normalizes a year's skill entries into sorted arc descriptors.
 *
 * Skills are sorted alphabetically to ensure consistent ring ordering
 * across renders, regardless of input order.
 *
 * @param year - The year string (e.g., "2023")
 * @param entries - Raw skill entries for this year
 * @returns Normalized year structure
 */
function normalizeYear(year: string, entries: SkillEntry[]): NormalizedYear {
  // Sort skills alphabetically for deterministic ring ordering
  const sortedEntries = [...entries].sort((a, b) =>
    a.skill.localeCompare(b.skill)
  );

  const arcs = sortedEntries.map((entry, index) =>
    normalizeSkillEntry(entry, index)
  );

  return {
    year,
    yearNumeric: parseInt(year, 10),
    arcs,
  };
}

/**
 * Normalizes raw SkillData props into the internal representation.
 *
 * This is the single entry point for data transformation. Call it once
 * when props change (e.g., in useMemo), not on every render.
 *
 * Guarantees:
 * - Years are sorted chronologically (ascending)
 * - Skills within each year are sorted alphabetically
 * - Angles are pre-computed in radians for D3
 * - Ring indices are assigned based on alphabetical skill order
 *
 * @param raw - The SkillData prop from the component
 * @returns Normalized data structure ready for rendering
 *
 * @example
 * ```ts
 * const data = useMemo(() => normalizeSkillData(props.data), [props.data]);
 * ```
 */
export function normalizeSkillData(raw: SkillData): NormalizedSkillData {
  const years = Object.keys(raw);

  // Sort years chronologically (ascending)
  const sortedYears = years.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  return sortedYears.map((year) => normalizeYear(year, raw[year]));
}

/**
 * Retrieves the color for a skill, with fallback for unknown skills.
 *
 * @param skill - The skill name to look up
 * @returns Hex color string
 */
export function getSkillColor(skill: string): string {
  return SKILL_COLORS[skill] ?? DEFAULT_SKILL_COLOR;
}
