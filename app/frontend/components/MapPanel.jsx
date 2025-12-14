"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapPanel({ tiles }) {
  useEffect(() => {
    // Remove old map instance if exists
    if (typeof window !== "undefined" && window.LMapInstance) {
      window.LMapInstance.remove();
    }

    const map = L.map("bright-leaflet-map", {
      zoomControl: true,
      minZoom: 2,
      worldCopyJump: true,
    }).setView([20, 0], 2);

    window.LMapInstance = map;

    // 🌞 BRIGHT SATELLITE BASEMAP (FIRMS-like)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar, GIS User Community",
      }
    ).addTo(map);

    // 🔥 Draw hotspot dots
    const hotspotLayer = L.layerGroup().addTo(map);

    const points = tiles && tiles.length ? tiles : [];

    points.forEach((p) => {
      const score = p.risk_score;
      let color = "#22c55e";
      if (score > 0.85) color = "#ef4444";
      else if (score > 0.7) color = "#fb923c";
      else if (score > 0.5) color = "#facc15";

      L.circleMarker([p.lat, p.lon], {
        radius: 7,
        fillColor: color,
        fillOpacity: 0.95,
        color: "#000",
        weight: 1,
      })
        .bindPopup(
          `<b>${p.region}</b><br>
          Risk: <b>${p.risk_score.toFixed(2)}</b><br>
          Wildfire: ${p.wildfire_risk.toFixed(2)}<br>
          Crop stress: ${p.crop_stress.toFixed(2)}`
        )
        .addTo(hotspotLayer);
    });

    // ⭐ Clean corner legend
    const legend = L.control({ position: "bottomleft" });

    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      div.style.background = "rgba(15,23,42,0.85)";
      div.style.padding = "8px 12px";
      div.style.borderRadius = "10px";
      div.style.color = "#eee";
      div.style.fontSize = "12px";
      div.style.lineHeight = "1.4";
      div.style.border = "1px solid rgba(255,255,255,0.2)";

      div.innerHTML = `
        <strong>Hotspot Intensity (0–1)</strong><br>
        <span style="color:#ef4444">●</span> Extreme > 0.85<br>
        <span style="color:#fb923c">●</span> High 0.70–0.85<br>
        <span style="color:#facc15">●</span> Medium 0.50–0.70<br>
        <span style="color:#22c55e">●</span> Low < 0.50
      `;
      return div;
    };

    legend.addTo(map);
  }, [tiles]);

  return (
    <div
      id="bright-leaflet-map"
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "1rem",
        overflow: "hidden",
        boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
      }}
    />
  );
}
