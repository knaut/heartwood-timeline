'use client'

import { useMemo, useRef, useEffect, useState } from 'react'
import type { SkillData } from './types'
import { normalizeSkillData } from './data'
import { BASE_RADIUS, RING_WIDTH, RING_GAP } from './constants'
import { Legend } from './Legend'
import { YearChart } from './YearChart'
import styles from './HeartWoodTimeline.module.css'

const { perspectiveWrapper, stackContainer } = styles

type HeartWoodTimelineProps = {
	data: SkillData
	skillOrder?: string[]
	opacityFloor?: number
	maxZDepth?: number
	tiltFactor?: number
	perspective?: number
	opacityCurve?: number
	dimmedOpacity?: number
	tiltBoundary?: number
	tiltFreezeRefs?: React.RefObject<Element>[]
}

export function HeartWoodTimeline({
	data,
	skillOrder,
	opacityFloor = 0.5,
	maxZDepth = 60,
	tiltFactor = 1.0,
	perspective = 1200,
	opacityCurve = 0.35,
	dimmedOpacity = 0.1,
	tiltBoundary = 100,
	tiltFreezeRefs = [],
}: HeartWoodTimelineProps) {
	const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

	const normalizedData = useMemo(
		() => normalizeSkillData(data, skillOrder),
		[data, skillOrder]
	)

	// compute canonical skill order for legend (same order as rings)
	const canonicalSkillOrder = useMemo(() => {
		if (!skillOrder || skillOrder.length === 0) {
			// fallback: extract unique skills and sort alphabetically
			const allSkills = new Set<string>()
			Object.values(data).forEach((yearEntries) => {
				yearEntries.forEach((entry) => allSkills.add(entry.skill))
			})
			return Array.from(allSkills).sort((a, b) => a.localeCompare(b))
		}
		return skillOrder
	}, [data, skillOrder])

	const stackRef = useRef<HTMLDivElement>(null)
	const legendRef = useRef<HTMLDivElement>(null)

	// calculate the largest SVG size needed across all years
	const maxSvgSize = useMemo(() => {
		let maxSize = 0
		normalizedData.forEach((yearData) => {
			const numRings = yearData.arcs.length
			const maxRadius = BASE_RADIUS + numRings * (RING_WIDTH + RING_GAP)
			const svgSize = maxRadius * 2 + 20
			if (svgSize > maxSize) {
				maxSize = svgSize
			}
		})
		return maxSize
	}, [normalizedData])

	const mostRecentIndex = normalizedData.length - 1
	const totalYears = normalizedData.length

	const handleMouseMove = (e: MouseEvent) => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
		if (!stackRef.current) return

		// check if cursor is over any freeze zone element
		const allFreezeRefs = [legendRef, ...tiltFreezeRefs]
		const isOverFreezeZone = allFreezeRefs.some(
			(ref) => ref.current && ref.current.contains(e.target as Node)
		)
		if (isOverFreezeZone) return

		const rect = stackRef.current.getBoundingClientRect()
		const centerX = rect.left + rect.width / 2
		const centerY = rect.top + rect.height / 2

		const normalizedX = (e.clientX - centerX) / (rect.width / 2)
		const normalizedY = (e.clientY - centerY) / (rect.height / 2)

		const tiltX = -normalizedY * 8 * tiltFactor
		const tiltY = normalizedX * 8 * tiltFactor

		// check viewport boundaries per-axis and freeze selectively
		const nearLeftOrRight = e.clientX < tiltBoundary || e.clientX > window.innerWidth - tiltBoundary
		const nearTopOrBottom = e.clientY < tiltBoundary || e.clientY > window.innerHeight - tiltBoundary

		if (!nearTopOrBottom) {
			stackRef.current.style.setProperty('--tilt-x', `${tiltX}deg`)
		}
		if (!nearLeftOrRight) {
			stackRef.current.style.setProperty('--tilt-y', `${tiltY}deg`)
		}
	}

	const handleMouseLeave = () => {
		if (!stackRef.current) return
		stackRef.current.style.setProperty('--tilt-x', '0deg')
		stackRef.current.style.setProperty('--tilt-y', '0deg')
	}

	// hoist mousemove listener to window to prevent jitter when cursor moves fast
	useEffect(() => {
		window.addEventListener('mousemove', handleMouseMove)
		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
		}
	}, [tiltFactor, tiltBoundary, tiltFreezeRefs])

	return (
		<>
			<Legend
				ref={legendRef}
				skills={canonicalSkillOrder}
				hoveredSkill={hoveredSkill}
				onHoverSkill={setHoveredSkill}
			/>
			<div className={perspectiveWrapper} style={{ perspective: `${perspective}px` }}>
				<div
					ref={stackRef}
					className={stackContainer}
					onMouseLeave={handleMouseLeave}
					style={{ width: maxSvgSize, height: maxSvgSize }}
				>
					{normalizedData.map((yearData, index) => {
						const yearOffset = mostRecentIndex - index
						const translateZ = -yearOffset * (maxZDepth / (totalYears - 1 || 1))
						const opacity = opacityFloor + (1 - opacityFloor) * Math.exp(-opacityCurve * yearOffset)

						return (
							<YearChart
								key={yearData.year}
								yearData={yearData}
								svgSize={maxSvgSize}
								hoveredSkill={hoveredSkill}
								dimmedOpacity={dimmedOpacity}
								style={{
									transform: `translateZ(${translateZ}px)`,
									opacity,
								}}
							/>
						)
					})}
				</div>
			</div>
		</>
	)
}
