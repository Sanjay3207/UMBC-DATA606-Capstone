# Geospatial Machine Learning Platform for Wildfire Risk Assessment and Crop Health Monitoring

**Project Title:** Predicting Wildfire Risk, Burned Area, and Crop Health from Satellite Imagery  
**Prepared for:** UMBC Data Science Master’s Capstone (DATA606) — Advisor: Dr. Chaojie Wang  
**Author:** Akhil Kanukula, Sanjay Varatharajan  
**GitHub Repository:** https://github.com/Sanjay3207/UMBC-DATA606-Capstone  
**LinkedIn Profile:** A. www.linkedin.com/in/sanjayv3207  
                      B. https://www.linkedin.com/in/akhil1729/


---

## Background

Wildfires and crop failures pose substantial risks to lives, livelihoods, ecosystems, and national food security. For **wildfires**, utilities, insurers, and emergency managers need **risk maps** to prioritize vegetation management, pre-stage resources, and price risk. For **agriculture**, growers, agribusinesses, and governments need **near–real-time crop health monitoring** to manage inputs, hedge production risk, and mitigate food insecurity.

An **AI-driven geospatial platform** can transform raw satellite data into operational insights at regional to national scale. This project builds such a platform, combining **remote sensing**, **time-series ML**, and a **web application** to deliver wildfire risk layers, burned area maps, crop stress maps, and yield proxies.

---

## Project Objective

This capstone aims to design, implement, and evaluate an **end-to-end geospatial ML platform** that:

1. **Wildfire Segmentation (Post-Event):** Detects burned areas using Sentinel‑2 imagery, validated against MODIS Burned Area labels.  
2. **Wildfire Risk (Pre-Event):** Produces short-horizon risk scores by fusing vegetation/water indices, topography, and fire history.  
3. **Crop Monitoring:** Classifies crop vs. non‑crop (and optionally crop types) and flags **crop stress** using vegetation indices and temporal features.  
4. **Web Delivery:** Serves these layers through a **Next.js + FastAPI** web platform where users draw an AOI and receive map overlays and summary analytics.

---

## Why it Matters

- **Farmers & AgTech:** Field-level stress alerts and yield proxies improve planning and reduce losses.  
- **Insurers & Reinsurers:** Better pricing and portfolio management for wildfire and crop insurance.  
- **Utilities & Public Safety:** Targeted vegetation management and early wildfire warnings can prevent catastrophic events.  
- **Government & NGOs:** Food-security monitoring, disaster response prioritization, and climate‑resilience planning.

---

## Research Questions

1. **Wildfire (Post-Event):** Can a segmentation model trained on Sentinel‑2 predict burned areas that align with MODIS MCD64A1 labels (IoU ≥ baseline)?  
2. **Wildfire (Pre-Event):** Which features (NDVI, NDWI, slope, prior burns, weather proxies) most strongly predict next‑week fire risk?  
3. **Crops:** Can crop/stress classification achieve robust accuracy across regions and seasons?  
4. **Generalization:** How well do models trained in one region transfer to different biomes (cross‑region mIoU/F1)?  
5. **Latency:** Can the pipeline deliver AOI analytics in near real time for practical decision‑making?

---

## Data

The selection of primary data sources for this project was driven by the necessity to fuse high spatial resolution, dense temporal sampling, and specialized predictive features required for a multi-objective geospatial machine learning platform. These sources collectively enable the platform to address segmentation accuracy, feature importance for risk, and model generalization.

### High-Resolution Input and Feature Derivation

The project's foundation is the fusion of Sentinel-2 and HLS (Harmonized Landsat Sentinel-2) products. This pairing was chosen specifically for its $\mathbf{30\text{ meter resolution}}$ and high temporal density, which is paramount for accurate Wildfire Segmentation and Crop Monitoring. The spectral bands from HLS are not used directly, but are transformed into the most powerful predictive features: the Normalized Burn Ratio (NBR), the Enhanced Vegetation Index (EVI), and the Normalized Difference Moisture Index (NDMI). These indices constitute the $\mathbf{5}$ predictive channels of our U-Net, linking subtle changes in land cover and vegetation moisture directly to the model's input. The fidelity of this $\mathbf{30\text{ meter}}$ feature stack is essential for meeting the $\text{IoU}$ baseline established in the research questions.

### Precise Labeling and Latency Requirements

