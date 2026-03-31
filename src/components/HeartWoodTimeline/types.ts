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
 * A single skill entry as provided in the raw prop data.
 *
 * @property skill - The skill name (e.g., "React", "TypeScript")
 * @property duration - Tuple of [startMonth, endMonth] where 0 = Jan, 12 = Dec
 */
export type SkillEntry = {
  skill: string;
  duration: [startMonth: number, endMonth: number];
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
 */
export type NormalizedSkillArc = {
  /** The skill name, used for color lookup and accessibility labels */
  skill: string;

  /** Start angle in radians (0 = top, clockwise) */
  startAngle: number;

  /** End angle in radians (0 = top, clockwise) */
  endAngle: number;

  /** Original duration tuple, retained for tooltip/label display */
  duration: [startMonth: number, endMonth: number];

  /** Ring index within the year (0 = innermost ring) */
  ringIndex: number;
};

/**
 * A normalized year containing all its skill arcs, sorted and indexed.
 */
export type NormalizedYear = {
  /** The year as a string (e.g., "2023") */
  year: string;

  /** The year as a number for sorting/comparison */
  yearNumeric: number;

  /** Skill arcs for this year, sorted alphabetically by skill name */
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
