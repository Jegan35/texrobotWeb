import React, { useState, useMemo, Suspense, useRef, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport, Text, Billboard, Line } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import HamburgerMenu from "./components/HamburgerMenu"; 
import { useWebSocket } from "./context/WebSocketContext";

// Original Colors Restored
const COLORS = { Y_GREEN: "#1b5e20", X_RED: "#b71c1c", Z_BLUE: "#0d47a1" };

// ==========================================
// OPTIMIZATION 1: THE ULTIMATE ZERO-LAG THICK LINE
// O(K) Complexity + 150ms Throttling + Tail Effect (Fixed Marking)
// ==========================================
// ==========================================
// OPTIMIZATION 1: THE ULTIMATE ZERO-LAG CHUNKING ALGORITHM
// லைன் முழுமையாக இருக்கும், மறையாது! ஆனால் 0% Lag!
// ==========================================

// 1. Static Line: இது பழைய லைன்களை "Freeze" செய்துவிடும். CPU-வை துளியும் பாதிக்காது!
const StaticLine = React.memo(({ points, color, lineWidth }) => {
  return (
    <Line points={points} color={color} lineWidth={lineWidth} transparent opacity={0.9} />
  );
});

// 2. Main Logic: லைன்களை 250 புள்ளிகளாக துண்டாக்கும் மூளை (Chunker)
const FastThickLine = React.memo(({ points, color, lineWidth }) => {
  const [renderData, setRenderData] = useState({ chunks: [], active: [] });
  const chunksRef = useRef([]);
  const lastLen = useRef(0);
  const latestPoints = useRef(points);

  latestPoints.current = points;

  useEffect(() => {
    // 150ms Throttling + Chunking
    const interval = setInterval(() => {
      const pts = latestPoints.current;
      if (!pts) return;

      const len = pts.length;

      // FAST CLEAR (பழைய டேட்டாவை அழித்தால் உடனே க்ளியர் ஆகும்)
      if (len < 2) {
        if (lastLen.current > 0) {
          chunksRef.current = [];
          setRenderData({ chunks: [], active: [] });
          lastLen.current = 0;
        }
        return;
      }

      if (len !== lastLen.current) {
        // ட்ராஜெக்டரி ரீசெட் ஆனால் க்ளியர் செய்ய
        if (len < lastLen.current) chunksRef.current = [];

        const CHUNK_SIZE = 250; // 250 புள்ளிகளாக துண்டாக்குகிறது
        const numChunks = Math.floor(len / CHUNK_SIZE);

        // புது Chunk உருவாகி இருந்தால், அதை Static ஆக மாற்று
        if (numChunks > chunksRef.current.length) {
          for (let i = chunksRef.current.length; i < numChunks; i++) {
            // முந்தைய துண்டோடு ஒட்டிக்கொள்ள (Overlap) 1 புள்ளி முன்னால் இருந்து வெட்டுகிறோம்
            const start = Math.max(0, i * CHUNK_SIZE - 1);
            const end = (i + 1) * CHUNK_SIZE;
            chunksRef.current.push(pts.slice(start, end));
          }
        }

        // மீதமுள்ள புதிய புள்ளிகள் (எப்போதும் 250-க்கு குறைவாகவே இருக்கும், அதனால் Lag ஆகாது)
        const activeStart = Math.max(0, chunksRef.current.length * CHUNK_SIZE - 1);
        const activePts = pts.slice(activeStart, len);

        // React-ஐ ஏமாற்றி Static ஆக்க Shallow Copy பயன்படுத்துகிறோம்
        setRenderData({ chunks: [...chunksRef.current], active: activePts });
        lastLen.current = len;
      }
    }, 150); 

    return () => clearInterval(interval);
  }, []);

  if (renderData.chunks.length === 0 && renderData.active.length < 2) return null;

  return (
    <group>
      {/* ஃப்ரீஸ் செய்யப்பட்ட பழைய மார்க்கிங் லைன்கள் (CPU: 0%) */}
      {renderData.chunks.map((chunk, idx) => (
         <StaticLine key={idx} points={chunk} color={color} lineWidth={lineWidth || 2.5} />
      ))}
      
      {/* தற்போதைய லைன் முனை (CPU: Very Low) */}
      {renderData.active.length > 1 && (
         <StaticLine points={renderData.active} color={color} lineWidth={lineWidth || 2.5} />
      )}
    </group>
  );
});

