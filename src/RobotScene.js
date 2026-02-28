import React, { useMemo, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport, Text, Billboard, Line } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import HamburgerMenu from "./components/HamburgerMenu"; 
import { useWebSocket } from "./context/WebSocketContext";

// Original Colors Restored
const COLORS = { Y_GREEN: "#1b5e20", X_RED: "#b71c1c", Z_BLUE: "#0d47a1" };

// 100% Code-Based 3D Arrows
const Custom3DArrows = () => {
  const shaftLength = 0.35;
  const shaftRadius = 0.0035;
  const headLength = 0.05;
  const headRadius = 0.012;

  const Arrow = ({ color, rotation }) => (
    <group rotation={rotation}>
      <mesh position={[0, shaftLength / 2, 0]}>
        <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 32]} />
        <meshBasicMaterial color={color} depthTest={false} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, shaftLength + headLength / 2, 0]}>
        <coneGeometry args={[headRadius, headLength, 32]} />
        <meshBasicMaterial color={color} depthTest={false} transparent opacity={0.9} />
      </mesh>
    </group>
  );

  return (
    <group>
      <Arrow color={COLORS.Y_GREEN} rotation={[0, 0, 0]} />
      <Arrow color={COLORS.X_RED} rotation={[0, 0, -Math.PI / 2]} />
      <Arrow color={COLORS.Z_BLUE} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
};

