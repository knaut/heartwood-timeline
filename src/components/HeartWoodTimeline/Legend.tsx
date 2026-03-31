'use client';

import Image from 'next/image';
import styles from './Legend.module.css';

// Icon imports
import cssIcon from './icons/css.svg';
import htmlIcon from './icons/html.svg';
import jsIcon from './icons/js.svg';
import nodeIcon from './icons/node.svg';
import reactIcon from './icons/react.svg';
import scssIcon from './icons/scss.svg';
import storybookIcon from './icons/storybook.svg';
import svelteIcon from './icons/svelte.svg';
import tsIcon from './icons/ts.svg';
import aiIcon from './icons/ai-icon.png';

// ============================================================================
// Icon Mapping
// ============================================================================

const SKILL_ICONS: Record<string, string> = {
  'CSS': cssIcon,
  'HTML': htmlIcon,
  'Javascript': jsIcon,
  'NodeJS': nodeIcon,
  'React': reactIcon,
  'SCSS': scssIcon,
  'Storybook': storybookIcon,
  'Svelte': svelteIcon,
  'TypeScript': tsIcon,
  'AI/Agentic': aiIcon,
};

// ============================================================================
// Component Props
// ============================================================================

type LegendProps = {
  skills: string[];
  hoveredSkill: string | null;
  onHoverSkill: (skill: string | null) => void;
};

// ============================================================================
// Component
// ============================================================================

export function Legend({ skills, hoveredSkill, onHoverSkill }: LegendProps) {
  return (
    <div className={styles.legend} onMouseLeave={() => onHoverSkill(null)}>
      {skills.map((skill) => {
        const icon = SKILL_ICONS[skill];
        const isHovered = hoveredSkill === skill;

        return (
          <div
            key={skill}
            className={`${styles.legendItem} ${isHovered ? styles.hovered : ''}`}
            onMouseEnter={() => onHoverSkill(skill)}
          >
            {icon && (
              <Image
                src={icon}
                alt={`${skill} icon`}
                width={16}
                height={16}
                className={styles.icon}
              />
            )}
            <span className={styles.skillName}>{skill}</span>
          </div>
        );
      })}
    </div>
  );
}
