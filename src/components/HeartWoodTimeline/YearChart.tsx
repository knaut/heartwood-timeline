'use client'

import type { NormalizedYear } from './types'
import { SkillArc } from './SkillArc'
import styles from './HeartWoodTimeline.module.css'

const { yearLayer, yearLabel, svg } = styles

type YearChartProps = {
	yearData: NormalizedYear
	svgSize: number
	hoveredSkill: string | null
	dimmedOpacity: number
	style?: React.CSSProperties
}

export function YearChart({
	yearData,
	svgSize,
	hoveredSkill,
	dimmedOpacity,
	style,
}: YearChartProps) {
	return (
		<div className={yearLayer} style={style}>
			<h2 className={yearLabel}>{yearData.year}</h2>
			<svg
				width={svgSize}
				height={svgSize}
				viewBox={`0 0 ${svgSize} ${svgSize}`}
				className={svg}
			>
				<g transform={`translate(${svgSize / 2}, ${svgSize / 2})`}>
					{yearData.arcs.map((arcData) => {
						// compute per-arc opacity based on hover state
						let arcOpacity: number | undefined
						if (hoveredSkill !== null) {
							arcOpacity = arcData.skill === hoveredSkill ? 1 : dimmedOpacity
						}

						return (
							<SkillArc
								key={`${arcData.skill}-${arcData.segmentIndex}`}
								arcData={arcData}
								opacity={arcOpacity}
							/>
						)
					})}
				</g>
			</svg>
		</div>
	)
}
