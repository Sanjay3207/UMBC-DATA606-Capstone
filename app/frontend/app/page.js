"use client"; //initial

import { useState } from "react";
import GlobeSection from "@/components/GlobeSection";
import dynamic from "next/dynamic";

const MapPanel = dynamic(() => import("@/components/MapPanel"), {
  ssr: false,
});

export default function Home() {
  const [state, setState] = useState("California");
  const [year, setYear] = useState(2024);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [showMethodology, setShowMethodology] = useState(false);

  const fetchRisk = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ state, year });
      const res = await fetch(
        `http://localhost:8000/api/risk?${params.toString()}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch risk data");
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError("Could not load risk data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "1.5rem 3vw 3rem", // a bit less padding + responsive side padding
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background:
          "radial-gradient(circle at top, #0f172a 0, #020617 40%, #000 100%)",
        color: "#e5e7eb",
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1440px", // 🔹 much wider canvas
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* HERO: Text + 3D Globe */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)",
            gap: "1.75rem",
            alignItems: "center",
            marginBottom: "2.5rem",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.3rem 0.8rem",
                borderRadius: "999px",
                background: "rgba(148,163,184,0.12)",
                border: "1px solid rgba(148,163,184,0.4)",
                fontSize: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: "#22c55e",
                  marginRight: "0.4rem",
                }}
              />
              Real-time satellite insights (Live)
            </div>
            <h1
              style={{
                fontSize: "2.4rem",
                lineHeight: 1.1,
                marginBottom: "0.75rem",
              }}
            >
              Geospatial Machine Learning Platform for{" "}
              <span
                style={{
                  background:
                    "linear-gradient(to right, #22c55e, #22d3ee, #6366f1)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Wildfire Risk &amp; Crop Health
              </span>
            </h1>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#9ca3af",
                maxWidth: "32rem",
                marginBottom: "1.5rem",
              }}
            >
              Explore climate-sensitive regions across the globe with modeled
              risk overlays derived from satellite imagery, climate reanalysis,
              and machine learning predictions. This demo connects a FastAPI
              backend to a Next.js visualization layer.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                onClick={fetchRisk}
                disabled={loading}
                style={{
                  padding: "0.8rem 1.6rem",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  background: loading
                    ? "#4b5563"
                    : "linear-gradient(to right, #22c55e, #22d3ee)",
                  color: "#020617",
                  fontSize: "0.9rem",
                }}
              >
                {loading ? "Loading risk…" : "Run Risk Prediction"}
              </button>
              <button
                type="button"
                onClick={() => setShowMethodology(true)}
                style={{
                  padding: "0.8rem 1.6rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.6)",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: "0.9rem",
                }}
              >
                View methodology
              </button>
            </div>
          </div>

          {/* 3D Rotating Globe */}
          <GlobeSection />
        </section>

        {/* MAIN DASHBOARD: Controls + World Map + Results */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1.05fr)", // a bit wider right column
            gap: "1.5rem",
            alignItems: "stretch",
          }}
        >
          {/* Left: Controls + Results */}
          <div
            style={{
              background: "rgba(15,23,42,0.95)",
              borderRadius: "1.25rem",
              padding: "1.5rem",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
              border: "1px solid rgba(148,163,184,0.3)",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.4rem" }}>
              Region & Scenario
            </h2>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#9ca3af",
                marginBottom: "1.1rem",
              }}
            >
              Select a region and year, then run the model to view the predicted
              wildfire or crop stress risk across analysis tiles.
            </p>

            {/* Filters */}
            <div style={{ display: "grid", gap: "0.9rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.25rem",
                    fontSize: "0.85rem",
                    color: "#9ca3af",
                  }}
                >
                  Region / State
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  style={{
                    padding: "0.6rem",
                    borderRadius: "0.6rem",
                    width: "100%",
                    border: "1px solid #4b5563",
                    background: "#020617",
                    color: "#e5e7eb",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="California">California</option>
                  <option value="Oregon">Oregon</option>
                  <option value="Washington">Washington</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.25rem",
                    fontSize: "0.85rem",
                    color: "#9ca3af",
                  }}
                >
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{
                    padding: "0.6rem",
                    borderRadius: "0.6rem",
                    width: "100%",
                    border: "1px solid #4b5563",
                    background: "#020617",
                    color: "#e5e7eb",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p style={{ marginTop: "0.75rem", color: "#fca5a5" }}>{error}</p>
            )}

            {/* Results */}
            {results && (
              <div style={{ marginTop: "1.5rem" }}>
                <h3
                  style={{
                    marginBottom: "0.3rem",
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  Risk summary for {results.state} ({results.year})
                </h3>

                {results.meta && results.meta.scenario_description && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#a5b4fc",
                      marginBottom: "0.4rem",
                      fontStyle: "italic",
                    }}
                  >
                    {results.meta.scenario_description}
                  </p>
                )}

                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                    marginBottom: "0.7rem",
                  }}
                >
                  Each tile corresponds to a spatial unit in the study area.
                  <br />
                  <span style={{ color: "#e5e7eb" }}>Wildfire risk</span>{" "}
                  captures fire potential based on fuels, topography and
                  climate;{" "}
                  <span style={{ color: "#e5e7eb" }}>crop stress</span>{" "}
                  summarizes vegetation health derived from satellite indices.
                  Overall risk is normalized from 0 (low) to 1 (high).
                </p>

                {/* GRID OF TILES */}
                {results.tiles && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: "0.9rem",
                      alignItems: "stretch",
                    }}
                  >
                    {results.tiles.map((item, idx) => {
                      // Use overall risk_score to derive a label and border color
                      let level = "Low";
                      if (item.risk_score > 0.85) level = "Extreme";
                      else if (item.risk_score > 0.7) level = "High";
                      else if (item.risk_score > 0.5) level = "Medium";

                      const borderColor =
                        level === "Extreme"
                          ? "#dc2626"
                          : level === "High"
                          ? "#ef4444"
                          : level === "Medium"
                          ? "#facc15"
                          : "#22c55e";

                      return (
                        <div
                          key={item.tile_id ?? idx}
                          style={{
                            padding: "0.9rem 1rem",
                            borderRadius: "0.9rem",
                            background: "#020617",
                            border: `1px solid ${borderColor}`,
                            boxShadow: "0 12px 25px rgba(0,0,0,0.35)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.4rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "0.75rem",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {item.region}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#9ca3af",
                                }}
                              >
                                {item.county} &middot; Tile ID: {item.tile_id}
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                padding: "0.15rem 0.6rem",
                                borderRadius: "999px",
                                border: `1px solid ${borderColor}`,
                                alignSelf: "flex-start",
                              }}
                            >
                              {level} risk
                            </div>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                              gap: "0.6rem",
                              fontSize: "0.78rem",
                            }}
                          >
                            <div>
                              <div style={{ color: "#9ca3af" }}>
                                Wildfire risk
                              </div>
                              <div style={{ fontWeight: 600 }}>
                                {item.wildfire_risk.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "#9ca3af" }}>Crop stress</div>
                              <div style={{ fontWeight: 600 }}>
                                {item.crop_stress.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "#9ca3af" }}>
                                Overall risk
                              </div>
                              <div style={{ fontWeight: 600 }}>
                                {item.risk_score.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#9ca3af",
                            }}
                          >
                            {item.notes}
                          </div>

                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "#6b7280",
                            }}
                          >
                            Coords: {item.lat.toFixed(2)}°N,{" "}
                            {item.lon.toFixed(2)}°E
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!results && !error && (
              <p
                style={{
                  marginTop: "1.1rem",
                  fontSize: "0.8rem",
                  color: "#6b7280",
                }}
              >
                No results yet. Run a prediction from the hero section or click
                &ldquo;Run Risk Prediction&rdquo; to fetch prediction scores from the trained model which is integreated with
                FastAPI backend.
              </p>
            )}
          </div>

          {/* Right: World map / context panel */}
          <div
            style={{
              background:
                "radial-gradient(circle at top, rgba(56,189,248,0.12), transparent 60%), rgba(15,23,42,0.96)",
              borderRadius: "1.25rem",
              padding: "1.2rem",
              border: "1px solid rgba(148,163,184,0.35)",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignSelf: "start",
              maxHeight: "fit-content",
              
            }}
          >
            <h2 style={{ fontSize: "1rem", marginBottom: "0.1rem" }}>
              Global coverage
            </h2>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#9ca3af",
                marginBottom: "0.4rem",
              }}
            >
              The platform is designed to extend from the US West Coast to
              global wildfire corridors and agricultural regions. Layers can
              incorporate land cover, vegetation indices, climate anomalies,
              and historical fire fronts.
            </p>
            {/* Map container with its own boundaries */}
            <div
              style={{
                height: "340px",
                width: "100%",
                borderRadius: "0.9rem",
                overflow: "hidden",
                boxShadow: "0 12px 25px rgba(0,0,0,0.45)",
              }}
            >
              <MapPanel tiles={results?.tiles} />
            </div>



            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                gap: "0.5rem",
                marginTop: "0.4rem",
                fontSize: "0.75rem",
              }}
            >
              <div
                style={{
                  padding: "0.6rem",
                  borderRadius: "0.75rem",
                  background: "#020617",
                  border: "1px solid rgba(34,197,94,0.55)",
                }}
              >
                <div style={{ fontWeight: 600 }}>Wildfire risk layers</div>
                <div
                  style={{ color: "#9ca3af", marginTop: "0.15rem" }}
                >
                  Combine fuel load, vegetation type, topography and wind
                  exposure to highlight corridors where small ignitions are
                  most likely to become large, fast-moving fires.
                </div>
              </div>

              <div
                style={{
                  padding: "0.6rem",
                  borderRadius: "0.75rem",
                  background: "#020617",
                  border: "1px solid rgba(56,189,248,0.55)",
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  Crop health &amp; water stress
                </div>
                <div
                  style={{ color: "#9ca3af", marginTop: "0.15rem" }}
                >
                  Use NDVI/EVI time series, soil-moisture proxies and
                  temperature anomalies to detect emerging crop stress weeks
                  before yield losses appear in the field.
                </div>
              </div>

              <div
                style={{
                  padding: "0.6rem",
                  borderRadius: "0.75rem",
                  background: "#020617",
                  border: "1px solid rgba(129,140,248,0.55)",
                }}
              >
                <div style={{ fontWeight: 600 }}>Future work &amp; scaling</div>
                <div
                  style={{ color: "#9ca3af", marginTop: "0.15rem" }}
                >
                  Add temporal sliders, uncertainty bands, and Mapbox/deck.gl
                  layers to support what-if scenarios for utilities, insurers
                  and agricultural planners at regional to continental scales.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Methodology modal */}
      {showMethodology && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
          onClick={() => setShowMethodology(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "720px",
              maxHeight: "80vh",
              overflowY: "auto",
              background: "rgba(15,23,42,1)",
              borderRadius: "1.25rem",
              padding: "1.8rem",
              border: "1px solid rgba(148,163,184,0.5)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.9)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ fontSize: "1.2rem" }}>Modeling methodology</h2>
              <button
                onClick={() => setShowMethodology(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#9ca3af",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <p
              style={{
                fontSize: "0.9rem",
                color: "#9ca3af",
                marginBottom: "1rem",
              }}
            >
              The current demo uses a fixed snapshot of model-like outputs while
              we train the full model on multi-year satellite and climate data.
              The production pipeline is designed as follows:
            </p>

            <ol
              style={{
                fontSize: "0.85rem",
                color: "#e5e7eb",
                paddingLeft: "1.2rem",
                display: "grid",
                gap: "0.55rem",
              }}
            >
              <li>
                <strong>Data ingestion.</strong> Sentinel-2/Landsat surface
                reflectance, ERA5 reanalysis, land-cover maps and historical
                fire perimeters are ingested into a unified geospatial data
                cube.
              </li>
              <li>
                <strong>Feature engineering.</strong> We derive vegetation
                indices (NDVI/EVI), fuel-moisture proxies, temperature and wind
                anomalies, and topographic descriptors (slope, aspect,
                elevation).
              </li>
              <li>
                <strong>Label construction.</strong> For wildfire, we use
                historical burned area and large-fire occurrence; for crop
                health, we build stress labels from vegetation anomalies and
                yield records where available.
              </li>
              <li>
                <strong>Modeling.</strong> A spatio-temporal deep learning
                model (UNet++/transformer-style architecture) predicts risk at
                tile level, calibrated to probabilities between 0 and 1.
              </li>
              <li>
                <strong>Deployment.</strong> Predictions are exposed via a
                FastAPI service and visualized in this Next.js dashboard with
                interactive map layers (Leaflet today, extensible to
                Mapbox/deck.gl).
              </li>
            </ol>

            <p
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
                marginTop: "1rem",
              }}
            >
              For the live presentation, the values shown are deterministic demo
              outputs so we can focus on the workflow, UI and geospatial
              reasoning while large-scale training completes offline.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
