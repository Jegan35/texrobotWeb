import React, { useMemo, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import HamburgerMenu from "./components/HamburgerMenu"; 
import { useWebSocket } from "./context/WebSocketContext";

const COLORS = { Y_GREEN: "#1b5e20", X_RED: "#b71c1c", Z_BLUE: "#0d47a1", GRID: "#888888" };

// ==========================================
// CORRECTED KINEMATIC CHAIN
// ==========================================
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

  return (
    <group position={[0, 0, 0]} scale={[1000, 1000, 1000]}>
      
      {/* BASE */}
      <mesh geometry={link0}><meshStandardMaterial color="#222222" /></mesh>

      {/* J1: Base Pan. Pivot: [0, 0, 0] */}
      <group position={[0, 0, 0]} rotation={[0, 0, rad(j.j1)]}>
        <mesh geometry={link1} position={[0, 0, 0]}><meshStandardMaterial color="#0277bd" /></mesh>

        {/* J2: Shoulder. Pivot: [0.150, 0, 0.462] */}
        <group position={[0.150, 0, 0.462]} rotation={[0, rad(j.j2), 0]}>
          <mesh geometry={link2} position={[-0.150, 0, -0.462]}><meshStandardMaterial color="#0277bd" /></mesh>

          {/* J3: Elbow. Pivot: [0.150, 0, 1.062]. Offset from J2: [0, 0, 0.600] */}
          <group position={[0, 0, 0.600]} rotation={[0, rad(j.j3), 0]}>
            <mesh geometry={link3} position={[-0.150, 0, -1.062]}><meshStandardMaterial color="#0277bd" /></mesh>

            {/* J4: Forearm. Pivot: [0.150, 0, 1.252]. Offset from J3: [0, 0, 0.190] */}
            <group position={[0, 0, 0.190]} rotation={[rad(j.j4), 0, 0]}>
              <mesh geometry={link4} position={[-0.150, 0, -1.252]}><meshStandardMaterial color="#d32f2f" /></mesh>

              {/* J5: Wrist. Pivot: [0.837, 0, 1.252]. Offset from J4: [0.687, 0, 0] */}
              <group position={[0.687, 0, 0]} rotation={[0, rad(j.j5), 0]}>
                <mesh geometry={link5} position={[-0.837, 0, -1.252]}><meshStandardMaterial color="#ffb300" /></mesh>

                {/* J6: Tool Flange. Pivot: [0.938, 0, 1.252]. Offset from J5: [0.101, 0, 0] */}
                <group position={[0.101, 0, 0]} rotation={[rad(j.j6), 0, 0]}>
                  {/* Tool Marker so you can see J6 rotation */}
                  <axesHelper args={[0.3]} />
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
// SCENE SETUP
// ==========================================
const RawWebGLGridLines = () => {
  const vertices = useMemo(() => {
    const pts = []; const step = 100; const size = 2000; 
    for (let y = -size; y <= size; y += step) pts.push(-size, y, 0, size, y, 0);
    for (let x = -size; x <= size; x += step) pts.push(x, -size, 0, x, size, 0);
    for (let z = 0; z <= 3000; z += step) pts.push(-size, size, z, size, size, z);
    for (let x = -size; x <= size; x += step) pts.push(x, size, 0, x, size, 3000);
    for (let z = 0; z <= 3000; z += step) pts.push(-size, -size, z, -size, size, z);
    for (let y = -size; y <= size; y += step) pts.push(-size, y, 0, -size, y, 3000);
    return new Float32Array(pts);
  }, []);
  return (
    <lineSegments>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={vertices.length / 3} array={vertices} itemSize={3} /></bufferGeometry>
      <lineBasicMaterial color={COLORS.GRID} transparent opacity={0.4} /> 
    </lineSegments>
  );
};

const WorldCoordinates = () => {
  const labels = [];
  const step = 100; const fontSize = 35; const axisLabelSize = 120;
  labels.push(<Billboard key="y" position={[0, -2250, 0]}><Text fontSize={axisLabelSize} color={COLORS.Y_GREEN} fontWeight="bold" outlineWidth={3}>Y</Text></Billboard>);
  labels.push(<Billboard key="x" position={[2250, 0, 0]}><Text fontSize={axisLabelSize} color={COLORS.X_RED} fontWeight="bold" outlineWidth={3}>X</Text></Billboard>);
  labels.push(<Billboard key="z" position={[2150, 2150, 1500]}><Text fontSize={axisLabelSize} color={COLORS.Z_BLUE} fontWeight="bold" outlineWidth={3}>Z</Text></Billboard>);
  for (let i = -2000; i <= 2000; i += step) {
    labels.push(<Billboard key={`yn-${i}`} position={[i, -2080, 0]}><Text fontSize={fontSize} color={COLORS.Y_GREEN} fontWeight="bold">{i}</Text></Billboard>);
    if (i !== 0) labels.push(<Billboard key={`xn-${i}`} position={[2080, i, 0]}><Text fontSize={fontSize} color={COLORS.X_RED} fontWeight="bold">{i}</Text></Billboard>);
  }
  for (let z = 100; z <= 3000; z += step) { 
    labels.push(<Billboard key={`zn-${z}`} position={[2080, 2080, z]}><Text fontSize={fontSize} color={COLORS.Z_BLUE} fontWeight="bold">{z}</Text></Billboard>);
  }
  return <group>{labels}</group>;
};

const RobotScene = () => {
  const { robotState } = useWebSocket();
  const c = robotState?.cartesian || { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
  const j = robotState?.joints || { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 };

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#d1d9e0", position: "relative" }}>
      <HamburgerMenu />

      {/* JOINTS DATA */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '90px', bottom: '70px',
        backgroundColor: '#1a1e29', borderLeft: '1px solid #333', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '15px'
      }}>
        <div style={{ color: '#00bcd4', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '20px' }}>JOINTS</div>
        {['J1', 'J2', 'J3', 'J4', 'J5', 'J6'].map((label, idx) => {
          const val = j[`j${idx+1}`];
          return (
            <div key={label} style={{ marginBottom: '15px', textAlign: 'center' }}>
              <div style={{ color: '#ccc', fontSize: '0.85rem', fontWeight: 'bold' }}>{label}</div>
              <div style={{ color: '#4CAF50', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {val !== undefined ? val.toFixed(2) : "0.00"}°
              </div>
            </div>
          );
        })}
      </div>

      {/* CARTESIAN DATA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '70px',
        backgroundColor: '#1a1e29', borderTop: '1px solid #333', zIndex: 10,
        display: 'flex', alignItems: 'center', padding: '0 20px'
      }}>
        <div style={{ color: '#00bcd4', fontWeight: 'bold', fontSize: '0.9rem', marginRight: '30px' }}>CARTESIAN</div>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around' }}>
          {[ {l: 'X (mm)', v: c.x, clr: '#00bcd4'}, {l: 'Y (mm)', v: c.y, clr: '#00bcd4'}, {l: 'Z (mm)', v: c.z, clr: '#00bcd4'},
             {l: 'A (°)', v: c.rx, clr: '#fff'}, {l: 'B (°)', v: c.ry, clr: '#fff'}, {l: 'C (°)', v: c.rz, clr: '#fff'} 
          ].map(item => (
            <div key={item.l} style={{ textAlign: 'center' }}>
              <div style={{ color: '#ccc', fontSize: '0.8rem', marginBottom: '4px' }}>{item.l}</div>
              <div style={{ color: item.clr, fontSize: '1.2rem', fontWeight: 'bold' }}>
                {item.v !== undefined ? item.v.toFixed(3) : "0.000"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Canvas camera={{ position: [0, -5000, 2500], up: [0, 0, 1], fov: 45, near: 1, far: 25000 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[2000, -2000, 5000]} intensity={1.5} />
        <directionalLight position={[-1000, -1000, 1000]} intensity={0.5} />
        <OrbitControls makeDefault target={[0, 0, 500]} maxDistance={10000} minDistance={200} />
        <group><RawWebGLGridLines /><WorldCoordinates /></group>
        <Suspense fallback={null}>
          <group rotation={[0, 0, -Math.PI / 2]}><RealRobot /></group>
        </Suspense>
        <GizmoHelper alignment="bottom-right" margin={[120, 120]}>
          <GizmoViewport axisColors={[COLORS.X_RED, COLORS.Y_GREEN, COLORS.Z_BLUE]} labelColor="white" />
        </GizmoHelper>
      </Canvas>
    </div>
  );
};

export default RobotScene;