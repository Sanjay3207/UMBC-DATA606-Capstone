# Geospatial Machine Learning Platform for Wildfire Risk Assessment and Crop Health Monitoring

**Project Title:** Predicting Wildfire Risk, Burned Area, and Crop Health from Satellite Imagery  
**Prepared for:** UMBC Data Science Master’s Capstone (DATA606) — Advisor: Dr. Chaojie Wang  
**Author:** Akhil Kanukula, Sanjay Varatharajan  
**GitHub Repository:** https://github.com/Sanjay3207/UMBC-DATA606-Capstone  
**LinkedIn Profile:** www.linkedin.com/in/sanjayv3207 [Sanjay Varatharajan] &  https://www.linkedin.com/in/akhil1729/ [Akhil Kanukula]


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

## 📊 Data Overview and Dictionary 

The final data architecture is based on fusing high-resolution HLS features with precise VIIRS active fire labels, all aligned to a common **EPSG:32610** grid.

### I. Model Input Features (Predictors: Bands 0–4)

These are the five spectral indices derived from HLS imagery, which form the $\mathbf{5}$ predictive channels of the U-Net. They are stored as **float32** values within the chip NumPy array.

| Field Name | Source | Data Type | Description |
| :--- | :--- | :--- | :--- |
| **EVI** | HLS-VI (Sentinel-2) | `float32` | **Enhanced Vegetation Index:** Measures vegetation health, adjusted for canopy background noise and atmospheric effects. |
| **MSAVI** | HLS-VI (Sentinel-2) | `float32` | **Modified Soil Adjusted Vegetation Index:** Minimizes the influence of bare soil on the vegetation signal. |
| **NBR** | HLS-VI (Sentinel-2) | `float32` | **Normalized Burn Ratio:** The primary index for detecting stressed and burned vegetation (critical for segmentation). |
| **NBR2** | HLS-VI (Sentinel-2) | `float32` | **Secondary Normalized Burn Ratio:** Used to distinguish between severity levels. |
| **NDMI** | HLS-VI (Sentinel-2) | `float32` | **Normalized Difference Moisture Index:** Tracks canopy water content, a key factor in fire readiness. |

***

### II. Model Output Label (Target: Band 5)

This is the ground truth layer for the **Wildfire Segmentation** objective. It is derived from VIIRS vector points and rasterized into our chip.

| Field Name | Source | Spatial Resolution | Description |
| :--- | :--- | :--- | :--- |
| **Fire Mask (Burned Mask)** | VIIRS Active Fire ($\mathbf{375\text{m}}$) | $\mathbf{30\text{m}}$ (Rasterized) | **Binary Label ($\mathbf{0}$ or $\mathbf{1}$):** A pixel is $\mathbf{1}$ if it falls within the $\mathbf{375\text{ meter buffered area}}$ of a high/nominal/low confidence VIIRS active fire point. The target for U-Net segmentation. |

***

### III. Contextual Risk Features (Future Integration)

The following external datasets are prioritized for integration in the next phase to enable **Wildfire Risk Assessment**. They will be aligned temporally and spatially to the chip dataset.

| Data Source | Type | Spatial/Temporal Resolution | Feature Role |
| :--- | :--- | :--- | :--- |
| **SMAP L3 Radiometer** | Soil Moisture (Radiometer) | $\mathbf{9\text{ km}}$ / Daily | **Drought Indicator:** Measures subsurface moisture, a fundamental predictor of fuel availability and fire risk. |
| **ERA5 Reanalysis** | Atmospheric Model Data | Hourly / Global ($\approx\mathbf{31\text{ km}}$) | **Fire Danger Proxies:** Provides critical variables (temperature, relative humidity, wind speed) used to calculate established fire danger indices. |

---

## Features

## Final Feature Inventory (Current Status)

This inventory defines the definitive feature set currently implemented and available in the $\mathbf{32 \times 32}$ chips generated by the pipeline. These features are the direct result of stabilizing the HLS $\to$ VIIRS data flow.

### Level I: Implemented Features (Ready for Model Training)

These are the five spectral indices that constitute the **5 predictor channels** of the U-Net input.

