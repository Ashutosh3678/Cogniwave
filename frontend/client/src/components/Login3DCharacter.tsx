import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";

type FieldType = "email" | "password" | null;

interface Login3DCharacterProps {
    focusedField: FieldType;
    keyTrigger: number; // Increment this to trigger a small "twitch"
    disableTracking?: boolean;
}

const CharacterModel = ({ focusedField, keyTrigger, disableTracking }: { focusedField: FieldType, keyTrigger: number, disableTracking?: boolean }) => {
    const group = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const rightEyeRef = useRef<THREE.Mesh>(null);
    const leftEyeRef = useRef<THREE.Mesh>(null);
    const rightHandRef = useRef<THREE.Mesh>(null);
    const leftHandRef = useRef<THREE.Mesh>(null);

    // Eyelids/Closing eyes logic can be scale-based or separate geometry
    // Let's use scale Y for blinking/closing.

    // Smooth animation targets
    const targetRotation = useRef(new THREE.Vector3());
    const targetBodyPos = useRef(new THREE.Vector3());
    const targetHandRightPos = useRef(new THREE.Vector3(0.9, 0, 0));
    const targetHandLeftPos = useRef(new THREE.Vector3(-0.9, 0, 0));
    const targetEyeScale = useRef(1);
    const targetLookAt = useRef(new THREE.Vector3(0, 0, 5));

    // Twitch/Tilt state
    const lastKeyTrigger = useRef(0);
    const tiltTimer = useRef(0);

    useFrame((state) => {
        if (!group.current) return;

        const time = state.clock.getElapsedTime();
        const mouse = disableTracking
            ? { x: Math.sin(time * 0.5) * 0.3, y: Math.cos(time * 0.4) * 0.2 } // Simulated idle looking
            : state.pointer;

        // 1. DANCING (Idle State)
        if (!focusedField) {
            // Bouncy joyful dance
            const bounce = Math.sin(time * 8) * 0.15;
            const sway = Math.sin(time * 3) * 0.1;
            const wiggle = Math.cos(time * 5) * 0.05;

            // Updating targets
            targetBodyPos.current.set(0, bounce, 0);
            targetRotation.current.set(bounce * 0.2, sway, wiggle);

            // Hands idle animation
            targetHandRightPos.current.set(0.9, Math.sin(time * 5 + 1) * 0.1 - 0.2, 0);
            targetHandLeftPos.current.set(-0.9, Math.sin(time * 5) * 0.1 - 0.2, 0);

            targetEyeScale.current = 1;

            // Look slightly around
            targetLookAt.current.set(mouse.x * 2, mouse.y * 2, 5);
        }

        // 2. EMAIL (Attentive State)
        else if (focusedField === "email") {
            // Stop dancing, lean forward slightly
            targetBodyPos.current.set(0, -0.2, 0.5); // Lean in

            // Handle Typing Tilt
            if (keyTrigger !== lastKeyTrigger.current) {
                lastKeyTrigger.current = keyTrigger;
                tiltTimer.current = 1.0; // Reset tilt impact
            }

            let tiltZ = 0;
            if (tiltTimer.current > 0) {
                tiltTimer.current -= state.clock.getDelta() * 5; // Decay
                // Random slight tilt direction based on keyTrigger parity or random
                tiltZ = Math.sin(keyTrigger * 10) * 0.1 * Math.max(0, tiltTimer.current);
            }

            // Rotate towards mouse heavily
            // Mouse X controls Y rotation (turning head)
            // Mouse Y controls X rotation (up/down)
            const lookX = mouse.x * 0.8;
            const lookY = mouse.y * 0.5;

            targetRotation.current.set(-lookY, lookX, tiltZ);

            // Hands resting or calm
            targetHandRightPos.current.set(0.8, -0.5, 0.4);
            targetHandLeftPos.current.set(-0.8, -0.5, 0.4);

            targetEyeScale.current = 1;

            // Look EXACTLY at cursor
            targetLookAt.current.set(mouse.x * 10, mouse.y * 10, 5);
        }

        // 3. PASSWORD (Shy State)
        else if (focusedField === "password") {
            // Still body
            targetBodyPos.current.set(0, -0.1, 0);
            targetRotation.current.set(0.1, 0, 0); // Look down slightly

            // Hands cover eyes
            targetHandRightPos.current.set(0.6, 0.4, 0.6);
            targetHandLeftPos.current.set(-0.6, 0.4, 0.6);

            // Close eyes
            targetEyeScale.current = 0.1;

            // Look down/neutral
            targetLookAt.current.set(0, -2, 2);
        }

        // --- APPLY LERPS ---
        const smooth = 0.1; // 0.1 is standard smooth dampening

        // Body Position
        group.current.position.lerp(targetBodyPos.current, smooth);

        // Body Rotation
        // Create quaternion from Euler targets for smoother rotation if needed, but Euler lerp is ok for small angles
        // We'll just lerp the rotation values manually to avoid gimbal lock issues with simple Euler usually,
        // but for simple char logic, direct transform manipulation is fine.
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotation.current.x, smooth);
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotation.current.y, smooth);
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetRotation.current.z, smooth);

        // Hands
        if (rightHandRef.current && leftHandRef.current) {
            rightHandRef.current.position.lerp(targetHandRightPos.current, smooth);
            leftHandRef.current.position.lerp(targetHandLeftPos.current, smooth);
        }

        // Eyes Scale (Blinking logic could be added here overlaying the target)
        if (rightEyeRef.current && leftEyeRef.current) {
            // Occasional random blink if not password mode
            let blink = 1;
            if (focusedField !== 'password') {
                const blinkTrigger = Math.sin(time * 0.5) > 0.995; // Rare blink
                if (blinkTrigger) blink = 0.1;
            }

            const currentScale = targetEyeScale.current * blink;
            rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, currentScale, 0.2);
            leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, currentScale, 0.2);
        }
    });

    return (
        <group ref={group}>
            {/* Body: A simple capsule made of a Cylinder with Sphere caps */}
            <group ref={bodyRef}>
                {/* Top Green Half */}
                <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.7, 0.7, 0.7, 32]} />
                    <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.1} />
                </mesh>
                <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
                    <sphereGeometry args={[0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.1} />
                </mesh>

                {/* Bottom White Half */}
                <mesh position={[0, -0.35, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.7, 0.7, 0.7, 32]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
                </mesh>
                <mesh position={[0, -0.7, 0]} castShadow receiveShadow>
                    <sphereGeometry args={[0.7, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
                </mesh>
            </group>

            {/* Eyes Group */}
            <group position={[0, 0.4, 0.6]}>
                {/* Right Eye */}
                <mesh ref={rightEyeRef} position={[0.25, 0, 0]} castShadow>
                    <sphereGeometry args={[0.08, 32, 32]} />
                    <meshStandardMaterial color="#1f1f1f" roughness={0.1} />
                </mesh>
                {/* Left Eye */}
                <mesh ref={leftEyeRef} position={[-0.25, 0, 0]} castShadow>
                    <sphereGeometry args={[0.08, 32, 32]} />
                    <meshStandardMaterial color="#1f1f1f" roughness={0.1} />
                </mesh>
            </group>

            {/* Hands */}
            <mesh ref={rightHandRef} position={[0.9, 0, 0]} castShadow>
                <sphereGeometry args={[0.28, 32, 32]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
            </mesh>
            <mesh ref={leftHandRef} position={[-0.9, 0, 0]} castShadow>
                <sphereGeometry args={[0.28, 32, 32]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Subtle Cheeks/Blush (Optional) */}
            <mesh position={[0.35, 0.25, 0.62]} rotation={[0, 0.5, 0]} scale={[1.4, 0.9, 1]}>
                <circleGeometry args={[0.08, 32]} />
                <meshBasicMaterial color="#ffaaaa" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[-0.35, 0.25, 0.62]} rotation={[0, -0.5, 0]} scale={[1.4, 0.9, 1]}>
                <circleGeometry args={[0.08, 32]} />
                <meshBasicMaterial color="#ffaaaa" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>

        </group>
    );
};

export default function Login3DCharacter({ focusedField, keyTrigger, className, disableTracking }: Login3DCharacterProps & { className?: string }) {
    return (
        <div className={`w-full h-full flex items-center justify-center bg-transparent ${className || "min-h-[400px]"}`}>
            <Canvas shadows camera={{ position: [0, 0, 8], fov: 35 }}>
                <ambientLight intensity={0.8} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <Float
                    speed={2}
                    rotationIntensity={focusedField ? 0.1 : 0.5}
                    floatIntensity={focusedField ? 0.2 : 0.5}
                    floatingRange={[-0.1, 0.1]}
                >
                    <CharacterModel focusedField={focusedField} keyTrigger={keyTrigger} disableTracking={disableTracking} />
                </Float>

                <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