For creating the ground truth, the project pivots to the VIIRS Active Fire product ($\mathbf{375\text{ meter resolution}}$). This choice is strategic, as VIIRS provides high-confidence, near-real-time detections (addressing the project's Latency requirement) which are then rasterized and buffered to form our segmentation labels. This method replaces slower, post-event disturbance masks like OPERA and MODIS MCD64A1, which were found to be inadequate for timely prediction. This fusion allows us to teach the model to predict the presence of a fire based on pre-event land conditions captured by HLS.

### Contextual Risk Modeling and Generalization

The project moves beyond simple segmentation by integrating non-spectral data critical for Wildfire Risk Assessment and Drought Forecasting. SMAP (Soil Moisture Active Passive) products (at $\mathbf{9\text{ km}}$ and $\mathbf{3\text{ km}}$ resolutions) were chosen as they provide indispensable metrics for subsurface moisture and drought conditions, which are leading indicators of fire vulnerability. Similarly, ERA5 Reanalysis data is integrated to provide crucial atmospheric proxies (temperature, wind, humidity) necessary for calculating established fire danger indices. The combination of high-resolution land metrics (HLS) with coarse-resolution environmental context (SMAP, ERA5) is the mechanism by which the project seeks to answer the Generalization Research Question: Can the model learn to predict risk across diverse biomes by understanding the non-spectral drivers of fire?
---

## Data Overview & Dictionary (Model-Ready Tiles)

We will create 512×512 **image tiles** (10 m Sentinel‑2 grid) and aligned **mask tiles** for two tasks: **wildfire segmentation** and **crop segmentation**.

| Field | Type | Description | Example |
|---|---|---|---|
| `tile_id` | string | Unique tile identifier (`y{row}_x{col}`) | `y10240_x2560` |
| `aoi_name` | string | AOI tag for stratified splits | `Sonoma_CA` |
| `acq_date` | date | Mosaic acquisition window mid-date | `2021-08-01` |
| `img_rgbn` | 3–4ch PNG | Sentinel‑2 RGB(+NIR) tile, normalized to [0,1] | `images/y10240_x2560.png` |
| `ndvi` / `ndwi` / `nbr` | float32 rasters | Vegetation & water indices (derived) | stored or recomputed |
| `slope` | float32 raster | From SRTM (reprojected to S2 grid) | optional |
| `burned_mask` | uint8 PNG | 0/1 mask from MODIS MCD64A1 reprojected to S2 grid | `wildfire/masks/*.png` |
| `crop_mask` | uint8 PNG | Crop vs. non‑crop or mapped CDL classes | `crop/masks/*.png` |
| `region_split` | {train,val,test} | Stratified split by region/city | `train` |

> **Targets:**  
> • **Wildfire Segmentation:** `burned_mask ∈ {0,1}`.  
> • **Crop Segmentation:** `crop_mask ∈ {0,…,K}` (start with binary crop vs. non‑crop; optionally map CDL classes to a small K).

---

## Features

- **Spectral:** RGB, NIR, red‑edge; indices: **NDVI**, **NDWI**, **NBR** (if SWIR is added).  
- **Topographic:** **Slope** (from DEM).  
- **Temporal:** Rolling composites (e.g., median of last N weeks), lags, and trend deltas for risk/yield proxies.  
- **Contextual:** Prior burned area, distance to roads/settlements (optional).  
- **Meteorology (optional):** ERA5 temperature, wind, humidity (aggregated to tile).

---

## Methods

1. **ETL & Tiling**  
   - GEE scripts produce AOI mosaics and masks.  
   - Python (rasterio/rioxarray) aligns all rasters to **S2 10 m grid** and generates tiles.

2. **Modeling**  
   - **Wildfire Segmentation:** U‑Net/DeepLabV3+ trained on Sentinel‑2 → target = burned mask (binary).  
   - **Wildfire Risk (Classification/Regression):** Gradient boosting or CNN‑LSTM/Transformer over temporal features to predict short‑horizon risk score or probability of burn.  
   - **Crop Segmentation:** U‑Net/SegFormer; start binary (crop vs. non‑crop), then expand to multi‑class (selected CDL codes).

3. **Evaluation**  
   - **Segmentation:** mIoU, F1, precision/recall.  
   - **Risk:** AUROC/AUPRC (classification) or RMSE/MAE (regression).  
   - **Generalization:** Train on Region A, test on Region B (holdout cities/biomes).  
   - **Latency:** AOI‑to‑result time on the web platform.

4. **Ablations**  
   - Bands only vs. bands + indices vs. + slope.  
   - With/without temporal aggregation.  
   - Binary crop vs. selected multi‑class mapping.  
   - Cross‑region transfer.

---

## Web Platform (System Architecture)

- **Frontend:** **Next.js** with a map viewport. Users **draw/upload AOI**, select a date window, and request layers.  
- **Backend API:** **FastAPI** exposes `/aoi/analyze` → orchestrates: fetch mosaics (cached), tile, **batch inference**, and compose overlays.  
- **Model Serving:** PyTorch models loaded once per worker; tiling/stitching pipeline returns GeoTIFF/PNG overlays + summaries.  
- **Storage:** AOI requests, metadata, and cached rasters in object storage (e.g., S3/GCS); analytics in **PostgreSQL/PostGIS**.  
- **Deployment:** Render/AWS/GCP; horizontal scale by AOI job queue.


---


## Ethics & Responsible AI

- Use only **open** satellite products and properly attribute sources.  
- Document data limitations (e.g., resolution gaps, label uncertainty).  
- Publish a **datasheet/model card** with intended use, failure modes, and fairness considerations (e.g., rural vs. urban performance).

---

## Deliverables

1. **Code Repository:** Reproducible ETL, training scripts, and serving code.  
2. **Datasets:** Instructions + scripts to regenerate AOI tiles and masks.  
3. **Models:** Trained weights, config files, and evaluation reports.  
4. **Web App:** Next.js + FastAPI platform with AOI analytics.  
5. **Report:** IEEE/ACM‑style paper, plus a slide deck and recorded demo.

---

