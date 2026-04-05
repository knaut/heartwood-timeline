'use client'

import { forwardRef } from 'react'
import Image from 'next/image'
import styles from './Legend.module.css'

const { legend, legendItem, hovered, icon, skillName } = styles

import cssIcon from './icons/css.svg'
import htmlIcon from './icons/html.svg'
import jsIcon from './icons/js.svg'
import nodeIcon from './icons/node.svg'
import reactIcon from './icons/react.svg'
import scssIcon from './icons/scss.svg'
import storybookIcon from './icons/storybook.svg'
import svelteIcon from './icons/svelte.svg'
import tsIcon from './icons/ts.svg'
import aiIcon from './icons/ai-icon.png'
import type { StaticImageData } from 'next/image'

const SKILL_ICONS: Record<string, string | StaticImageData> = {
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
}

type LegendProps = {
    skills: string[]
    hoveredSkill: string | null
    onHoverSkill: (skill: string | null) => void
}

export const Legend = forwardRef<HTMLDivElement, LegendProps>(
    function Legend({ skills, hoveredSkill, onHoverSkill }, ref) {
        return (
            <div ref={ref} className={legend} onMouseLeave={() => onHoverSkill(null)}>
                {skills.map((skill) => {
                    const iconSrc = SKILL_ICONS[skill]
                    const isHovered = hoveredSkill === skill

                    return (
                        <div
                            key={skill}
                            className={`${legendItem} ${isHovered ? hovered : ''}`}
                            onMouseEnter={() => onHoverSkill(skill)}
                        >
                            {iconSrc && (
                                <Image
                                    src={iconSrc}
                                    alt={`${skill} icon`}
                                    width={16}
                                    height={16}
                                    className={icon}
                                />
                            )}
                            <span className={skillName}>{skill}</span>
                        </div>
                    )
                })}
            </div>
        )
    }
)
