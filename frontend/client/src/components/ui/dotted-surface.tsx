import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type DottedSurfaceProps = Omit<React.ComponentProps<"div">, "ref">;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
    const { theme } = useTheme();

    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        particles: THREE.Points[];
        animationId: number;
        count: number;
    } | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const SEPARATION = 100;
        const AMOUNTX = 50;
        const AMOUNTY = 50;

        // Scene setup
        const scene = new THREE.Scene();
        // scene.fog = new THREE.Fog(0xffffff, 2000, 10000);

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            1,
            10000,
        );
        camera.position.set(0, 500, 2000);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);

        containerRef.current.appendChild(renderer.domElement);

        // Create particles
        const positions: number[] = [];
        const colors: number[] = [];

        const geometry = new THREE.BufferGeometry();

        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                const y = 0; // Will be animated
                const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

                positions.push(x, y, z);

                // Use a static color or theme based color. 
                // For SynapStore's Emerald theme, we can use a soft emerald/slate color.
                // Or respect the 'theme' prop if provided or system theme.
                // Let's use a subtle gray/green.
                // If theme is 'dark', use lighter dots.
                if (theme === 'dark') {
                    colors.push(0.6, 0.6, 0.6);
                } else {
                    // Emerald-500: #10b981 -> r=16/255, g=185/255, b=129/255
                    // Using normalized 0-1 range
                    colors.push(0.06, 0.72, 0.5);
                }
            }
        }

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3),
        );
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

        // Create circle texture
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        if (context) {
            context.fillStyle = 'white';
            context.beginPath();
            context.arc(16, 16, 16, 0, 2 * Math.PI);
            context.fill();
        }
        const circleTexture = new THREE.CanvasTexture(canvas);

        // Create material
        const material = new THREE.PointsMaterial({
            size: 15,
            vertexColors: true,
            map: circleTexture,
            alphaTest: 0.5,
            transparent: true,
            sizeAttenuation: true,
        });

        // Create points object
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        let count = 0;

        // Animation function
        const animate = () => {
            const animationId = requestAnimationFrame(animate);
            if (sceneRef.current) sceneRef.current.animationId = animationId;

            const positionAttribute = geometry.attributes.position;
            const positions = positionAttribute.array as Float32Array;

            let i = 0;
            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    const index = i * 3;

                    // Animate Y position with sine waves
                    positions[index + 1] =
                        Math.sin((ix + count) * 0.3) * 50 +
                        Math.sin((iy + count) * 0.5) * 50;

                    i++;
                }
            }

            positionAttribute.needsUpdate = true;
            renderer.render(scene, camera);
            count += 0.1;
        };

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener("resize", handleResize);

        // Start animation
        animate();

        // Store references
        sceneRef.current = {
            scene,
            camera,
            renderer,
            particles: [points],
            animationId: 0,
            count,
        };

        // Cleanup function
        return () => {
            window.removeEventListener("resize", handleResize);

            if (sceneRef.current) {
                cancelAnimationFrame(sceneRef.current.animationId);

                sceneRef.current.scene.traverse((object) => {
                    if (object instanceof THREE.Points) {
                        object.geometry.dispose();
                        if (Array.isArray(object.material)) {
                            object.material.forEach((material) => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });

                sceneRef.current.renderer.dispose();

                // Check if renderer.domElement is still a child of containerRef.current
                if (containerRef.current && containerRef.current.contains(sceneRef.current.renderer.domElement)) {
                    containerRef.current.removeChild(sceneRef.current.renderer.domElement);
                }
            }
        };
    }, [theme]);

    // If we don't assume a ThemeProvider is wrapped high enough, we might want to default.
    // However, next-themes hooks usually just work or return undefined theme if not present.

    return (
        <div
            ref={containerRef}
            className={cn("pointer-events-none fixed inset-0 z-0", className)}
            {...props}
        />
    );
}
