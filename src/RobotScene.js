import React, { useState, useMemo, Suspense, useRef, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport, Text, Billboard, Line } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import HamburgerMenu from "./components/HamburgerMenu"; 
import { useWebSocket } from "./context/WebSocketContext";
import "./RobotScene.css";

/* USE RICH DARK COLORS FOR LIGHT BACKGROUND VISIBILITY */
const COLORS = { Y_GREEN: "#246b29", X_RED: "#b71c1c", Z_BLUE: "#0d47a1" };

// 1. Static Line (CPU Zero Cost)
const StaticLine = React.memo(({ points, color, lineWidth }) => {
  return (
    <Line points={points} color={color} lineWidth={lineWidth} transparent opacity={0.9} />
  );
});

// 2. Chunker Line Algorithm
const FastThickLine = React.memo(({ points, color, lineWidth }) => {
  const [renderData, setRenderData] = useState({ chunks: [], active: [] });
  const chunksRef = useRef([]);
  const lastLen = useRef(0);
  const latestPoints = useRef(points);

  latestPoints.current = points;

  useEffect(() => {
    const interval = setInterval(() => {
      const pts = latestPoints.current;
      if (!pts) return;

      const len = pts.length;
      if (len < 2) {
        if (lastLen.current > 0) {
          chunksRef.current = [];
          setRenderData({ chunks: [], active: [] });
          lastLen.current = 0;
        }
        return;
      }

      if (len !== lastLen.current) {
        if (len < lastLen.current) chunksRef.current = [];

        const CHUNK_SIZE = 250; 
        const numChunks = Math.floor(len / CHUNK_SIZE);

        if (numChunks > chunksRef.current.length) {
          for (let i = chunksRef.current.length; i < numChunks; i++) {
            const start = Math.max(0, i * CHUNK_SIZE - 1);
            const end = (i + 1) * CHUNK_SIZE;
            chunksRef.current.push(pts.slice(start, end));
          }
        }

        const activeStart = Math.max(0, chunksRef.current.length * CHUNK_SIZE - 1);
        const activePts = pts.slice(activeStart, len);

        setRenderData({ chunks: [...chunksRef.current], active: activePts });
        lastLen.current = len;
      }
    }, 150); 

    return () => clearInterval(interval);
  }, []);

  if (renderData.chunks.length === 0 && renderData.active.length < 2) return null;

  return (
    <group>
      {renderData.chunks.map((chunk, idx) => (
         <StaticLine key={idx} points={chunk} color={color} lineWidth={lineWidth || 2.5} />
      ))}
      {renderData.active.length > 1 && (
         <StaticLine points={renderData.active} color={color} lineWidth={lineWidth || 2.5} />
      )}
    </group>
  );
});

const Custom3DArrows = React.memo(() => {
  const shaftLength = 0.35;
  const shaftRadius = 0.008; /* Increased thickness for bolder robot arrows */
  const headLength = 0.06;
  const headRadius = 0.022; /* Increased thickness */

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
});

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