| Category | Feature Name | Data Type | Description |
| :--- | :--- | :--- | :--- |
| **Spectral Indices** | **NBR** | `float32` | Normalized Burn Ratio (Primary index for fire and severity). |
| **Spectral Indices** | **EVI** | `float32` | Enhanced Vegetation Index (Measures vegetation health/density). |
| **Spectral Indices** | **NDMI** | `float32` | Normalized Difference Moisture Index (Tracks canopy water stress). |
| **Spectral Indices** | **MSAVI** | `float32` | Modified Soil Adjusted Vegetation Index (Accounts for soil background). |
| **Spectral Indices** | **NBR2** | `float32` | Secondary Normalized Burn Ratio (Used for distinguishing severity levels). |

***

### Level II: Features Slated for Phase II Integration

These features are required to achieve the **Wildfire Risk** and advanced **Crop Monitoring** objectives and will be added during the feature engineering stage of the modeling phase.

| Category | Feature Name | Source | Integration Status |
| :--- | :--- | :--- | :--- |
| **Meteorology** | **ERA5 (T, Wind, Humidity)** | ERA5 Reanalysis | **Highest Priority.** Required for the **Wildfire Risk** objective. |
| **Topographic** | **Slope / Aspect** | SRTM DEM ($\mathbf{30\text{m}}$) | **Pending.** Requires alignment and resampling of DEM data. |
| **Temporal** | **Rolling Composites / Lags** | HLS/VIIRS Time Series | **Pending.** Requires modifying the pipeline to process multiple dates for calculation. |

---

## Methods

We utilized a multi-stage methodology, shifting from initial, file-based ETL (Extract, Transform, Load) to advanced geospatial processing and culminating in deep learning model setup.

***

## 1. ETL & Data Stabilization Pipeline

The primary challenge was aligning disparate satellite products and resolving data sparsity.

* **Data Sourcing and Alignment:** We successfully fused high-resolution **Sentinel-2/HLS** (30m, for predictors) and **VIIRS Active Fire** (375m, for labels). All subsequent steps align data to the project's target **EPSG:32610 (UTM)** grid.
* **Label Generation (Vector-to-Raster):** We implemented a specialized pipeline to convert vector point data into a usable raster mask:
    * **Filtering:** Applied a numeric filter ($\mathbf{\ge 7}$) to select high-confidence VIIRS points.
    * **Buffering:** Solved the spatial mismatch problem by applying $\mathbf{187.5\text{ meter buffering}}$ to each 375m point using `geopandas`, effectively turning points into area polygons for accurate rasterization.
    * **Rasterization:** Used `rasterio.features.rasterize` to burn the fire polygons onto a $\mathbf{30\text{m}}$ binary label mask.
* **Tiling & Chipping:** We employed a **Dynamic Grid Generator** to precisely extract $\mathbf{32 \times 32}$ chips across the entire image tile (sampling the full image space, rather than a placeholder region).
* **Augmentation:** Applied $\mathbf{8\times}$ geometric transformations (rotations and flips) to the $\mathbf{79}$ positive chips to mitigate the severe class imbalance and expand the training set.

***

## 2. Modeling and Prediction Methods

We adopted specific machine learning architectures designed for semantic segmentation and time-series forecasting.

* **Architecture:** **U-Net** was selected as the core architecture for **Wildfire Segmentation** due to its proven performance in generating precise, pixel-wise masks. 


* **Input Features:** The model is fed $\mathbf{5}$ **Spectral Index Channels** (EVI, NBR, NDMI, etc.), which are the most potent features for predicting land-cover and moisture status.
* **Loss Function:** **Dice Loss** (or a combined Dice + BCE loss) is used during training to effectively handle the extreme scarcity of positive (fire) pixels ($\mathbf{0.12\%}$ class imbalance).
* **Risk Forecasting (Future):** The **Wildfire Risk** objective is slated to use **LSTM (Long Short-Term Memory)** networks or Gradient Boosting models applied to the temporal (lags, composites) and meteorological (ERA5) features.

***

## 3. Evaluation and Generalization Methods

* **Segmentation Metrics:** Model performance is primarily evaluated using **Mean Intersection over Union ($\text{mIoU}$)** and **F1 Score** (Precision and Recall) to assess the spatial accuracy of the predicted burn mask relative to the ground truth.
* **Generalization Testing:** The evaluation plan includes rigorous testing of cross-region transferability, where models trained on one geographic region will be tested on data from a separate, distinct biome to assess robustness.

---

## Web Platform (System Architecture)

1. User Interface and API Core
The system utilizes a two-tier structure for user interaction and service exposure. The Frontend is built with Next.js, providing a responsive web application and a map viewport where users can draw or upload a custom Area of Interest (AOI) and select a specific date window for analysis. This client-side request is routed to the central Backend API, which is exposed via FastAPI through the core endpoint: /aoi/analyze. This endpoint acts as the orchestration layer for all subsequent processing steps.

