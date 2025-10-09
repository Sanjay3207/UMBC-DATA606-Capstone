# Geospatial Machine Learning Platform for Wildfire Risk Assessment and Crop Health Monitoring
**Author:** Akhil Kanukula, Sanjay Varatharajan
**Window:** 2024-07-20 → 2024-08-20 (all datasets except ERA5, which includes 2024-07-01 and 2024-08-01 snapshots)  
**AOI:** California (statewide bounding box; ERA5 clipped to lon −125 to −113, lat 32.0 to 42.5)

---

## 1) Goals & Overview
- Build a **repeatable** workflow to access NASA/partner EO datasets, verify **metadata**, and run **exploratory data analysis (EDA)** focused on California fire conditions.
- Produce **small CSVs & figures** for each dataset so results are easy to inspect, compare, and extend.
- Integrate **feature engineering** inside EDA to generate interpretable daily signals (temperature, wind, humidity, vegetation condition, soil moisture, detections, FRP, active pixels, burn day context).

**Key outcomes**  
- A consistent set of **daily features** describing fire drivers (weather, fuels) and activity (detections, FRP, active pixels).  
- Validated data integrity (CRS, nodata/fill codes, shapes, expected ranges).  
- A coherent multi-sensor story: **late July → early August** shows higher VIIRS activity during **warmer** conditions with **drier fuels / lower vegetation indices** where coverage exists.

---

## 2) Data Access & Reproducibility (brief)
- **Versioned scripts** tracked with Git; parameters (AOI, dates, collections) documented alongside.
- **Non-interactive auth** via `_netrc` (app password), with DAAC apps pre-authorized in Earthdata Login.
- **Robust transfers**: follow redirects, retry, resume; write success/failure logs per dataset.
- **Structured outputs**: each dataset has `Data/` and `_metadata/` or logs; conversions (e.g., MODIS HDF4 → GeoTIFF) done in a dedicated conda env and then processed in the main Python 3.12 env.
- **Reproducibility files**: keep `urls.txt` and `PARAMS.md` (dates; AOI) to recreate pulls exactly.

---

## 3) Datasets & Purpose
- **ERA5** — *weather background & drivers* (t, u, v, q, r, cc, z at 1000/850 hPa)
- **HLS (Harmonized Landsat–Sentinel-2)** — *vegetation condition & fuel stress* (NDVI, EVI, NBR tiles)
- **MODIS MCD64A1 Burned Area** — *monthly burn timing & extent* (Burn Date DOY)
- **VIIRS L2 Swath (SNPP & JPSS-1, 375 m)** — *point detections & intensity* (lat/lon, FRP, confidence, T4/T5)
- **VIIRS L3 Daily (1 km)** — *areal activity signal* (FireMask → active pixels/share)
- **SMAP (9 km & 36 km)** — *soil moisture / fuel availability*
- **OPERA** — *context/disturbance masks*

Folder roots (examples):
- `D:\606Data\ERA5\...`
- `D:\606Data\HLS_Dataset\Data\...`
- `D:\606Data\MODISTera_GEOTIFF_File\...`
- `D:\606Data\VIIRSNPP_ActiveFires_6Min_L2Swath_375m_V002\...`
- `D:\606Data\VIIRSJPSS1_Active_Fires_6Min_L2Swath_375m_V002\...`
- `D:\606Data\VIIRSNPP_Thermal_Anomalies_and_Fire_Daily_L3_Global_1km_SIN_rid_V002\...`
- `D:\606Data\SMAP_Enhanced_L3_Radiometer_Global_and_PolarGrid_Daily_9km_EASE_Grid_SoilMoisture_V006\...`
- `D:\606Data\SMAP_L3_Radiometer_Global_Daily_36km_EAS_Grid_Soil_Moisture_V009\...`
- `D:\606Data\OPERA_Dataset\Data\...`

---

