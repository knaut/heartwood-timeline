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
 * 2. STABLE SKILL RING ORDERING ACROSS ALL YEARS
 *    Ring indices are assigned globally across the entire dataset, not per-year.
 *    The same skill always occupies the same ring index in every year.
 *    - With skillOrder: indices follow that explicit ordering
 *    - Without skillOrder: indices follow alphabetical order (backward compat)
 *
 * 3. UNIFORM RING COUNT
 *    Every year contains an arc for every skill in the "skill universe" (union
 *    of all skills across all years plus skillOrder). Missing skills are filled
 *    with [0, 0] duration, producing zero-length arcs (invisible but ring
 *    position held). This prevents ring index shifting when skills appear or
 *    disappear between years.
 *
 * 4. D3 COMPATIBILITY
 *    D3's data-binding model (selection.data()) is designed for arrays.
 *    Passing an array of arc descriptors to d3.arc() generators is the
 *    natural path. No conversion layer needed at render time.
 *
 * 5. PRE-COMPUTED ANGLES
 *    Month-to-radians conversion happens once during normalization, not on
 *    every render. The normalized structure stores startAngle/endAngle
 *    ready for D3's arc generator.
 *
 * 6. COLOR LOOKUP
 *    SKILL_COLORS remains a plain Record<string, string> for O(1) lookup.
 *    This is separate from the iteration structure because color lookup
 *    happens per-arc during rendering, not during data traversal.
 *
 * 7. MULTI-RANGE SUPPORT
 *    Skills with disjoint duration ranges produce multiple NormalizedSkillArc
 *    entries sharing the same ringIndex. Ring assignment is based on unique
 *    skill names, not individual arc segments. This ensures a skill with
 *    [[0,4],[6,8]] occupies one ring with two arc segments, not two rings.
 *
 * Alternative structures rejected:
 * - Map: Adds overhead without benefit; we don't need Map-specific features
 * - Set: Not applicable; we have key-value/indexed data, not unique items
 * - Object with year keys: Implicit iteration order, harder to test
 */

import type {
  SkillData,
  SkillEntry,
  DurationRange,
  NormalizedSkillArc,
  NormalizedYear,
  NormalizedSkillData,
  SkillColorMap,
} from './types';

import { isSingleDuration } from './types';

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
 * Normalizes a single duration range into an arc descriptor.
 *
 * @param skill - The skill name
 * @param range - The [startMonth, endMonth] tuple
 * @param ringIndex - The ring position (0 = innermost)
 * @param segmentIndex - Which segment this is for multi-range skills (0 for single-range)
 * @returns Normalized arc with pre-computed angles
 */
function normalizeRange(
  skill: string,
  range: DurationRange,
  ringIndex: number,
  segmentIndex: number
): NormalizedSkillArc {
  const [startMonth, endMonth] = range;

  return {
    skill,
    startAngle: monthToRadians(startMonth),
    endAngle: monthToRadians(endMonth),
    duration: range,
    ringIndex,
    segmentIndex,
  };
}

/**
 * Normalizes a skill entry into one or more arc descriptors.
 *
 * For single-range durations: returns an array with one arc.
 * For multi-range durations: returns an array with one arc per range,
 * all sharing the same ringIndex but with incrementing segmentIndex.
 *
 * @param entry - Raw skill entry from props
 * @param ringIndex - The ring position (0 = innermost)
 * @returns Array of normalized arcs (length 1 for single-range, N for N ranges)
 */
function normalizeSkillEntry(
  entry: SkillEntry,
  ringIndex: number
): NormalizedSkillArc[] {
  const { skill, duration } = entry;

  if (isSingleDuration(duration)) {
    // Single range: one arc
    return [normalizeRange(skill, duration, ringIndex, 0)];
  }

  // Multiple ranges: one arc per range, same ringIndex, incrementing segmentIndex
  return duration.map((range, segmentIndex) =>
    normalizeRange(skill, range, ringIndex, segmentIndex)
  );
}

/**
 * Builds a skill-to-ring-index mapping from an ordered skill list.
 *
 * @param orderedSkills - Skills in desired ring order (index 0 = innermost ring)
 * @returns Map from skill name to ring index
 */
function buildRingIndexMap(orderedSkills: string[]): Map<string, number> {
  const map = new Map<string, number>();
  orderedSkills.forEach((skill, index) => {
    map.set(skill, index);
  });
  return map;
}

/**
 * Computes the canonical skill ordering for ring assignment.
 *
 * When skillOrder is provided:
 * - Skills in skillOrder come first, in that order
 * - Skills NOT in skillOrder are appended, sorted alphabetically
 *
 * When skillOrder is omitted:
 * - All skills are sorted alphabetically (backward compatible)
 *
 * @param skillUniverse - Set of all skills across the dataset
 * @param skillOrder - Optional explicit ordering for skills
 * @returns Array of skill names in canonical ring order
 */
function computeCanonicalSkillOrder(
  skillUniverse: Set<string>,
  skillOrder?: string[]
): string[] {
  if (!skillOrder || skillOrder.length === 0) {
    // Fallback: alphabetical ordering (original behavior)
    return Array.from(skillUniverse).sort((a, b) => a.localeCompare(b));
  }

  const skillOrderSet = new Set(skillOrder);
  const orderedSkills: string[] = [];

  // First: skills from skillOrder that exist in the universe
  for (const skill of skillOrder) {
    if (skillUniverse.has(skill)) {
      orderedSkills.push(skill);
    }
  }

  // Second: skills in universe but NOT in skillOrder, sorted alphabetically
  const unorderedSkills = Array.from(skillUniverse)
    .filter((skill) => !skillOrderSet.has(skill))
    .sort((a, b) => a.localeCompare(b));

  return [...orderedSkills, ...unorderedSkills];
}

