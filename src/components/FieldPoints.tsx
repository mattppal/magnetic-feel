import React, { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

enum Shape {
    Point,
    Square,
    Triangle,
    Sphere
}

interface FieldPointsProps {
    shape: Shape;
    gridSize: number;
    pointSize: number;
    fieldStrength: number;
    fieldCenter: [number, number, number];
    paused: boolean;
    time: number;
    isDarkMode: boolean;
}

const FieldPoints: React.FC<FieldPointsProps> = ({ shape, gridSize, pointSize, fieldStrength, fieldCenter, paused, time, isDarkMode }) => {
    const instancedMesh = useRef<THREE.InstancedMesh>(null!)
    const pointsRef = useRef<THREE.Points>(null!)

    const [positions, colors, originalPositions] = useMemo(() => {
        const positions = new Float32Array(gridSize * gridSize * 3)
        const colors = new Float32Array(gridSize * gridSize * 3)
        let i = 0
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                positions[i] = (x / gridSize - 0.5) * 2
                positions[i + 1] = (y / gridSize - 0.5) * 2
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
            return shape === Shape.Square
                ? new THREE.PlaneGeometry(1, 1)
                : shape === Shape.Triangle
                    ? new THREE.CircleGeometry(0.5, 3)
                    : new THREE.CircleGeometry(0.5, 32)
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
            const dx = originalX - fieldCenter[0]
            const dy = originalY - fieldCenter[1]
            const distance = Math.sqrt(dx * dx + dy * dy)
            const angle = Math.atan2(dy, dx)
            const offset = Math.sin(distance * 10 - currentTime * 2) * fieldStrength
            const newX = originalX + Math.cos(angle) * offset
            const newY = originalY + Math.sin(angle) * offset
            const newZ = Math.sin(distance * 5 - currentTime) * fieldStrength * 0.5

            if (shape === Shape.Point) {
                positions[i] = newX
                positions[i + 1] = newY
                positions[i + 2] = newZ
            } else {
                const matrix = new THREE.Matrix4()
                    .makeTranslation(newX, newY, newZ)
                    .scale(new THREE.Vector3(pointSize, pointSize, pointSize))
                instancedMesh.current.setMatrixAt(i / 3, matrix)
            }
        }

        if (shape === Shape.Point) {
            object.geometry.attributes.position.needsUpdate = true
        } else {
            instancedMesh.current.instanceMatrix.needsUpdate = true
        }
    }, [shape, gridSize, pointSize, fieldStrength, fieldCenter, originalPositions])

    useFrame((state) => {
        if (!paused) {
            updatePositions(state.clock.getElapsedTime())
        }
    })

    // Update positions when time changes (for scrubbing)
    React.useEffect(() => {
        updatePositions(time)
    }, [time, updatePositions])

    const pointColor = isDarkMode ? 'white' : 'black'

    if (shape === Shape.Point) {
        return (
            <points ref={pointsRef} geometry={geometry}>
                <pointsMaterial size={pointSize} color={pointColor} />
            </points>
        )
    } else {
        return (
            <instancedMesh
                ref={instancedMesh}
                args={[geometry, undefined, gridSize * gridSize]}
                key={gridSize}
            >
                <meshBasicMaterial color={pointColor} side={THREE.DoubleSide} />
            </instancedMesh>
        )
    }
}

export default FieldPoints