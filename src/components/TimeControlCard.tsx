import React, { useEffect, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { motion } from 'framer-motion'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface TimeControlCardProps {
    paused: boolean;
    setPaused: (paused: boolean) => void;
    time: number;
    setTime: (time: number) => void;
}

const CYCLE_DURATION = 10; // Duration of one complete cycle in seconds

const TimeControlCard: React.FC<TimeControlCardProps> = ({
    paused, setPaused, time, setTime
}) => {
    const lastUpdateTimeRef = useRef(Date.now());
    const accumulatedTimeRef = useRef(0);

    useEffect(() => {
        let animationFrameId: number;

        const updateTime = () => {
            const now = Date.now();
            const deltaTime = (now - lastUpdateTimeRef.current) / 1000; // Convert to seconds
            lastUpdateTimeRef.current = now;

            if (!paused) {
                accumulatedTimeRef.current += deltaTime;
                setTime(prevTime => (prevTime + deltaTime) % CYCLE_DURATION);
            }

            animationFrameId = requestAnimationFrame(updateTime);
        };

        animationFrameId = requestAnimationFrame(updateTime);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [paused, setTime]);

    const handleSliderChange = (value: number) => {
        setTime(value);
        accumulatedTimeRef.current = value;
        lastUpdateTimeRef.current = Date.now();
    };

    const handlePauseResume = () => {
        if (paused) {
            lastUpdateTimeRef.current = Date.now();
        }
        setPaused(!paused);
    };

    return (
        <Card className="glass-effect w-80">
            <CardContent className="p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-3"
                >
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Time: {time.toFixed(1)}</label>
                        <Slider
                            min={0}
                            max={CYCLE_DURATION}
                            step={0.1}
                            value={[time]}
                            onValueChange={([value]) => handleSliderChange(value)}
                        />
                    </div>
                    <Button onClick={handlePauseResume} className="w-full">
                        {paused ? 'Resume' : 'Pause'}
                    </Button>
                </motion.div>
            </CardContent>
        </Card>
    )
}

export default TimeControlCard