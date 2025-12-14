from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Baseline California tiles for a reference year (e.g., 2024) ---
CALIFORNIA_TILES_BASE = [
    {
        "tile_id": "CA-01",
        "region": "Southern California - LA Basin",
        "county": "Los Angeles County",
        "lat": 34.05,
        "lon": -118.25,
        "wildfire_risk": 0.91,
        "crop_stress": 0.38,
        "risk_score": 0.90,
        "notes": "Dense WUI, Santa Ana wind corridor, recent extreme heat anomalies.",
    },
    {
        "tile_id": "CA-02",
        "region": "Santa Ana Foothills",
        "county": "Orange County",
        "lat": 33.79,
        "lon": -117.85,
        "wildfire_risk": 0.87,
        "crop_stress": 0.32,
        "risk_score": 0.88,
        "notes": "Steep topography, dry chaparral, frequent high-wind events.",
    },
    {
        "tile_id": "CA-03",
        "region": "Inland Empire",
        "county": "Riverside County",
        "lat": 33.95,
        "lon": -117.39,
        "wildfire_risk": 0.84,
        "crop_stress": 0.41,
        "risk_score": 0.86,
        "notes": "Rapid urban expansion into wildlands, elevated VPD in summer months.",
    },
    {
        "tile_id": "CA-04",
        "region": "High Desert Interface",
        "county": "San Bernardino County",
        "lat": 34.54,
        "lon": -117.29,
        "wildfire_risk": 0.82,
        "crop_stress": 0.47,
        "risk_score": 0.84,
        "notes": "Sparse vegetation but high wind exposure and legacy burn scars.",
    },
    {
        "tile_id": "CA-05",
        "region": "Ventura Coastal Range",
        "county": "Ventura County",
        "lat": 34.28,
        "lon": -119.29,
        "wildfire_risk": 0.89,
        "crop_stress": 0.36,
        "risk_score": 0.90,
        "notes": "History of large fires (Thomas, Woolsey), strong offshore wind patterns.",
    },
    {
        "tile_id": "CA-06",
        "region": "Santa Barbara Foothills",
        "county": "Santa Barbara County",
        "lat": 34.42,
        "lon": -119.70,
        "wildfire_risk": 0.86,
        "crop_stress": 0.30,
        "risk_score": 0.87,
        "notes": "Chaparral-dominated slopes with episodic downslope wind events.",
    },
    {
        "tile_id": "CA-07",
        "region": "Central Valley - Fresno West",
        "county": "Fresno County",
        "lat": 36.74,
        "lon": -119.79,
        "wildfire_risk": 0.63,
        "crop_stress": 0.81,
        "risk_score": 0.78,
        "notes": "Intensive irrigated agriculture; high crop stress under drought scenarios.",
    },
    {
        "tile_id": "CA-08",
        "region": "Central Valley - Kern North",
        "county": "Kern County",
        "lat": 35.35,
        "lon": -119.02,
        "wildfire_risk": 0.69,
        "crop_stress": 0.77,
        "risk_score": 0.80,
        "notes": "Almond and pistachio orchards; declining groundwater levels.",
    },
    {
        "tile_id": "CA-09",
        "region": "Sacramento Metro Fringe",
        "county": "Sacramento County",
        "lat": 38.58,
        "lon": -121.49,
        "wildfire_risk": 0.74,
        "crop_stress": 0.52,
        "risk_score": 0.78,
        "notes": "Urban-agriculture interface with growing WUI exposure.",
    },
    {
        "tile_id": "CA-10",
        "region": "Sierra Foothills - Auburn",
        "county": "Placer County",
        "lat": 38.90,
        "lon": -121.08,
        "wildfire_risk": 0.88,
        "crop_stress": 0.44,
        "risk_score": 0.89,
        "notes": "Densely forested foothills with legacy fuel build-up.",
    },
    {
        "tile_id": "CA-11",
        "region": "Sierra Foothills - El Dorado",
        "county": "El Dorado County",
        "lat": 38.73,
        "lon": -120.84,
        "wildfire_risk": 0.90,
        "crop_stress": 0.39,
        "risk_score": 0.91,
        "notes": "History of catastrophic fires, steep slopes and canyon winds.",
    },
    {
        "tile_id": "CA-12",
        "region": "Northern Sacramento Valley",
        "county": "Butte County",
        "lat": 39.73,
        "lon": -121.84,
        "wildfire_risk": 0.93,
        "crop_stress": 0.45,
        "risk_score": 0.93,
        "notes": "Paradise/Chico region with extreme fire history and dry downslope winds.",
    },
    {
        "tile_id": "CA-13",
        "region": "Shasta Lake Corridor",
        "county": "Shasta County",
        "lat": 40.59,
        "lon": -122.39,
        "wildfire_risk": 0.89,
        "crop_stress": 0.33,
        "risk_score": 0.89,
        "notes": "Frequent summer lightning activity and low fuel moisture.",
    },
    {
        "tile_id": "CA-14",
        "region": "North Coast - Mendocino Interior",
        "county": "Mendocino County",
        "lat": 39.30,
        "lon": -123.80,
        "wildfire_risk": 0.83,
        "crop_stress": 0.40,
        "risk_score": 0.85,
        "notes": "Mixed conifer-hardwood forests; complex terrain and access.",
    },
    {
        "tile_id": "CA-15",
        "region": "Wine Country - Napa",
        "county": "Napa County",
        "lat": 38.50,
        "lon": -122.32,
        "wildfire_risk": 0.87,
        "crop_stress": 0.56,
        "risk_score": 0.89,
        "notes": "High-value vineyards with recent history of large wildfires.",
    },
    {
        "tile_id": "CA-16",
        "region": "Wine Country - Sonoma",
        "county": "Sonoma County",
        "lat": 38.44,
        "lon": -122.71,
        "wildfire_risk": 0.88,
        "crop_stress": 0.54,
        "risk_score": 0.90,
        "notes": "Wildland-urban interface with strong offshore wind events.",
    },
    {
        "tile_id": "CA-17",
        "region": "Central Coast - Salinas Valley",
        "county": "Monterey County",
        "lat": 36.67,
        "lon": -121.65,
        "wildfire_risk": 0.64,
        "crop_stress": 0.79,
        "risk_score": 0.78,
        "notes": "Intensive row-crop agriculture with periodic water stress.",
    },
    {
        "tile_id": "CA-18",
        "region": "Central Coast - San Luis Obispo",
        "county": "San Luis Obispo County",
        "lat": 35.27,
        "lon": -120.66,
        "wildfire_risk": 0.76,
        "crop_stress": 0.58,
        "risk_score": 0.81,
        "notes": "Coastal range grasslands transitioning to shrublands inland.",
    },
    {
        "tile_id": "CA-19",
        "region": "Bay Area - East Bay Hills",
        "county": "Alameda County",
        "lat": 37.75,
        "lon": -122.16,
        "wildfire_risk": 0.86,
        "crop_stress": 0.29,
        "risk_score": 0.87,
        "notes": "Steep slopes adjacent to dense urban development.",
    },
    {
        "tile_id": "CA-20",
        "region": "Bay Area - Contra Costa Foothills",
        "county": "Contra Costa County",
        "lat": 37.90,
        "lon": -122.04,
        "wildfire_risk": 0.84,
        "crop_stress": 0.31,
        "risk_score": 0.85,
        "notes": "Grass-dominated fuels with rapid drying in late summer.",
    },
    {
        "tile_id": "CA-21",
        "region": "Santa Cruz Mountains",
        "county": "Santa Cruz County",
        "lat": 37.13,
        "lon": -122.09,
        "wildfire_risk": 0.88,
        "crop_stress": 0.37,
        "risk_score": 0.89,
        "notes": "Mixed redwood and chaparral; complex canyon topography.",
    },
    {
        "tile_id": "CA-22",
        "region": "Peninsula - Coastal Ridge",
        "county": "San Mateo County",
        "lat": 37.44,
        "lon": -122.38,
        "wildfire_risk": 0.80,
        "crop_stress": 0.28,
        "risk_score": 0.82,
        "notes": "Narrow ridgetops with limited access and strong wind exposure.",
    },
    {
        "tile_id": "CA-23",
        "region": "Imperial Valley Agriculture",
        "county": "Imperial County",
        "lat": 32.84,
        "lon": -115.57,
        "wildfire_risk": 0.52,
        "crop_stress": 0.88,
        "risk_score": 0.76,
        "notes": "Extreme heat and high ET demand; irrigation-dependent productivity.",
    },
    {
        "tile_id": "CA-24",
        "region": "North Coast Redwood Belt",
        "county": "Humboldt County",
        "lat": 40.80,
        "lon": -124.16,
        "wildfire_risk": 0.71,
        "crop_stress": 0.22,
        "risk_score": 0.72,
        "notes": "High biomass but relatively moist coastal microclimate.",
    },
]


