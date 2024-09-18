import React, { useState, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useTheme } from "@/components/theme-provider"
import FieldPoints from '@/components/FieldPoints'
import ControlCard from '@/components/ControlCard'
import { ModeToggle } from '@/components/mode-toggle'
import potrace from 'potrace'
import TimeControlCard from '@/components/TimeControlCard'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

const SVGExporter: React.FC<{ onExport: (exportFn: () => void) => void }> = ({ onExport }) => {
    const { scene, camera, gl } = useThree()

    const exportSVG = React.useCallback(async () => {
        const width = gl.domElement.width
        const height = gl.domElement.height

        // Render the scene to a canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) return

        gl.render(scene, camera)
        context.drawImage(gl.domElement, 0, 0, width, height)

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', width.toString())
        svg.setAttribute('height', height.toString())

        // Convert canvas to SVG paths
        const imageData = context.getImageData(0, 0, width, height)
        try {
            const tempCanvas = document.createElement('canvas')
            tempCanvas.width = width
            tempCanvas.height = height
            const tempContext = tempCanvas.getContext('2d')
            tempContext?.putImageData(imageData, 0, 0)
            const dataURL = tempCanvas.toDataURL()

            const traceData = await new Promise((resolve, reject) => {
                potrace.trace(dataURL, {
                    turdSize: 2,
                    alphaMax: 1,
                    optCurve: true,
                    optTolerance: 0.1,
                    threshold: 128,
                }, (err: Error | null, svg: string) => {
                    if (err) reject(err);
                    else resolve(svg);
                });
            });

            // Append the traced SVG paths to our SVG element
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = traceData as string;
            const paths = tempDiv.querySelector('svg')?.innerHTML;
            if (paths) {
                svg.innerHTML = paths;
            }

            // Convert SVG to string
            const serializer = new XMLSerializer()
            const svgString = serializer.serializeToString(svg)

            // Create a Blob from the SVG string
            const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
            const svgUrl = URL.createObjectURL(svgBlob)
            const downloadLink = document.createElement("a")
            downloadLink.href = svgUrl
            downloadLink.download = 'electric_field.svg'
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
        } catch (error) {
            console.error('Error tracing image:', error);
        }
    }, [scene, camera, gl])

    React.useEffect(() => {
        onExport(exportSVG)
    }, [exportSVG, onExport])

    return null
}

const Layout: React.FC = () => {
    const [shape, setShape] = useState(3)
    const [gridSize, setGridSize] = useState(100)
    const [pointSize, setPointSize] = useState(0.005)
    const [fieldStrength, setFieldStrength] = useState(0.2)
    const [fieldCenterX, setFieldCenterX] = useState(0)
    const [fieldCenterY, setFieldCenterY] = useState(0)
    const [paused, setPaused] = useState(false)
    const [time, setTime] = useState(0)
    const { theme } = useTheme()
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.style.backgroundColor = theme === 'dark' ? '#000000' : '#ffffff'
        }
    }, [theme])

    const [exportSVGFunction, setExportSVGFunction] = useState<(() => void) | null>(null)

    const handleExport = React.useCallback((exportFn: () => void) => {
        setExportSVGFunction(() => exportFn)
    }, [])
    useEffect(() => {
        console.log('Current theme:', theme);
    }, [theme]);
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative dark:bg-black">
            <Canvas
                ref={canvasRef}
                camera={{ position: [0, 0, 2], fov: 50 }}
                style={{ width: '100%', height: '100vh' }}
            >
                <ambientLight intensity={10} />
                <OrbitControls />
                <FieldPoints
                    shape={shape}
                    gridSize={gridSize}
                    pointSize={pointSize}
                    fieldStrength={fieldStrength}
                    fieldCenter={{ x: fieldCenterX, y: fieldCenterY }}
                    paused={paused}
                    time={time}
                    color={theme === 'dark' ? '#ffffff' : '#000000'}
                />
                <SVGExporter onExport={handleExport} />
            </Canvas>
            <motion.div
                className="absolute top-4 left-4 w-80"
                initial="hidden"
                animate="visible"
                variants={cardVariants}
            >
                <ControlCard
                    exportSVG={exportSVGFunction ?? (() => { })}
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
            <motion.div
                className="absolute bottom-4 left-4"
                initial="hidden"
                animate="visible"
                variants={cardVariants}
            >
                <TimeControlCard
                    paused={paused}
                    setPaused={setPaused}
                    time={time}
                    setTime={setTime}
                />
            </motion.div>
            <motion.div
                className="absolute bottom-4 right-4"
                initial="hidden"
                animate="visible"
                variants={cardVariants}
            >
                <Card className="glass-effect">
                    <CardContent className="p-4 flex items-center justify-center text-sm">
                        <p>
                            Made with ❤️ by <a href="https://x.com/mattppal" target="_blank">Matt</a>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
            <motion.div
                className="absolute top-4 right-4"
                initial="hidden"
                animate="visible"
                variants={cardVariants}
            >
                <ModeToggle />
            </motion.div>
        </div>
    )
}

export default Layout