/**
 * Collects the complete skill universe from raw data and optional skillOrder.
 *
 * The universe is the union of:
 * - All skills mentioned in any year of raw data
 * - All skills in skillOrder (if provided)
 *
 * @param raw - Raw skill data
 * @param skillOrder - Optional skill order array
 * @returns Set of all skill names
 */
function collectSkillUniverse(raw: SkillData, skillOrder?: string[]): Set<string> {
  const universe = new Set<string>();

  // Add all skills from raw data
  for (const yearEntries of Object.values(raw)) {
    for (const entry of yearEntries) {
      universe.add(entry.skill);
    }
  }

  // Add all skills from skillOrder (in case any are not yet used in data)
  if (skillOrder) {
    for (const skill of skillOrder) {
      universe.add(skill);
    }
  }

  return universe;
}

/**
 * Fills missing skills for a year with zero-duration entries.
 *
 * For each skill in the universe that is not present in the year's entries,
 * synthesizes a SkillEntry with duration [0, 0]. This produces a zero-length
 * arc (startAngle === endAngle === 0) that D3 renders as invisible, but the
 * ring position is held consistent across all years.
 *
 * @param entries - Original skill entries for the year
 * @param skillUniverse - Set of all skills that must be represented
 * @returns Entries augmented with zero-duration placeholders for missing skills
 */
function fillMissingSkills(
  entries: SkillEntry[],
  skillUniverse: Set<string>
): SkillEntry[] {
  const presentSkills = new Set(entries.map((e) => e.skill));
  const filledEntries = [...entries];

  for (const skill of skillUniverse) {
    if (!presentSkills.has(skill)) {
      filledEntries.push({
        skill,
        duration: [0, 0] as DurationRange,
      });
    }
  }

  return filledEntries;
}

/**
 * Normalizes a year's skill entries into arc descriptors with consistent ring ordering.
 *
 * Ring assignment is determined by the ringIndexMap, which provides stable
 * ring positions across all years. Skills not in the map fall back to
 * appending at the end (should not happen if fillMissingSkills was called).
 *
 * @param year - The year string (e.g., "2023")
 * @param entries - Skill entries for this year (after filling missing skills)
 * @param ringIndexMap - Map from skill name to ring index
 * @returns Normalized year structure
 */
function normalizeYear(
  year: string,
  entries: SkillEntry[],
  ringIndexMap: Map<string, number>
): NormalizedYear {
  // Sort entries by their ring index for consistent arc ordering in output
  const sortedEntries = [...entries].sort((a, b) => {
    const aIndex = ringIndexMap.get(a.skill) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = ringIndexMap.get(b.skill) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });

  // Flatten: each entry may produce 1+ arcs (multi-range support)
  // Ring index comes from the map, not array position
  const arcs = sortedEntries.flatMap((entry) => {
    const ringIndex = ringIndexMap.get(entry.skill) ?? sortedEntries.indexOf(entry);
    return normalizeSkillEntry(entry, ringIndex);
  });

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
 * - Ring indices are consistent across ALL years (same skill = same ring)
 * - Every year contains arcs for every skill in the dataset (missing skills
 *   are filled with [0, 0] duration, producing invisible zero-length arcs)
 * - Angles are pre-computed in radians for D3
 * - Multi-range skills produce multiple arcs at the same ring index
 *
 * Ring ordering behavior:
 * - When skillOrder is provided: skills in that array get ring indices by
 *   their position (index 0 = innermost). Skills not in skillOrder are
 *   appended after, sorted alphabetically among themselves.
 * - When skillOrder is omitted: all skills are sorted alphabetically
 *   (backward compatible with original behavior).
 *
 * @param raw - The SkillData prop from the component
 * @param skillOrder - Optional array specifying desired ring order (index 0 = innermost)
 * @returns Normalized data structure ready for rendering
 *
 * @example
 * ```ts
 * // With explicit skill ordering
 * const skillOrder = ['CSS', 'HTML', 'Javascript', 'React'];
 * const data = useMemo(
 *   () => normalizeSkillData(props.data, skillOrder),
 *   [props.data, skillOrder]
 * );
 *
 * // Without skill ordering (alphabetical, backward compatible)
 * const data = useMemo(() => normalizeSkillData(props.data), [props.data]);
 * ```
 */
export function normalizeSkillData(
  raw: SkillData,
  skillOrder?: string[]
): NormalizedSkillData {
  // 1. Collect the complete skill universe
  const skillUniverse = collectSkillUniverse(raw, skillOrder);

  // 2. Compute canonical skill ordering for ring assignment
  const canonicalOrder = computeCanonicalSkillOrder(skillUniverse, skillOrder);

  // 3. Build ring index map for O(1) lookup during normalization
  const ringIndexMap = buildRingIndexMap(canonicalOrder);

  // 4. Sort years chronologically (ascending)
  const years = Object.keys(raw);
  const sortedYears = years.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  // 5. Normalize each year, filling missing skills with [0, 0]
  return sortedYears.map((year) => {
    const filledEntries = fillMissingSkills(raw[year], skillUniverse);
    return normalizeYear(year, filledEntries, ringIndexMap);
  });
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