const CustomGridWalls = React.memo(() => {
  const size = 2000;
  const step = 100;
  const height = 2600; /* EXTENDED Z-AXIS HEIGHT TO 2600 */

  const floorGrid = useMemo(() => {
    const pts = [];
    for (let i = -size; i <= size; i += step) {
      pts.push(-size, i, 0, size, i, 0); 
      pts.push(i, -size, 0, i, size, 0); 
    }
    return new Float32Array(pts);
  }, [size, step]); 

  const backWallGrid = useMemo(() => {
    const pts = [];
    for (let x = -size; x <= size; x += step) pts.push(x, 0, 0, x, 0, height);
    for (let z = 0; z <= height; z += step) pts.push(-size, 0, z, size, 0, z);
    return new Float32Array(pts);
  }, [size, step, height]);

  const sideWallGrid = useMemo(() => {
    const pts = [];
    for (let y = -size; y <= size; y += step) pts.push(0, y, 0, 0, y, height);
    for (let z = 0; z <= height; z += step) pts.push(0, -size, z, 0, size, z);
    return new Float32Array(pts);
  }, [size, step, height]);

  return (
    <group>
      <lineSegments key={`floor-${size}`}>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={floorGrid.length / 3} array={floorGrid} itemSize={3} /></bufferGeometry>
        <lineBasicMaterial color="#5ad15e" transparent opacity={0.7} /> 
      </lineSegments>

      <group position={[0, size, 0]}>
        <lineSegments key={`back-${size}-${height}`}>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={backWallGrid.length / 3} array={backWallGrid} itemSize={3} /></bufferGeometry>
          <lineBasicMaterial color="#2196F3" transparent opacity={0.7} /> 
        </lineSegments>
      </group>

      <group position={[-size, 0, 0]}>
        <lineSegments key={`side-${size}-${height}`}>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={sideWallGrid.length / 3} array={sideWallGrid} itemSize={3} /></bufferGeometry>
          <lineBasicMaterial color="#F44336" transparent opacity={0.7} /> 
        </lineSegments>
      </group>

      {/* ADJUSTED Z POSITION TO 1300 SO TEXT CENTERS ON THE TALLER 2600 WALL */}
      <group position={[0, size - 10, 1300]} rotation={[Math.PI / 2, 0, 0]}>
        <Text fontSize={300} color="#333333" fontWeight="900" anchorX="center" anchorY="bottom" letterSpacing={0.1} outlineWidth={5} outlineColor="#ffffff">
          TEXSONICS
        </Text>
        <Text position={[0, -50, 0]} fontSize={140} color="black" fontWeight="900" anchorX="center" anchorY="top" letterSpacing={0.3} outlineWidth={3} outlineColor="#ffffff">
          ROBOTICS
        </Text>
      </group>
    </group>
  );
});
const WorldCoordinates = React.memo(() => {
  const labels = [];
  const step = 100; 
  
  /* 🚀 ABSOLUTE MAXIMUM FONT SIZE THAT FITS IN A 100mm GAP */
  const fontSize = 42;      
  const axisLabelSize = 220; 
  
  /* 🎯 PULLED LABELS TIGHTLY TO THE GRID EDGE */
  const offset = 2040; 
  
  /* MAIN AXIS LABELS (XYZ) */
  labels.push(<Billboard key="y" position={[0, -(offset + 200), 0]}><Text fontSize={axisLabelSize} color={COLORS.Y_GREEN} fontWeight="900" outlineWidth={6} outlineColor="#ffffff">Y</Text></Billboard>);
  labels.push(<Billboard key="x" position={[offset + 200, 0, 0]}><Text fontSize={axisLabelSize} color={COLORS.X_RED} fontWeight="900" outlineWidth={6} outlineColor="#ffffff">X</Text></Billboard>);
  
  /* 🎯 THE FIX: MOVED 'Z' DOWN TO THE VERTICAL CENTER (Z=1300) AND PUSHED IT RIGHT */
  labels.push(<Billboard key="z" position={[offset + 200, 2000, 1300]}><Text fontSize={axisLabelSize} color={COLORS.Z_BLUE} fontWeight="900" outlineWidth={6} outlineColor="#ffffff">Z</Text></Billboard>);
  
  /* Y-AXIS NUMBERS */
  for (let i = -2000; i <= 2000; i += step) {
    labels.push(
      <Billboard key={`yn-${i}`} position={[i, -offset, 0]}>
        <Text fontSize={fontSize} color={COLORS.Y_GREEN} fontWeight="900" outlineWidth={2} outlineColor="#ffffff">{i}</Text>
      </Billboard>
    );
  }

  /* X-AXIS NUMBERS */
  for (let i = -2000; i <= 2000; i += step) {
    if (i !== 0) {
      labels.push(
        <Billboard key={`xn-${i}`} position={[offset, i, 0]}>
          <Text fontSize={fontSize} color={COLORS.X_RED} fontWeight="900" outlineWidth={2} outlineColor="#ffffff">{i}</Text>
        </Billboard>
      );
    }
  }

  /* Z-AXIS NUMBERS */
  for (let z = 100; z <= 2600; z += step) { 
    labels.push(
      <Billboard key={`zn-${z}`} position={[offset, 2000, z]}>
        <Text fontSize={fontSize} color={COLORS.Z_BLUE} fontWeight="900" outlineWidth={2} outlineColor="#ffffff">{z}</Text>
      </Billboard>
    );
  }
  
  return <group>{labels}</group>;
});