def _clip01(value: float) -> float:
    """Clamp a float to [0, 1] for nicer demo behavior."""
    return max(0.0, min(1.0, value))


def adjust_california_tiles_for_year(year: int):
    """
    Take baseline tiles and nudge risk values up/down depending on year.

    Example behavior:
    - Earlier years (e.g., 2000, 2010): slightly lower risk.
    - Later years (e.g., 2030, 2040): gradually higher risk.
    This is just for demo; real system would use the trained model.
    """
    # Relative to 2024, change ~3% per year
    delta_years = year - 2024
    wildfire_delta = 0.03 * delta_years
    crop_delta = 0.025 * delta_years
    overall_delta = 0.03 * delta_years

    adjusted = []
    for tile in CALIFORNIA_TILES_BASE:
        wf = _clip01(tile["wildfire_risk"] * (1.0 + wildfire_delta))
        cs = _clip01(tile["crop_stress"] * (1.0 + crop_delta))
        rs = _clip01(tile["risk_score"] * (1.0 + overall_delta))

        adjusted.append(
            {
                **tile,
                "wildfire_risk": wf,
                "crop_stress": cs,
                "risk_score": rs,
            }
        )

    return adjusted


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/risk")
def get_risk(state: str = "California", year: int = 2024):
    """
    Hardcoded demo endpoint.
    For California: return 24 tiles whose values vary with 'year'.
    For other states: return a small generic mock dataset.
    """
    if state.lower() == "california":
        tiles = adjust_california_tiles_for_year(year)

        # Simple scenario label for your explanation during the talk
        if year < 2020:
            scenario = "Historical baseline – cooler, slightly lower fire potential."
        elif 2020 <= year <= 2030:
            scenario = "Current climate window – elevated fire potential and crop stress."
        else:
            scenario = "Forward-looking scenario – intensified heat and water stress."

        return {
            "state": "California",
            "year": year,
            "tiles": tiles,
            "meta": {
                "scenario_description": scenario,
                "data_source": "Synthetic demo snapshot derived from satellite + climate features",
                "notes": "Values are fixed algorithmically for presentation; full model training is in progress.",
            },
        }

    # Simple fallback for non-California selections
    generic_tiles = [
        {
            "tile_id": f"{state[:2].upper()}-01",
            "region": f"{state} - Core analysis tile",
            "county": f"{state} County A",
            "lat": 0.0,
            "lon": 0.0,
            "wildfire_risk": 0.45,
            "crop_stress": 0.40,
            "risk_score": 0.48,
            "notes": "Generic placeholder for non-California region.",
        },
        {
            "tile_id": f"{state[:2].upper()}-02",
            "region": f"{state} - Secondary tile",
            "county": f"{state} County B",
            "lat": 0.5,
            "lon": 0.5,
            "wildfire_risk": 0.35,
            "crop_stress": 0.52,
            "risk_score": 0.50,
            "notes": "Use California view for the detailed demo.",
        },
    ]

    return {
        "state": state,
        "year": year,
        "tiles": generic_tiles,
        "meta": {
            "scenario_description": "Generic placeholder scenario.",
            "data_source": "Synthetic placeholder for non-California regions",
            "notes": "Detailed breakdown currently implemented for California only.",
        },
    }
