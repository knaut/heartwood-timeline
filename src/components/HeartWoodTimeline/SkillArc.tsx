'use client'

import { arc } from 'd3-shape'
import type { NormalizedSkillArc } from './types'
import { getSkillColor } from './data'
import { BASE_RADIUS, RING_WIDTH, RING_GAP } from './constants'
import styles from './HeartWoodTimeline.module.css'

const { arc: arcClass } = styles

type SkillArcProps = {
	arcData: NormalizedSkillArc
	opacity?: number
}

export function SkillArc({ arcData, opacity }: SkillArcProps) {
	const innerRadius = BASE_RADIUS + arcData.ringIndex * (RING_WIDTH + RING_GAP)
	const outerRadius = innerRadius + RING_WIDTH

	const arcGenerator = arc()

	const pathData = arcGenerator({
		innerRadius,
		outerRadius,
		startAngle: arcData.startAngle,
		endAngle: arcData.endAngle,
	})

	const fillColor = getSkillColor(arcData.skill)

	return (
		<path
			d={pathData || undefined}
			fill={fillColor}
			className={arcClass}
			data-skill={arcData.skill}
			opacity={opacity}
		/>
	)
}