// ==========================================
// MAIN COMPONENT EXPORT
// ==========================================
const RobotScene = () => { 
  const { robotState } = useWebSocket();
  const c = robotState?.cartesian || { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
  const j = robotState?.joints || { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 };

  const bluePts = robotState?.blueTrajectory || [];
  const redPts = robotState?.redTrajectory || [];

  // --- CONNECT SYSTEM OK STATE ---
  const rs = robotState || {};
  const currentError = rs.error_message || "No error";
  const errLower = currentError.toLowerCase().trim();
  const hasErrorMessage = !["no error", "no active errors", "error cleared"].includes(errLower) && errLower !== "";

  const hasErrorFlag = 
      rs.has_error === true || String(rs.has_error).toLowerCase() === 'true' || rs.has_error === 1 ||
      rs.system_ok === false || String(rs.system_ok).toLowerCase() === 'false' || rs.system_ok === 0 ||
      rs.error === true || String(rs.error).toLowerCase() === 'true' || rs.error === 1 ||
      (rs.error_code !== undefined && rs.error_code !== 0 && rs.error_code !== "0");

  const isSystemOk = !(hasErrorMessage || hasErrorFlag);
  const controlsRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- CAMERA RECENTER LOGIC ---
  const handleRecenter = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(0, -6500, 3000);
      controlsRef.current.target.set(0, 0, 800);
      controlsRef.current.update();
    }
  };

  return (
    <div className="rs-container">
      
      <HamburgerMenu onToggle={(isOpen) => setIsMenuOpen(isOpen)} />

      {/* --- JOINTS PANEL --- */}
      <div className="rs-joints-panel">
        <div className="rs-joints-header">JOINTS</div>
        
        <div className="rs-joints-list">
          {['J1', 'J2', 'J3', 'J4', 'J5', 'J6'].map((label, idx) => {
            const val = j[`j${idx+1}`];
            return (
              <div key={label} className="rs-joint-item">
                <div className="rs-joint-label">{label}</div>
                <div className="rs-joint-value">
                  {val !== undefined ? val.toFixed(2) : "0.00"}°
                </div>
              </div>
            );
          })}
        </div>

        {/* SYSTEM INDICATOR BULB */}
        <div className="rs-sys-indicator-panel">
            <div className="rs-sys-bulb-base">
                <div className={`rs-sys-bulb-glow ${isSystemOk ? 'ok' : 'err'}`} />
            </div>
            <div className={`rs-sys-text ${isSystemOk ? 'ok' : 'err'}`}>
                {isSystemOk ? 'SYS OK' : 'SYS ERR'}
            </div>
        </div>
      </div>

      {/* --- CAMERA RECENTER BUTTON --- */}
      <button className="rs-recenter-btn" onClick={handleRecenter}>
        <span className="rs-recenter-icon">🎯</span> RECENTER
      </button>

      {/* --- CARTESIAN PANEL (BOTTOM OVERLAY) --- */}
      <div className="rs-cartesian-panel">
        <div className="rs-cartesian-title">CARTESIAN</div>
        
        {/* 🚀 FIXED 2-COLUMN LAYOUT (3 & 3) */}
        <div className="rs-cartesian-split-container">
          
          {/* COLUMN 1: X, Y, Z */}
          <div className="rs-cartesian-col">
            <div className="rs-cart-row">
              <span className="rs-cart-lbl">X</span>
              <span className="rs-cart-val">{c.x !== undefined ? c.x.toFixed(3) : "0.000"}</span>
              <span className="rs-cart-unit">mm</span>
            </div>
            <div className="rs-cart-row">
              <span className="rs-cart-lbl">Y</span>
              <span className="rs-cart-val">{c.y !== undefined ? c.y.toFixed(3) : "0.000"}</span>
              <span className="rs-cart-unit">mm</span>
            </div>
            <div className="rs-cart-row">
              <span className="rs-cart-lbl">Z</span>
              <span className="rs-cart-val">{c.z !== undefined ? c.z.toFixed(3) : "0.000"}</span>
              <span className="rs-cart-unit">mm</span>
            </div>
          </div>

          {/* COLUMN 2: A, B, C */}
          <div className="rs-cartesian-col">
            <div className="rs-cart-row">
              <span className="rs-cart-lbl">A</span>
              <span className="rs-cart-val">{c.rx !== undefined ? c.rx.toFixed(3) : "0.000"}</span>
              <span className="rs-cart-unit">°</span>
            </div>
            <div className="rs-cart-row">
              <span className="rs-cart-lbl">B</span>
              <span className="rs-cart-val">{c.ry !== undefined ? c.ry.toFixed(3) : "0.000"}</span>
              <span className="rs-cart-unit">°</span>
            </div>
            <div className="rs-cart-row">
              <span className="rs-cart-lbl">C</span>
              <span className="rs-cart-val">{c.rz !== undefined ? c.rz.toFixed(3) : "0.000"}</span>
              <span className="rs-cart-unit">°</span>
            </div>
          </div>

        </div>
      </div>
      {/* --- 3D CANVAS --- */}
      <div className="rs-canvas-container">
        <Canvas camera={{ position: [0, -6500, 3000], up: [0, 0, 1], fov: 45, near: 1, far: 30000 }}>
          
          {/* RESTORED TO LIGHT BACKGROUND */}
          <color attach="background" args={["#f0f4f8"]} /> 
          
          <ambientLight intensity={1.2} /> 

          <hemisphereLight skyColor="#ffffff" groundColor="#444444" intensity={1.0} />
          <directionalLight position={[2000, -4000, 4000]} intensity={2.5} castShadow />
          <pointLight position={[-2000, -2000, 3000]} intensity={1.8} />

          <OrbitControls ref={controlsRef} makeDefault target={[0, 0, 800]} maxDistance={12000} minDistance={200} />
          
          <group>
            <CustomGridWalls />
            <WorldCoordinates />
          </group>
          
          <Suspense fallback={null}>
            <group rotation={[0, 0, -Math.PI / 2]}>
              <RealRobot />
              {bluePts.length > 1 && <FastThickLine points={bluePts} color="#039BE5" lineWidth={1} />}
              {redPts.length > 1 && <FastThickLine points={redPts} color="#E53935" lineWidth={3} />}
            </group>
          </Suspense>

          {/* 🚀 INCREASE THE MARGIN: 120px from the right, 100px from the bottom */}
<GizmoHelper alignment="bottom-right" margin={[165, 150]}>
            <GizmoViewport axisColors={[COLORS.X_RED, COLORS.Y_GREEN, COLORS.Z_BLUE]} labelColor="white" />
          </GizmoHelper>
        </Canvas>
      </div>
      
    </div>
  );
};

export default RobotScene;