## 4) Metadata Sweep (what was checked)
- **Dimensions/coordinates**, **CRS & pixel size**, **nodata/fill codes**, **date coverage**, **basic value counts**.
- Outputs saved in each dataset’s `_metadata/` folder, e.g.:
  - ERA5: `_metadata/era5_metadata_summary.csv` and per-file `variables_units.json`  
  - HLS: `_metadata/hls_geotiff_metadata.csv`, `_metadata/hls_qa_value_counts.csv`  
  - MODIS BA: `_metadata/modis_ba_geotiff_metadata.csv`, `_metadata/modis_ba_geotiff_doy_counts.csv`  
  - VIIRS L2/JPSS/NPP: `_metadata/viirs_*__metadata/*.csv` summaries  
  - VIIRS L3: `_metadata/viirs_l3_file_summary.csv`, `_metadata/viirs_l3_value_counts.csv`  
  - SMAP/OPERA: per-dataset summary CSVs with shapes, nodata and quick stats

**Outcome:** sanity checks passed (CRS consistent within product families; nodata handled; expected ranges).

---

## 5) EDA (with integrated features) — results by dataset

### 5.1 ERA5 — *weather background & drivers*
**Methods**
- Convert longitudes to ±180; clip to CA bbox.
- Map **temperature** at **1000/850 hPa** for **2024-07-01** and **2024-08-01**.
- CA means for: temperature (`t`), **wind speed** (`ws = √(u²+v²)`), **specific/relative humidity** (`q`/`r`), **cloud cover** (`cc`), **geopotential height** (`gh = z/g`) at **1000/850 hPa**.

**Features (daily, CA-mean)**
- `t_1000`, `t_850`, `ws_1000`, `ws_850`, `rh_1000`, `rh_850`, `cc_mean`, `gh_1000`, `gh_850` (+ optional z-scores).

**Findings (qualitative)**
- **August 1** warmer and slightly **drier** than **July 1**; inland areas show higher temps and lower cloud cover.  
- Wind differences modest, but patterns are meteorologically consistent.

> Plots/CSVs: `.../ERA5/_eda/era5_CA_summary_timeseries.csv`, `era5_t_CA_{level}_{date}.png`, `era5_CA_timeseries_{var}.png`

---

### 5.2 HLS — *vegetation condition & fuel stress (NDVI/EVI/NBR)*
**Methods**
- Validate tiles (CRS, nodata); parse dates from filenames.
- Aggregate **daily CA means** for **NDVI**, **EVI**, **NBR**; track coverage.
- Optional: **ΔNDVI(7d)** & z-scores.

**Features**
- `ndvi_mean`, `evi_mean`, `nbr_mean`, optional `d_ndvi_7d` (daily).

**Findings (qualitative)**
- Seasonal **drying** signal into early August: lower NDVI/EVI in portions of CA.  
- **NBR** variations co-occur with later **VIIRS activity** in some tiles.

> Plots/CSVs: `.../HLS_Dataset/Data/HLS_prod_summary.csv`, `HLS_prod_date_span.csv`, `HLS_monthly_counts.csv`, `HLS_QA_value_counts_by_product.csv`

---

### 5.3 MODIS MCD64A1 Burned Area — *monthly burn timing & extent*
**Methods**
- Convert **Burn Date** SDS to GeoTIFF (HDF4 → GeoTIFF via GDAL).  
- Mask zeros/fills; build **DOY histograms** per tile; compute **percent-burned**.

**Features**
- Tile-level `pct_burned_tile`, statewide `pct_burned_tile_mean` (month) → broadcast to days in that month.

**Findings (qualitative)**
- July burn timing clustered **~DOY 202–233** in our tiles.  
- Statewide **percent-burned** is low–moderate, with hotspots aligning with **active VIIRS days**.

> Plots/CSVs: `.../MODISTera_GEOTIFF_File/_metadata/modis_ba_geotiff_metadata.csv`, `modis_ba_geotiff_doy_counts.csv`, `MODIS_BA_monthly_summary.csv`

---

