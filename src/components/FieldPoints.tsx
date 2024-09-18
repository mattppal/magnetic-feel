import React, { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTheme } from '@/components/theme-provider'

enum Shape {
    Point,
    Cube,
    Tetrahedron,
    Sphere
}

interface FieldPointsProps {
    shape: Shape;
    gridSize: number;
    pointSize: number;
    fieldStrength: number;
    fieldCenter: { x: number; y: number };
    paused: boolean;
    time: number;
    color: string;
    // Remove isDarkMode from props
}

const CYCLE_DURATION = 10; // Make sure this matches the value in TimeControlCard

const FieldPoints: React.FC<FieldPointsProps> = ({ shape, gridSize, pointSize, fieldStrength, fieldCenter, paused, time }) => {
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'
    const instancedMesh = useRef<THREE.InstancedMesh>(null!)
    const pointsRef = useRef<THREE.Points>(null!)

    const [positions, colors, originalPositions] = useMemo(() => {
        const positions = new Float32Array(gridSize * gridSize * 3)
        const colors = new Float32Array(gridSize * gridSize * 3)
        let i = 0
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                positions[i] = (x / (gridSize - 1) - 0.5) * 1.5
                positions[i + 1] = (y / (gridSize - 1) - 0.5) * 1.5
                positions[i + 2] = 0
                colors[i] = colors[i + 1] = colors[i + 2] = 1
                i += 3
            }
        }
        return [positions, colors, new Float32Array(positions)]
    }, [gridSize])

    const geometry = useMemo(() => {
        if (shape === Shape.Point) {
            const geometry = new THREE.BufferGeometry()
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
            return geometry
        } else {
            return shape === Shape.Cube
                ? new THREE.BoxGeometry(1, 1, 1)
                : shape === Shape.Tetrahedron
                    ? new THREE.TetrahedronGeometry(0.5)
                    : new THREE.SphereGeometry(0.5, 16, 16)
        }
    }, [shape, gridSize, positions, colors])

    const updatePositions = useCallback((currentTime: number) => {
        const object = shape === Shape.Point ? pointsRef.current : instancedMesh.current
        if (!object) return

        const positions = shape === Shape.Point
            ? (object.geometry.attributes.position.array as Float32Array)
            : new Float32Array(gridSize * gridSize * 3)

        for (let i = 0; i < positions.length; i += 3) {
            const originalX = originalPositions[i]
            const originalY = originalPositions[i + 1]
            const dx = originalX - fieldCenter.x
            const dy = originalY - fieldCenter.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const angle = Math.atan2(dy, dx)
            const offset = Math.sin(distance * 10 - (currentTime / CYCLE_DURATION) * Math.PI * 2) * fieldStrength * 0.5
            const newX = originalX + Math.cos(angle) * offset
            const newY = originalY + Math.sin(angle) * offset
            const newZ = Math.sin(distance * 5 - (currentTime / CYCLE_DURATION) * Math.PI * 2) * fieldStrength * 0.5

            if (shape === Shape.Point) {
                positions[i] = newX
                positions[i + 1] = newY
                positions[i + 2] = newZ
            } else {
                const matrix = new THREE.Matrix4()
                    .makeTranslation(newX, newY, newZ)
                    .scale(new THREE.Vector3(pointSize, pointSize, pointSize))
                    .multiply(new THREE.Matrix4().makeRotationX(currentTime / CYCLE_DURATION * Math.PI * 2))
                    .multiply(new THREE.Matrix4().makeRotationY(currentTime / CYCLE_DURATION * Math.PI))
                instancedMesh.current.setMatrixAt(i / 3, matrix)
            }
        }
        if (shape === Shape.Point) {
            object.geometry.attributes.position.needsUpdate = true
        } else {
            instancedMesh.current.instanceMatrix.needsUpdate = true
        }
    }, [shape, gridSize, pointSize, fieldStrength, fieldCenter, originalPositions])

    useFrame(() => {
        if (!paused) {
            updatePositions(time)
        }
    })

    // Update positions when time changes (for scrubbing)
    React.useEffect(() => {
        updatePositions(time)
    }, [time, updatePositions])

    const pointColor = isDarkMode ? 0xffffff : 0x000000
    if (shape === Shape.Point) {
        return (
            <points ref={pointsRef} geometry={geometry}>
                <pointsMaterial size={pointSize} color={pointColor} sizeAttenuation={false} />
            </points>
        )
    } else {
        return (
            <instancedMesh
                ref={instancedMesh}
                args={[geometry, undefined, gridSize * gridSize]}
                key={gridSize}
            >
                <meshPhongMaterial color={pointColor} />
            </instancedMesh>
        )
    }
}

export default FieldPoints