2. Compute and Inference Pipeline
The FastAPI backend manages the high-load geospatial processing. It first fetches necessary satellite mosaics from storage (leveraging caching), and then initiates the batch inference pipeline. The PyTorch models are maintained and loaded once per worker, minimizing latency overhead. This pipeline is responsible for tiling the fetched mosaics, executing the segmentation or risk prediction models, and stitching the results back together to compose the final data products (GeoTIFF/PNG overlays and summary analytics).

3. Data Persistence and Scalability
Data persistence and deployment are engineered for both scale and geospatial efficiency:

Storage: All large binary files, including raw and cached rasters (mosaics, tiles), are stored in object storage (e.g., AWS S3 or Google Cloud Storage). Analytic results, AOI metadata, and job queues are persisted in a PostgreSQL/PostGIS database, leveraging PostGIS for efficient spatial indexing and query performance.

Deployment: The entire architecture is containerized and deployed on cloud platforms (e.g., Render/AWS/GCP), configured for horizontal scaling managed by an AOI job queue. This ensures the system can handle a high volume of concurrent user requests without degradation in performance.

---


## Ethics & Responsible AI

The platform is governed by a commitment to transparency, accountability, and responsible sourcing, ensuring that the AI outputs are trustworthy and ethically deployed. This commitment is met through three primary channels:

### 1. Data Governance and Attribution

We strictly adhere to using only open-access satellite products, ensuring full attribution of sources (e.g., NASA, Copernicus) and compliance with all public data licenses. A core responsibility is to proactively document all data limitations, including observed resolution gaps, temporal inconsistencies, and the inherent uncertainty present in ground truth labels (e.g., VIIRS point data vs. HLS pixel masks).

### 2. Model Transparency and Accountability

To ensure the responsible use of the predictive layers, the final deliverable will include a comprehensive model card or technical datasheet. This document serves as the foundation for accountability, explicitly detailing the model's intended purpose, its known failure modes, and critical performance metrics.

### 3. Fairness and Performance Evaluation

The model card will contain mandatory fairness considerations focused on spatial generalization. This involves evaluating and reporting performance disparities—such as differences in $\text{mIoU}$ or $\text{F1}$ scores—across distinct ecological or demographic areas (e.g., rural vs. urban performance, cross-region biomes) to ensure the platform’s predictions are reliable across the entire operational domain.

---

## Deliverables

# 🚀 Final Submission Checklist (Assignment 04)

This document outlines the final project deliverables and the required submission structure for the UMBC Data Science Capstone.

---

## I. Core Content Deliverables (What Must Be Built)

These deliverables represent the fully implemented components and documentation required in the code repository.

| Deliverable (Content) | Status | Required Repository Location |
| :--- | :--- | :--- |
| **1. Code Repository** | Fully Implemented | Root Folder (ETL scripts, training scripts) |
| **2. Datasets** | Scripts Completed | Root Folder  |
| **3. Models** | Weights/Reports | Dedicated folder (e.g., `models/`) |
| **4. Web App** | Next.js/FastAPI Code | Dedicated folder (e.g., `app/`) |
| **5. Presentation** | Final PPT + Demo | `docs/` folder (for PPT file) |

---

## II. Final Submission Structure (The Report.md Requirements)

The final project report must adhere to the following strict naming and formatting criteria.

| Requirement | Specification | Compliance Check |
| :--- | :--- | :--- |
| **1. Required File/Location** | `docs/report.md` | Must be a well-formatted Markdown file. |
| **2. Title & Authors** | Title, your name, and "Fall 2025 Semester" | Must be placed at the **very top** of the `report.md` file. |
| **3. External Links (Top)** | Active links to: (a) GitHub Repo, (b) YouTube Video, (c) PPT Presentation File. | Must be placed **immediately after** the Title/Authors section. |
| **4. Report Content** | Must include: Background, Description of Data Sources, Data Elements, **Results of EDA**, **Results of ML**, Conclusion, and Future Research Direction. | All mandatory sections must be present. |
| **5. Submission Link** | External Submission | Submit **only** the link to your main GitHub repository. |

---

**Immediate Next Steps:** Complete the Data Augmentation script and finalize the U-Net architecture. These final steps are necessary to populate the "Results of ML" section of your final `report.md`.

---

