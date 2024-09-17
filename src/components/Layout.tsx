import React, { useState } from 'react'
import { motion } from 'framer-motion'
import MainCard from './MainCard'
import ControlCard from './ControlCard'
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

const Layout: React.FC = () => {
	const [shape, setShape] = useState(0)
	const [gridSize, setGridSize] = useState(100)
	const [pointSize, setPointSize] = useState(0.01)
	const [fieldStrength, setFieldStrength] = useState(0.02)
	const [fieldCenterX, setFieldCenterX] = useState(0)
	const [fieldCenterY, setFieldCenterY] = useState(0)
	const [paused, setPaused] = useState(false)
	const [time, setTime] = useState(0)

	return (
		<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
			<div className="min-h-screen bg-background text-foreground p-8">
				<div className="absolute top-4 right-4">
					<ModeToggle />
				</div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-full"
				>
					<MainCard
						className="lg:col-span-2 h-[calc(100vh-4rem)] shadow-lg"
						shape={shape}
						gridSize={gridSize}
						pointSize={pointSize}
						fieldStrength={fieldStrength}
						fieldCenter={[fieldCenterX, fieldCenterY, 0]}
						paused={paused}
						time={time}
					/>
					<ControlCard
						shape={shape}
						setShape={setShape}
						gridSize={gridSize}
						setGridSize={setGridSize}
						pointSize={pointSize}
						setPointSize={setPointSize}
						fieldStrength={fieldStrength}
						setFieldStrength={setFieldStrength}
						fieldCenterX={fieldCenterX}
						setFieldCenterX={setFieldCenterX}
						fieldCenterY={fieldCenterY}
						setFieldCenterY={setFieldCenterY}
						paused={paused}
						setPaused={setPaused}
						time={time}
						setTime={setTime}
					/>
				</motion.div>
			</div>
		</ThemeProvider>
	)
}

export default Layout