### 5.4 VIIRS L2 Swath (SNPP & JPSS-1; 375 m) — *point detections & intensity*
**Methods**
- Extract **lat/lon**, **FRP**, **confidence**, **T4/T5**; filter to CA.
- Scatter maps colored by **FRP**/**confidence**; preview detection tables.
- Compute **daily**: counts, **FRP sums**, **mean confidence**; plus **quality-filtered counts** (confidence ≥ 50).

**Features (daily)**
- `l2_detections`, `l2_frp_sum`, `l2_conf_mean`, `l2_detections_q50`.

**Findings (qualitative)**
- **Late July → early August** shows **clear spikes** in detections and **FRP**.  
- Quality-filtered counts **track** raw counts → spikes are not driven by low-confidence hits.

> Plots/CSVs: `.../VIIRSNPP_*__metadata/*.csv`, `.../VIIRSJPSS1_*__metadata/*.csv`, daily tables/plots saved per script

---

### 5.5 VIIRS L3 Daily (1 km) — *areal activity signal (FireMask)*
**Methods**
- Reduce **FireMask** to **active-pixel counts** and **active share** per day; optional 7-day MA.

**Features (daily)**
- `active_pix`, `active_share`, optional `active_pix_ma7`.

**Findings (qualitative)**
- Daily **active-pixel** peaks **align** with VIIRS L2 detection spikes, confirming a **coherent daily fire signal** at 1 km.

> Plots/CSVs: `.../VIIRSNPP_Thermal_Anomalies.../VIIRS_L3__metadata/viirs_l3_file_summary.csv`, `viirs_l3_value_counts.csv`, `VIIRS_L3_monthly_summary.csv`

---

### 5.6 SMAP (9 km & 36 km) — *soil moisture / fuel availability*
**Methods**
- Daily CA mean soil moisture at **9 km** and **36 km**; optional anomalies/z-scores.

**Features (daily)**
- `smap9_mean`, `smap36_mean` (+ optional anomalies).

**Findings (qualitative)**
- Soil moisture is **low** during high summer; not elevated on high-activity days—consistent with **dry fuels**.

> Plots/CSVs: `.../SMAP9__metadata/*.csv`, `.../SMAP36__metadata/*.csv`

---

### 5.7 OPERA — *context/disturbance masks*
**Methods**
- Validate rasters; apply **nodata/fill** masks; compute **value counts**; quick previews.  
- Use as **overlays** to exclude disturbed/invalid areas from vegetation/soil summaries.

**Features**
- Scene-level `opera_mask_share` or binary overlays per analysis step.

**Findings (qualitative)**
- Masks are **near-binary** with expected sparse structure; suitable for QC/exclusion use.

---

## 6) Cross‑Dataset Synthesis (California, 2024‑07‑20 → 2024‑08‑20)
- **Activity peaks** (VIIRS L2 detections, VIIRS L3 active share) occur **late July → early August**.
- These align with **warmer** and **slightly drier** **ERA5** conditions.  
- Where coverage exists, **HLS** indicates **vegetation stress** (lower NDVI/EVI; NBR changes).  
- **SMAP** background is **dry**, consistent with increased fire susceptibility.  
- **MODIS BA** provides monthly burn timing (**DOY ~202–233**) that matches spatial areas with higher daily activity.

---

## 7) What’s Next
- Refine **California mask** (official boundary) for ERA5/HLS/SMAP rollups.  
- Add **sub‑regional** splits (e.g., ecoregions) to localize signals.  
- Harmonize daily features into a single **CA_daily_features.csv** and run simple **correlations** / **lag analyses**.  
- Compare **confidence‑filtered** vs. raw VIIRS trends; evaluate thresholds.  
- Optional: join **weather anomalies** (z‑scores) and **ΔNDVI** to activity spikes to test simple predictors.

---

## 8) Reproducibility Notes
- Keep `urls.txt`, `PARAMS.md` (AOI, dates), `_netrc` (never committed), and logs.  
- Conversion (e.g., HDF4→GeoTIFF) is scripted via `conda run -n geo gdal_translate` and recorded.  
- All derived CSVs/charts saved under each dataset’s `_metadata` or `_eda` directories.
