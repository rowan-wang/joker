import React, { useRef, useEffect } from 'react';

interface ScoreBoxProps {
    label: string;
    value: number;
    color: 'blue' | 'red';
    showFire: boolean;
}

const ScoreBox: React.FC<ScoreBoxProps> = ({ label, value, color, showFire }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: { 
            x: number, y: number, 
            vx: number, vy: number, 
            life: number, size: number, 
            color: string 
        }[] = [];
        
        let suctionParticles: {
            x: number, y: number,
            targetX: number, targetY: number,
            speed: number, size: number,
            color: string
        }[] = [];

        let animationId: number;

        const resize = () => {
            if (containerRef.current && canvas) {
                const rect = containerRef.current.getBoundingClientRect();
                // Make canvas larger to accommodate effects
                canvas.width = rect.width + 100;
                canvas.height = rect.height + 100;
            }
        };
        resize();

        const createFireParticle = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const centerX = canvas.width / 2;
            const bottomY = canvas.height / 2 + rect.height / 2;
            
            const x = centerX + (Math.random() - 0.5) * rect.width;
            const y = bottomY; 
            
            const hue = color === 'blue' ? 200 + Math.random() * 40 : 0 + Math.random() * 40;
            
            particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -1 - Math.random() * 3,
                life: 1.0,
                size: Math.random() * 6 + 2,
                color: `hsla(${hue}, 100%, 60%,`
            });
        };

        const createSuctionParticle = () => {
            // Create particles from outside moving IN
            const angle = Math.random() * Math.PI * 2;
            const distance = 60 + Math.random() * 40;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            const startX = centerX + Math.cos(angle) * distance;
            const startY = centerY + Math.sin(angle) * distance;

            const hue = color === 'blue' ? 200 : 0;

            suctionParticles.push({
                x: startX,
                y: startY,
                targetX: centerX,
                targetY: centerY,
                speed: 2 + Math.random() * 3,
                size: 2 + Math.random() * 3,
                color: `hsla(${hue}, 100%, 70%, 0.8)`
            });
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (showFire) {
                // Fire Effect
                for (let i = 0; i < 3; i++) createFireParticle();
                
                // Suction Effect (Water/Energy being sucked in)
                if (Math.random() > 0.5) createSuctionParticle();
            }

            // Update and draw Fire particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.03;
                p.size *= 0.95;

                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `${p.color} ${p.life})`;
                ctx.fill();
            }

            // Update and draw Suction particles
            for (let i = suctionParticles.length - 1; i >= 0; i--) {
                const p = suctionParticles[i];
                
                const dx = p.targetX - p.x;
                const dy = p.targetY - p.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 5) {
                    suctionParticles.splice(i, 1);
                    continue;
                }

                const angle = Math.atan2(dy, dx);
                p.x += Math.cos(angle) * p.speed;
                p.y += Math.sin(angle) * p.speed;
                p.speed *= 1.05; // Accelerate

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }

            if (showFire || particles.length > 0 || suctionParticles.length > 0) {
                animationId = requestAnimationFrame(animate);
            }
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [showFire, color]);

    const bgColorClass = color === 'blue' ? 'bg-[#0099FF]' : 'bg-[#FF4D4D]';
    const borderColorClass = color === 'blue' ? 'border-blue-300' : 'border-red-300';
    const shadowColorClass = color === 'blue' ? 'shadow-[0_4px_0_#005588]' : 'shadow-[0_4px_0_#990000]';
    const textColorClass = color === 'blue' ? 'text-blue-200' : 'text-red-200';

    return (
        <div className="relative flex items-center justify-center" ref={containerRef}>
            <canvas 
                ref={canvasRef} 
                className="absolute pointer-events-none z-0"
                style={{ top: '-50px', left: '-50px' }} // Adjust based on canvas padding in resize
            />
            <div className={`
                relative z-10
                ${bgColorClass} px-4 py-2 rounded-lg text-white border-2 ${borderColorClass} ${shadowColorClass}
                transform transition-all duration-100
                min-w-[100px] text-center flex items-center justify-center
                text-3xl font-black
                ${showFire ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.5)]' : ''}
            `}>
                <span className={`${textColorClass} text-sm mr-1 drop-shadow-none`}>{label}</span> {value}
            </div>
        </div>
    );
};

export default ScoreBox;