// ==========================================
// OPTIMIZATION 2: React.memo() to cache static models
// ==========================================
const Custom3DArrows = React.memo(() => {
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

// Cached so React doesn't redraw thousands of lines 60 times a second
const CustomGridWalls = React.memo(() => {
  const size = 2500;
  const step = 100;
  const height = 3000;

  const floorGrid = useMemo(() => {
    const pts = [];
    for (let i = -size; i <= size; i += step) {
      pts.push(-size, i, 0, size, i, 0); 
      pts.push(i, -size, 0, i, size, 0); 
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
      <lineSegments>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={floorGrid.length / 3} array={floorGrid} itemSize={3} /></bufferGeometry>
        <lineBasicMaterial color="#81c784" transparent opacity={0.6} /> 
      </lineSegments>

      <group position={[0, size, 0]}>
        <lineSegments>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={backWallGrid.length / 3} array={backWallGrid} itemSize={3} /></bufferGeometry>
          <lineBasicMaterial color="#64b5f6" transparent opacity={0.6} /> 
        </lineSegments>
      </group>

      <group position={[-size, 0, 0]}>
        <lineSegments>
          <bufferGeometry><bufferAttribute attach="attributes-position" count={sideWallGrid.length / 3} array={sideWallGrid} itemSize={3} /></bufferGeometry>
          <lineBasicMaterial color="#e57373" transparent opacity={0.6} /> 
        </lineSegments>
      </group>

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
});

// Cached so React doesn't recreate Heavy Text Meshes on every tick
const WorldCoordinates = React.memo(() => {
  const labels = [];
  const step = 100; 
  const fontSize = 40; 
  const axisLabelSize = 120;
  
  labels.push(<Billboard key="y" position={[0, -2600, 0]}><Text fontSize={axisLabelSize} color={COLORS.Y_GREEN} fontWeight="bold" outlineWidth={3}>Y</Text></Billboard>);
  labels.push(<Billboard key="x" position={[2600, 0, 0]}><Text fontSize={axisLabelSize} color={COLORS.X_RED} fontWeight="bold" outlineWidth={3}>X</Text></Billboard>);
  labels.push(<Billboard key="z" position={[2600, 2600, 1500]}><Text fontSize={axisLabelSize} color={COLORS.Z_BLUE} fontWeight="bold" outlineWidth={3}>Z</Text></Billboard>);
  
  for (let i = -2400; i <= 2400; i += step) {
    labels.push(<Billboard key={`yn-${i}`} position={[i, -2550, 0]}><Text fontSize={fontSize} color={COLORS.Y_GREEN} fontWeight="bold">{i}</Text></Billboard>);
    if (i !== 0) labels.push(<Billboard key={`xn-${i}`} position={[2550, i, 0]}><Text fontSize={fontSize} color={COLORS.X_RED} fontWeight="bold">{i}</Text></Billboard>);
  }
  for (let z = 100; z <= 3000; z += step) { 
    labels.push(<Billboard key={`zn-${z}`} position={[2550, 2550, z]}><Text fontSize={fontSize} color={COLORS.Z_BLUE} fontWeight="bold">{z}</Text></Billboard>);
  }
  return <group>{labels}</group>;
});

const RobotScene = () => {
  const { robotState } = useWebSocket();
  const c = robotState?.cartesian || { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
  const j = robotState?.joints || { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 };

  const bluePts = robotState?.blueTrajectory || [];
  const redPts = robotState?.redTrajectory || [];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      
      <HamburgerMenu />

      {/* ================= JOINTS PANEL (PERFECT FIT) ================= */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 'clamp(60px, 10vw, 85px)', bottom: 0, backgroundColor: 'rgba(26, 30, 41, 0.95)', borderLeft: '2px solid #111', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
        
        <div style={{ color: '#00bcd4', fontSize: 'clamp(0.6rem, 1vw, 0.8rem)', fontWeight: '900', letterSpacing: '1px', marginTop: '15px' }}>JOINTS</div>
        
        {/* flex: 1 மற்றும் space-evenly மூலம் சீராக பிரிக்கிறோம். 
            marginBottom கொடுத்திருப்பதால், Cartesian பேனல் உயரத்திற்கு மேல் சரியாக J6 வந்து நிற்கும்! */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1, justifyContent: 'space-evenly', marginBottom: 'clamp(40px, 8vh, 55px)' }}>
          {['J1', 'J2', 'J3', 'J4', 'J5', 'J6'].map((label, idx) => {
            const val = j[`j${idx+1}`];
            return (
              <div key={label} style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ color: '#aaa', fontSize: 'clamp(0.5rem, 0.75vw, 0.7rem)', fontWeight: 'bold', marginBottom: '2px' }}>{label}</div>
                <div style={{ color: '#4CAF50', fontSize: 'clamp(0.7rem, 1vw, 0.95rem)', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                  {val !== undefined ? val.toFixed(2) : "0.00"}°
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= CARTESIAN PANEL ================= */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 'clamp(60px, 10vw, 85px)', height: 'clamp(40px, 8vh, 55px)', backgroundColor: 'rgba(26, 30, 41, 0.95)', borderTop: '2px solid #111', zIndex: 10, display: 'flex', alignItems: 'center', padding: '0 clamp(10px, 2vw, 20px)', userSelect: 'none' }}>
        
        <div style={{ color: '#00bcd4', fontWeight: '900', fontSize: 'clamp(0.6rem, 1vw, 0.8rem)', letterSpacing: '1px', marginRight: 'clamp(10px, 3vw, 30px)' }}>CARTESIAN</div>
        
        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around', alignItems: 'center' }}>
          {[ {l: 'X(mm)', v: c.x, clr: '#00bcd4'}, {l: 'Y(mm)', v: c.y, clr: '#00bcd4'}, {l: 'Z(mm)', v: c.z, clr: '#00bcd4'},
             {l: 'A(°)', v: c.rx, clr: '#fff'}, {l: 'B(°)', v: c.ry, clr: '#fff'}, {l: 'C(°)', v: c.rz, clr: '#fff'} 
          ].map(item => (
            <div key={item.l} style={{ textAlign: 'center' }}>
              <div style={{ color: '#aaa', fontSize: 'clamp(0.5rem, 0.75vw, 0.7rem)', marginBottom: '2px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{item.l}</div>
              <div style={{ color: item.clr, fontSize: 'clamp(0.7rem, 1vw, 0.95rem)', fontWeight: '900', textShadow: '0 1px 2px rgba(0,0,0,0.8)', whiteSpace: 'nowrap' }}>
                {item.v !== undefined ? item.v.toFixed(2) : "0.00"}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 'clamp(60px, 12vw, 110px)', bottom: 'clamp(50px, 10vh, 85px)' }}>
        <Canvas camera={{ position: [0, -6500, 3000], up: [0, 0, 1], fov: 45, near: 1, far: 30000 }}>
          
          <color attach="background" args={["#f0f4f8"]} /> 
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
              {/* Using the Ultra-Optimized, Lag-Free ThickLine Component! */}
              {bluePts.length > 1 && <FastThickLine points={bluePts} color="#039BE5" lineWidth={2.5} />}
              {redPts.length > 1 && <FastThickLine points={redPts} color="#E53935" lineWidth={4} />}
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