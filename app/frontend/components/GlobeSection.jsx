"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

// react-globe.gl must be dynamically imported (no SSR)
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function GlobeSection() {
  const globeRef = useRef(null);

  // Simple sample points (later you can wire real risk data here)
  const samplePoints = [
    { lat: 37, lng: -120, size: 0.6, color: "#22c55e" }, // California-ish
    { lat: 45, lng: -120, size: 0.4, color: "#facc15" }, // Oregon-ish
    { lat: 47, lng: -122, size: 0.5, color: "#ef4444" }, // Washington-ish
  ];

  useEffect(() => {
    if (!globeRef.current) return;

    const controls = globeRef.current.controls();
    // Make sure rotation is enabled
    controls.enableRotate = true;
    controls.enableZoom = false; // keep zoom off so it feels like a clean hero globe
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
  }, []);

  const handleInteractionStart = () => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = false; // stop spinning while user drags
  };

  const handleInteractionEnd = () => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = true; // resume spinning after drag
  };

  return (
    <div
      style={{
        width: "100%",
        height: "340px",
        borderRadius: "1.5rem",
        overflow: "hidden",
        background: "radial-gradient(circle at top, #0ea5e9, #020617 60%)",
        border: "1px solid rgba(148,163,184,0.35)",
        boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        cursor: "grab",
      }}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
    >
      <Globe
        ref={globeRef}
        width={600}
        height={340}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        pointsData={samplePoints}
        pointAltitude={(d) => d.size * 0.3}
        pointColor={(d) => d.color}
        pointRadius={0.6}
        atmosphereColor="#38bdf8"
        atmosphereAltitude={0.15}
      />
    </div>
  );
}
