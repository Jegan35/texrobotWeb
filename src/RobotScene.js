import React, { useState, useMemo, Suspense, useRef, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport, Text, Billboard, Line } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import HamburgerMenu from "./components/HamburgerMenu"; 
import { useWebSocket } from "./context/WebSocketContext";

const COLORS = { Y_GREEN: "#1b5e20", X_RED: "#b71c1c", Z_BLUE: "#0d47a1" };

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


// ==========================================
// MAIN COMPONENT EXPORT
// ==========================================
const RobotScene = ({ showControls, onToggleControls }) => {
  const { robotState } = useWebSocket();
  const c = robotState?.cartesian || { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
  const j = robotState?.joints || { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 };

  const bluePts = robotState?.blueTrajectory || [];
  const redPts = robotState?.redTrajectory || [];

  const isSystemOk = robotState?.system_ok !== false && !robotState?.error_state;

  const controlsRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(0, -6500, 3000);
      controlsRef.current.target.set(0, 0, 800);
      controlsRef.current.update();
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      
      <HamburgerMenu onToggle={(isOpen) => setIsMenuOpen(isOpen)} />

      {/* --- TOP LEFT UI WRAPPER --- */}
      <div style={{ 
          position: 'absolute', top: '65px', left: '15px', zIndex: 5, 
          display: isMenuOpen ? 'none' : 'flex', 
          flexDirection: 'column', gap: '8px', pointerEvents: 'none' 
      }}>
          
          <button
              onClick={onToggleControls}
              style={{
                  background: showControls ? 'linear-gradient(180deg, #00bcd4 0%, #008ba3 100%)' : 'rgba(20, 24, 33, 0.85)',
                  color: showControls ? '#111' : '#00bcd4',
                  border: '1px solid rgba(0, 188, 212, 0.4)',
                  borderLeft: showControls ? '1px solid #00bcd4' : '3px solid #00bcd4',
                  borderRadius: '4px', cursor: 'pointer', height: '35px', 
                  width: '130px', 
                  padding: '0', fontWeight: '900', fontSize: '0.75rem',
                  letterSpacing: '1px', backdropFilter: 'blur(5px)', transition: 'all 0.1s ease-in-out',
                  boxShadow: showControls ? '0 2px 10px rgba(0,188,212,0.4)' : 'inset 1px 1px 0 rgba(255,255,255,0.05), 0 2px 5px rgba(0,0,0,0.3)',
                  pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
          >
              <span style={{ fontSize: '1rem' }}>{showControls ? '▼' : '⚙'}</span> 
              CONTROLS
          </button>

          <button
              onClick={handleResetView}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.boxShadow = 'none'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'inset 1px 1px 0 rgba(255,255,255,0.05), 0 2px 5px rgba(0,0,0,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'inset 1px 1px 0 rgba(255,255,255,0.05), 0 2px 5px rgba(0,0,0,0.3)'; }}
              style={{
                  background: 'rgba(20, 24, 33, 0.85)',
                  color: '#ff5252', 
                  border: '1px solid rgba(255, 82, 82, 0.4)', 
                  borderLeft: '3px solid #ff5252', 
                  borderRadius: '4px', cursor: 'pointer', height: '35px', 
                  width: '130px', 
                  padding: '0', fontWeight: '900', fontSize: '0.75rem',
                  letterSpacing: '1px', transition: 'all 0.1s ease-in-out',
                  backdropFilter: 'blur(5px)',
                  boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.05), 0 2px 5px rgba(0,0,0,0.3)',
                  pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
          >
              <span style={{ fontSize: '1.1rem', marginBottom: '2px' }}>⌂</span> 
              RESET
          </button>

      </div>

      {/* --- JOINTS PANEL --- */}
      <div style={{ 
          position: 'absolute', top: 0, right: 0, width: '85px', bottom: 0, 
          backgroundColor: 'rgba(10, 12, 18, 0.85)', 
          backdropFilter: 'blur(8px)', 
          borderLeft: '1px solid rgba(0, 188, 212, 0.2)',
          zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none', pointerEvents: 'none' 
      }}>
        <div style={{ color: '#00bcd4', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px', marginTop: '15px', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>JOINTS</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1, justifyContent: 'space-evenly', marginBottom: '85px' }}>
          {['J1', 'J2', 'J3', 'J4', 'J5', 'J6'].map((label, idx) => {
            const val = j[`j${idx+1}`];
            return (
              <div key={label} style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ color: '#ccc', fontSize: '0.7rem', fontWeight: '900', marginBottom: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>{label}</div>
                <div style={{ color: '#00E676', fontSize: '1.1rem', fontWeight: '900', textShadow: '0 2px 5px rgba(0,0,0,0.9)' }}>
                  {val !== undefined ? val.toFixed(2) : "0.00"}°
                </div>
              </div>
            );
          })}
        </div>

        {/* SYSTEM INDICATOR BULB */}
        <div style={{ 
            position: 'absolute', bottom: 0, width: '100%', height: '85px', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            borderTop: '1px solid rgba(0, 188, 212, 0.2)' 
        }}>
            <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(145deg, #333, #111)',
                padding: '4px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.3)',
                position: 'relative'
            }}>
                <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    background: isSystemOk ? 'radial-gradient(circle at 30% 30%, #4aff95, #00E676, #00b35c)' : 'radial-gradient(circle at 30% 30%, #ff7b72, #FF3B30, #cc2e26)',
                    boxShadow: isSystemOk ? '0 0 15px rgba(0, 230, 118, 0.8), inset 0 0 8px rgba(255,255,255,0.6)' : '0 0 15px rgba(255, 59, 48, 0.8), inset 0 0 8px rgba(255,255,255,0.6)',
                    transition: 'all 0.3s ease'
                }} />
            </div>
            <div style={{ 
                color: isSystemOk ? '#00E676' : '#FF3B30', 
                fontSize: '0.6rem', fontWeight: '900', marginTop: '8px', 
                letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' 
            }}>
                {isSystemOk ? 'SYS OK' : 'SYS ERR'}
            </div>
        </div>

      </div>

      {/* --- CARTESIAN PANEL --- */}
      <div style={{ 
          position: 'absolute', bottom: 0, left: 0, right: '85px', height: '85px', 
          backgroundColor: 'rgba(10, 12, 18, 0.85)', 
          backdropFilter: 'blur(8px)', 
          borderTop: '1px solid rgba(0, 188, 212, 0.2)',
          zIndex: 10, display: 'flex', alignItems: 'center', padding: '0 20px', userSelect: 'none', pointerEvents: 'none' 
      }}>
        <div style={{ color: '#00bcd4', fontWeight: '900', fontSize: '0.85rem', letterSpacing: '1px', marginRight: '30px', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>CARTESIAN</div>
        
        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around', alignItems: 'center' }}>
          {[ {l: 'X(mm)', v: c.x, clr: '#00bcd4'}, {l: 'Y(mm)', v: c.y, clr: '#00bcd4'}, {l: 'Z(mm)', v: c.z, clr: '#00bcd4'},
             {l: 'A(°)', v: c.rx, clr: '#fff'}, {l: 'B(°)', v: c.ry, clr: '#fff'}, {l: 'C(°)', v: c.rz, clr: '#fff'} 
          ].map(item => (
            <div key={item.l} style={{ textAlign: 'center' }}>
              <div style={{ color: '#ccc', fontSize: '0.75rem', marginBottom: '2px', fontWeight: '900', whiteSpace: 'nowrap', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>{item.l}</div>
              <div style={{ color: item.clr, fontSize: '1.15rem', fontWeight: '900', textShadow: '0 2px 5px rgba(0,0,0,0.9)', whiteSpace: 'nowrap' }}>
                {item.v !== undefined ? item.v.toFixed(2) : "0.00"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- 3D CANVAS --- */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, -6500, 3000], up: [0, 0, 1], fov: 45, near: 1, far: 30000 }}>
          
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
              {bluePts.length > 1 && <FastThickLine points={bluePts} color="#039BE5" lineWidth={2.5} />}
              {redPts.length > 1 && <FastThickLine points={redPts} color="#E53935" lineWidth={4} />}
            </group>
          </Suspense>

          {/* FIX: GIZMO PUSHED FULLY OUTSIDE THE 85px PANELS */}
          <GizmoHelper alignment="bottom-right" margin={[150, 150]}>
            <GizmoViewport axisColors={[COLORS.X_RED, COLORS.Y_GREEN, COLORS.Z_BLUE]} labelColor="white" />
          </GizmoHelper>
        </Canvas>
      </div>
      
    </div>
  );
};

export default RobotScene;