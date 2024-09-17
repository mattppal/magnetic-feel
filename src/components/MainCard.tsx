import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import FieldPoints from '@/components/FieldPoints'
import { useTheme } from "next-themes"

interface MainCardProps {
    className?: string;
    shape: number;
    gridSize: number;
    pointSize: number;
    fieldStrength: number;
    fieldCenter: [number, number, number];
    paused: boolean;
    time: number;
}

const MainCard: React.FC<MainCardProps> = ({ className, ...props }) => {
    const { theme } = useTheme()

    return (
        <Card className={className}>
            <CardContent className="p-0 aspect-video h-full">
                <Canvas camera={{ position: [0, 0, 2], fov: 75 }}>
                    <color attach="background" args={[theme === 'dark' ? '#1a1a1a' : '#ffffff']} />
                    <ambientLight />
                    <pointLight position={[10, 10, 10]} />
                    <OrbitControls />
                    <FieldPoints {...props} isDarkMode={theme === 'dark'} />
                </Canvas>
            </CardContent>
        </Card>
    )
}

export default MainCard