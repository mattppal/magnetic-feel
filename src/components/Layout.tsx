import React, { useState, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useTheme } from "@/components/theme-provider"
import FieldPoints from '@/components/FieldPoints'
import ControlCard from '@/components/ControlCard'
import { ModeToggle } from '@/components/mode-toggle'
// import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer.js'
import potrace from 'potrace'

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
            const traceData = await new Promise((resolve, reject) => {
                potrace.trace(imageData, {
                    turdSize: 2,
                    alphaMax: 1,
                    optCurve: true,
                    optolerance: 0.1,
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
    const [fieldStrength, setFieldStrength] = useState(0.07)
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
    return (

        <div className="min-h-screen bg-background text-foreground relative dark:bg-black">
            <Canvas
                ref={canvasRef}
                camera={{ position: [0, 0, 2], fov: 50 }}
                style={{ width: '100%', height: '100vh' }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <pointLight position={[10, 10, 10]} intensity={0.5} />
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
            <div className="absolute top-4 left-4 w-80">
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
            </div>
            <div className="absolute top-4 right-4">
                <ModeToggle />
            </div>
        </div>
    )
}

export default Layout