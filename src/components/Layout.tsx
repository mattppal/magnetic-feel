import React, { useState, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ThemeProvider, useTheme } from "@/components/theme-provider"
import FieldPoints from '@/components/FieldPoints'
import ControlCard from '@/components/ControlCard'
import { ModeToggle } from '@/components/mode-toggle'
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer'

const SVGExporter: React.FC<{ onExport: () => void }> = ({ onExport }) => {
    const { scene, camera, gl } = useThree()

    const exportSVG = React.useCallback(() => {
        const width = gl.domElement.clientWidth
        const height = gl.domElement.clientHeight

        const rendererSVG = new SVGRenderer()
        rendererSVG.setSize(width, height)
        rendererSVG.render(scene, camera)

        // Export logic
        const XMLS = new XMLSerializer()
        let svgfile = XMLS.serializeToString(rendererSVG.domElement)

        // Remove width, height, and viewBox attributes from the SVG
        svgfile = svgfile.replace(/(width|height|viewBox)="[^"]*"/g, '')
        svgfile = svgfile.replace(/style="background-color: rgb\(255, 255, 255\);"/g, '')

        const svgBlob = new Blob([svgfile], { type: "image/svg+xml;charset=utf-8" })
        const svgUrl = URL.createObjectURL(svgBlob)
        const downloadLink = document.createElement("a")
        downloadLink.href = svgUrl
        downloadLink.download = 'electric_field.svg'
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
    }, [scene, camera, gl])

    React.useEffect(() => {
        onExport(exportSVG)
    }, [exportSVG, onExport])

    return null
}

const Layout: React.FC = () => {
    const [shape, setShape] = useState(0)
    const [gridSize, setGridSize] = useState(100)
    const [pointSize, setPointSize] = useState(0.01)
    const [fieldStrength, setFieldStrength] = useState(0.02)
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