/**
 * HeartWood Timeline — Type Definitions
 *
 * Public types (component props) and internal normalized types for the
 * skill/year visualization.
 */

// ============================================================================
// Public Types (Component Props)
// ============================================================================

/**
 * A single duration range: [startMonth, endMonth].
 *
 * Month indices where 0 = January start, 12 = December end.
 * Example: [7, 12] means August through December.
 */
export type DurationRange = [startMonth: number, endMonth: number];

/**
 * Duration can be a single range or multiple disjoint ranges.
 *
 * Single range: [0, 12] — skill used all year
 * Multiple ranges: [[0, 4], [6, 8]] — skill used Jan-Apr and Jul-Aug
 *
 * Type guard functions are provided to distinguish these at runtime:
 * - isSingleDuration()
 * - isMultiDuration()
 */
export type Duration = DurationRange | DurationRange[];

/**
 * A single skill entry as provided in the raw prop data.
 *
 * @property skill - The skill name (e.g., "React", "TypeScript")
 * @property duration - Single range or array of ranges for disjoint usage periods
 */
export type SkillEntry = {
  skill: string;
  duration: Duration;
};

/**
 * The raw skill data prop shape.
 *
 * Keys are year strings (e.g., "2023"), values are arrays of skill entries
 * for that year.
 */
export type SkillData = {
  [year: string]: SkillEntry[];
};

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard: is this duration a single range [number, number]?
 *
 * Distinguishes [0, 12] from [[0, 4], [6, 8]].
 * A single range has exactly 2 elements, both numbers.
 */
export function isSingleDuration(duration: Duration): duration is DurationRange {
  return (
    duration.length === 2 &&
    typeof duration[0] === 'number' &&
    typeof duration[1] === 'number'
  );
}

/**
 * Type guard: is this duration multiple ranges?
 *
 * If not a single duration, it must be an array of ranges.
 */
export function isMultiDuration(duration: Duration): duration is DurationRange[] {
  return !isSingleDuration(duration);
}

// ============================================================================
// Internal Normalized Types
// ============================================================================

/**
 * A normalized skill arc ready for D3 rendering.
 *
 * Pre-computes angular values from the duration tuple so the render path
 * does not repeat conversion math.
 *
 * Angles are in radians, measured clockwise from 12 o'clock (top of circle).
 * - 0 radians = 12 o'clock (month 0 / January)
 * - PI/2 radians = 3 o'clock (month 3 / April)
 * - PI radians = 6 o'clock (month 6 / July)
 * - 3*PI/2 radians = 9 o'clock (month 9 / October)
 *
 * MULTI-RANGE NOTE: A skill with disjoint usage periods produces multiple
 * NormalizedSkillArc entries. They share the same skill name and ringIndex
 * (same radial band, same color) but have different angles. Use segmentIndex
 * to distinguish them for React keys.
 */
export type NormalizedSkillArc = {
  /** The skill name, used for color lookup and accessibility labels */
  skill: string;

  /** Start angle in radians (0 = top, clockwise) */
  startAngle: number;

  /** End angle in radians (0 = top, clockwise) */
  endAngle: number;

  /** Original duration range for this segment (for tooltip/label display) */
  duration: DurationRange;

  /** Ring index within the year (0 = innermost ring) */
  ringIndex: number;

  /**
   * Segment index for multi-range skills.
   *
   * 0 = first (or only) segment, 1 = second segment, etc.
   * Used to generate unique React keys: `${skill}-${segmentIndex}`
   */
  segmentIndex: number;
};

/**
 * A normalized year containing all its skill arcs, sorted and indexed.
 */
export type NormalizedYear = {
  /** The year as a string (e.g., "2023") */
  year: string;

  /** The year as a number for sorting/comparison */
  yearNumeric: number;

  /**
   * Skill arcs for this year.
   *
   * Sorted alphabetically by skill name. Multiple arcs for the same skill
   * (multi-range durations) are grouped together, each with incrementing
   * segmentIndex but the same ringIndex.
   */
  arcs: NormalizedSkillArc[];
};

/**
 * The fully normalized data structure for rendering.
 *
 * An array of years, sorted chronologically (ascending), each containing
 * its skill arcs. This structure is optimized for:
 * - Ordered iteration (years render in chronological sequence)
 * - D3 data binding (arrays map naturally to selections)
 * - Stable ring ordering (skills sorted alphabetically within each year)
 *
 * NOTE: Years are sorted ascending (oldest first). For the stacked Z-depth
 * layout, the rendering layer must reverse this or apply z-index in
 * descending year order (most recent on top).
 */
export type NormalizedSkillData = NormalizedYear[];

// ============================================================================
// Color Map Type
// ============================================================================

/**
 * Maps skill names to their brand hex colors.
 *
 * Using Record<string, string> for O(1) lookup by skill name.
 * Unknown skills should fall back to a default color in the rendering layer.
 */
export type SkillColorMap = Record<string, string>;
