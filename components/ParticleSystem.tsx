import React, { useEffect, useRef } from 'react';

interface ParticleSystemProps {
    isActive: boolean;
    type?: 'fire' | 'confetti' | 'sparks';
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ isActive, type = 'sparks' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isActive || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: any[] = [];
        
        const createParticle = () => {
            const x = Math.random() * canvas.width;
            const y = canvas.height + 10;
            const speed = Math.random() * 10 + 5;
            const angle = Math.random() * Math.PI / 4 + (Math.PI * 3/8); // Upwards mostly
            const size = Math.random() * 5 + 2;
            const color = type === 'fire' 
                ? `hsl(${Math.random() * 40 + 10}, 100%, 50%)` // Orange/Red
                : type === 'confetti'
                ? `hsl(${Math.random() * 360}, 100%, 50%)` // Rainbow
                : `hsl(${Math.random() * 60 + 200}, 100%, 70%)`; // Blue/White sparks

            particles.push({ x, y, speed, angle, size, color, life: 100 });
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (particles.length < 200) {
                createParticle();
                createParticle();
            }

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += Math.cos(p.angle) * (p.speed / 2); // Add some drift
                p.y -= Math.sin(p.angle) * p.speed;
                p.life--;
                p.speed *= 0.98; // Gravity/Drag
                
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                if (p.life <= 0 || p.y < 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }

            if (isActive) {
                requestAnimationFrame(animate);
            }
        };

        const animId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animId);
    }, [isActive, type]);

    if (!isActive) return null;

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 pointer-events-none z-[60]"
        />
    );
};

export default ParticleSystem;