const RealRobot = () => {
  const link0 = useLoader(STLLoader, "/meshes/link0.stl");
  const link1 = useLoader(STLLoader, "/meshes/link1.stl");
  const link2 = useLoader(STLLoader, "/meshes/link2.stl");
  const link3 = useLoader(STLLoader, "/meshes/link3.stl");
  const link4 = useLoader(STLLoader, "/meshes/link4.stl");
  const link5 = useLoader(STLLoader, "/meshes/link5.stl");

  const { robotState } = useWebSocket();
  const j = robotState?.joints || { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 };
  const rad = (deg) => (deg * Math.PI) / 180;

  // Added metalness and roughness to make the robot look shiny and realistic
  const matProps = { metalness: 0.6, roughness: 0.3 };

  return (
    <group position={[0, 0, 0]} scale={[1000, 1000, 1000]}>
      <mesh geometry={link0}><meshStandardMaterial color="#222222" {...matProps} /></mesh>
      
      <Custom3DArrows />

      <group position={[0, 0, 0]} rotation={[0, 0, rad(j.j1)]}>
        <mesh geometry={link1} position={[0, 0, 0]}><meshStandardMaterial color="#0277bd" {...matProps} /></mesh>
        <group position={[0.150, 0, 0.462]} rotation={[0, rad(j.j2), 0]}>
          <mesh geometry={link2} position={[-0.150, 0, -0.462]}><meshStandardMaterial color="#0277bd" {...matProps} /></mesh>
          <group position={[0, 0, 0.600]} rotation={[0, rad(j.j3), 0]}>
            <mesh geometry={link3} position={[-0.150, 0, -1.062]}><meshStandardMaterial color="#0277bd" {...matProps} /></mesh>
            <group position={[0, 0, 0.190]} rotation={[rad(j.j4), 0, 0]}>
              <mesh geometry={link4} position={[-0.150, 0, -1.252]}><meshStandardMaterial color="#d32f2f" {...matProps} /></mesh>
              <group position={[0.687, 0, 0]} rotation={[0, rad(j.j5), 0]}>
                <mesh geometry={link5} position={[-0.837, 0, -1.252]}><meshStandardMaterial color="#ffb300" {...matProps} /></mesh>
                <group position={[0.101, 0, 0]} rotation={[rad(j.j6), 0, 0]}>
                  <Custom3DArrows />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

// ==========================================
// NEW: MULTI-COLORED WALL GRIDS & TEXT
// ==========================================
const CustomGridWalls = () => {
  const size = 2500;
  const step = 100;
  const height = 3000;

  const floorGrid = useMemo(() => {
    const pts = [];
    for (let i = -size; i <= size; i += step) {
      pts.push(-size, i, 0, size, i, 0); // Horizontal
      pts.push(i, -size, 0, i, size, 0); // Vertical
    }
    return new Float32Array(pts);
  }, []);

  const backWallGrid = useMemo(() => {
    const pts = [];
    for (let x = -size; x <= size; x += step) pts.push(x, 0, 0, x, 0, height);
    for (let z = 0; z <= height; z += step) pts.push(-size, 0, z, size, 0, z);
    return new Float32Array(pts);
  }, []);

  const sideWallGrid = useMemo(() => {
    const pts = [];
    for (let y = -size; y <= size; y += step) pts.push(0, y, 0, 0, y, height);
    for (let z = 0; z <= height; z += step) pts.push(0, -size, z, 0, size, z);
    return new Float32Array(pts);
  }, []);

  return (
    <group>
      {/* 1. Floor (Light Green) */}
      <lineSegments>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={floorGrid.length / 3} array={floorGrid} itemSize={3} /></bufferGeometry>
        <lineBasicMaterial color="#81c784" transparent opacity={0.6} /> 
      </lineSegments>

      {/* 2. Back Wall (Blue) */}
      <group position={[0, size, 0]}>
        <lineSegments>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={backWallGrid.length / 3} array={backWallGrid} itemSize={3} /></bufferGeometry>
          <lineBasicMaterial color="#64b5f6" transparent opacity={0.6} /> 
        </lineSegments>
      </group>

      {/* 3. Left Side Wall (Red) */}
      <group position={[-size, 0, 0]}>
        <lineSegments>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={sideWallGrid.length / 3} array={sideWallGrid} itemSize={3} /></bufferGeometry>
          <lineBasicMaterial color="#e57373" transparent opacity={0.6} /> 
        </lineSegments>
      </group>

      {/* 4. TEXSONICS Text on Back Wall */}
      <group position={[0, size - 10, 1600]} rotation={[Math.PI / 2, 0, 0]}>
        <Text fontSize={220} color="#333" fontWeight="900" anchorX="center" anchorY="bottom" letterSpacing={0.1}>
          TEXSONICS
        </Text>
        <Text position={[0, -50, 0]} fontSize={80} color="#666" fontWeight="bold" anchorX="center" anchorY="top" letterSpacing={0.6}>
          R O B O T I C S
        </Text>
      </group>
    </group>
  );
};

const WorldCoordinates = () => {
  const labels = [];
  const step = 200; const fontSize = 40; const axisLabelSize = 120;
  
  labels.push(<Billboard key="y" position={[0, -2600, 0]}><Text fontSize={axisLabelSize} color={COLORS.Y_GREEN} fontWeight="bold" outlineWidth={3}>Y</Text></Billboard>);
  labels.push(<Billboard key="x" position={[2600, 0, 0]}><Text fontSize={axisLabelSize} color={COLORS.X_RED} fontWeight="bold" outlineWidth={3}>X</Text></Billboard>);
  labels.push(<Billboard key="z" position={[2600, 2600, 1500]}><Text fontSize={axisLabelSize} color={COLORS.Z_BLUE} fontWeight="bold" outlineWidth={3}>Z</Text></Billboard>);
  
  for (let i = -2400; i <= 2400; i += step) {
    labels.push(<Billboard key={`yn-${i}`} position={[i, -2550, 0]}><Text fontSize={fontSize} color={COLORS.Y_GREEN} fontWeight="bold">{i}</Text></Billboard>);
    if (i !== 0) labels.push(<Billboard key={`xn-${i}`} position={[2550, i, 0]}><Text fontSize={fontSize} color={COLORS.X_RED} fontWeight="bold">{i}</Text></Billboard>);
  }
  for (let z = 200; z <= 3000; z += step) { 
    labels.push(<Billboard key={`zn-${z}`} position={[2550, 2550, z]}><Text fontSize={fontSize} color={COLORS.Z_BLUE} fontWeight="bold">{z}</Text></Billboard>);
  }
  return <group>{labels}</group>;
};

const RobotScene = () => {
  const { robotState } = useWebSocket();
  const c = robotState?.cartesian || { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
  const j = robotState?.joints || { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 };

  const bluePts = robotState?.blueTrajectory || [];
  const redPts = robotState?.redTrajectory || [];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      
      <HamburgerMenu />

      {/* TABLET OPTIMIZED JOINTS PANEL */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 'clamp(60px, 12vw, 110px)', bottom: 0,
        backgroundColor: 'rgba(26, 30, 41, 0.95)', borderLeft: '2px solid #111', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        paddingTop: '15px', paddingBottom: '15px', justifyContent: 'space-evenly'
      }}>
        <div style={{ color: '#00bcd4', fontSize: 'clamp(0.6rem, 1vw, 0.9rem)', fontWeight: '900', letterSpacing: '1px' }}>JOINTS</div>
        {['J1', 'J2', 'J3', 'J4', 'J5', 'J6'].map((label, idx) => {
          const val = j[`j${idx+1}`];
          return (
            <div key={label} style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ color: '#aaa', fontSize: 'clamp(0.5rem, 0.8vw, 0.8rem)', fontWeight: 'bold' }}>{label}</div>
              <div style={{ color: '#4CAF50', fontSize: 'clamp(0.7rem, 1.2vw, 1.1rem)', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                {val !== undefined ? val.toFixed(2) : "0.00"}°
              </div>
            </div>
          );
        })}
      </div>

      {/* TABLET OPTIMIZED CARTESIAN PANEL */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 'clamp(60px, 12vw, 110px)', height: 'clamp(50px, 10vh, 85px)',
        backgroundColor: 'rgba(26, 30, 41, 0.95)', borderTop: '2px solid #111', zIndex: 10,
        display: 'flex', alignItems: 'center', padding: '0 clamp(5px, 2vw, 20px)'
      }}>
        <div style={{ color: '#00bcd4', fontWeight: '900', fontSize: 'clamp(0.7rem, 1.2vw, 1rem)', letterSpacing: '1px', marginRight: 'clamp(5px, 2vw, 20px)' }}>CARTESIAN</div>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', overflow: 'hidden' }}>
          {[ {l: 'X(mm)', v: c.x, clr: '#00bcd4'}, {l: 'Y(mm)', v: c.y, clr: '#00bcd4'}, {l: 'Z(mm)', v: c.z, clr: '#00bcd4'},
             {l: 'A(°)', v: c.rx, clr: '#fff'}, {l: 'B(°)', v: c.ry, clr: '#fff'}, {l: 'C(°)', v: c.rz, clr: '#fff'} 
          ].map(item => (
            <div key={item.l} style={{ textAlign: 'center', minWidth: 0, flex: 1 }}>
              <div style={{ color: '#aaa', fontSize: 'clamp(0.5rem, 0.9vw, 0.75rem)', marginBottom: '2px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{item.l}</div>
              <div style={{ color: item.clr, fontSize: 'clamp(0.75rem, 1.4vw, 1.3rem)', fontWeight: '900', textShadow: '0 1px 2px rgba(0,0,0,0.8)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.v !== undefined ? item.v.toFixed(3) : "0.000"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3D CANVAS */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 'clamp(60px, 12vw, 110px)', bottom: 'clamp(50px, 10vh, 85px)' }}>
        <Canvas camera={{ position: [0, -6500, 3000], up: [0, 0, 1], fov: 45, near: 1, far: 30000 }}>
          
          {/* Enhanced Light Studio Environment */}
          <color attach="background" args={["#f0f4f8"]} /> {/* Light grayish-blue background */}
          <ambientLight intensity={1.2} />
          <hemisphereLight skyColor="#ffffff" groundColor="#444444" intensity={1.0} />
          <directionalLight position={[2000, -4000, 4000]} intensity={2.5} castShadow />
          <pointLight position={[-2000, -2000, 3000]} intensity={1.8} />

          <OrbitControls makeDefault target={[0, 0, 800]} maxDistance={12000} minDistance={200} />
          
          <group>
            <CustomGridWalls />
            <WorldCoordinates />
          </group>
          
          <Suspense fallback={null}>
            <group rotation={[0, 0, -Math.PI / 2]}>
              <RealRobot />
              {bluePts.length > 1 && <Line points={bluePts} color="#039BE5" lineWidth={1} />}
              {redPts.length > 1 && <Line points={redPts} color="#E53935" lineWidth={3} />}
            </group>
          </Suspense>

          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport axisColors={[COLORS.X_RED, COLORS.Y_GREEN, COLORS.Z_BLUE]} labelColor="white" />
          </GizmoHelper>
        </Canvas>
      </div>
      
    </div>
  );
};

export default RobotScene;