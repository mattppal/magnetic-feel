import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { motion } from 'framer-motion'
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface ControlCardProps {
    shape: number;
    setShape: (shape: number) => void;
    gridSize: number;
    setGridSize: (size: number) => void;
    pointSize: number;
    setPointSize: (size: number) => void;
    fieldStrength: number;
    setFieldStrength: (strength: number) => void;
    fieldCenterX: number;
    setFieldCenterX: (x: number) => void;
    fieldCenterY: number;
    setFieldCenterY: (y: number) => void;
    paused: boolean;
    setPaused: (paused: boolean) => void;
    time: number;
    setTime: (time: number) => void;
    exportSVG: () => void;
}


const ControlCard: React.FC<ControlCardProps> = ({ exportSVG,
    shape, setShape, gridSize, setGridSize, pointSize, setPointSize,
    fieldStrength, setFieldStrength, fieldCenterX, setFieldCenterX,
    fieldCenterY, setFieldCenterY
}) => {

    return (
        <Card className="glass-effect">
            <CardContent className="p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-3"
                >
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Shape</label>
                        <Select value={shape.toString()} onValueChange={(value) => setShape(Number(value))}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Point</SelectItem>
                                <SelectItem value="1">Square</SelectItem>
                                <SelectItem value="2">Triangle</SelectItem>
                                <SelectItem value="3">Sphere</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Grid Size: {gridSize}</label>
                        <Slider min={50} max={200} step={1} value={[gridSize]} onValueChange={([value]) => setGridSize(value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Point Size: {pointSize.toFixed(3)}</label>
                        <Slider
                            min={0.001}
                            max={0.009}
                            step={0.001}
                            value={[pointSize]}
                            onValueChange={([value]) => {
                                const newValue = Math.max(0.001, Math.min(0.1, value));
                                setPointSize(newValue);
                            }}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Field Strength: {fieldStrength.toFixed(3)}</label>
                        <Slider min={0.000} max={0.5} step={0.01} value={[fieldStrength]} onValueChange={([value]) => setFieldStrength(value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Field Center X: {fieldCenterX.toFixed(2)}</label>
                        <Slider min={-1} max={1} step={0.01} value={[fieldCenterX]} onValueChange={([value]) => setFieldCenterX(value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Field Center Y: {fieldCenterY.toFixed(2)}</label>
                        <Slider min={-1} max={1} step={0.01} value={[fieldCenterY]} onValueChange={([value]) => setFieldCenterY(value)} />
                    </div>
                    <Button onClick={exportSVG} className="w-full mt-2">
                        Export SVG
                    </Button>
                </motion.div>
            </CardContent>
        </Card>
    )
}

export default ControlCard