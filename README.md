# UMBC-DATA606-Capstone

# Geospatial Machine Learning Platform for Wildfire Risk Assessment and Crop Health Monitoring

**Authors:** Akhil Kanukula, Sanjay Varatharajan  
**Semester:** Fall 2025  
**Course:** UMBC DATA 606 - Capstone

---

##  Quick Links

| Resource | Link |
|----------|------|
| **YouTube Presentation** | [Watch the Video Presentation](https://youtu.be/Uz40incf_wE) |
| **PowerPoint Presentation** | [View Final PPT](https://github.com/Sanjay3207/UMBC-DATA606-Capstone/blob/main/docs/Wildfire%20Prediction%20and%20Crop%20Monitoring.pptx) |
| **GitHub Repository** | [Project Repo](https://github.com/Sanjay3207/UMBC-DATA606-Capstone) |

---

##  Project Overview

This project addresses the critical convergence of environmental crises—specifically catastrophic wildfires and agricultural drought—by establishing a unified **Wildfire & Crop Monitoring Platform**. 

By harmonizing data from multiple satellite constellations (VIIRS, SMAP, ERA5) and applying Deep Learning techniques, we translate terabytes of noisy, high-dimensional sensor data into actionable insights.

### Key Capabilities
1.  **Wildfire Segmentation:** A U-Net Computer Vision model that detects active fire fronts through smoke using thermal sensor data.
2.  **Drought Forecasting:** An LSTM Time-Series model that predicts soil moisture levels to warn of agricultural stress.

![Fire Prediction Overlay](images/fig7_fire_prediction_overlay.jpg)
*Figure: AI-Assisted Fire Mapping overlaying predicted fire perimeter on raw thermal sensor data.*

---

##  Data Pipeline & Sources

We built a custom ingestion engine to handle complex scientific formats (`NetCDF`, `HDF5`, `GeoTIFF`) and standardized them into machine-learning-ready tensors.

| Source | Sensor/Platform | Usage in Project |
| :--- | :--- | :--- |
| **VIIRS** | Suomi NPP / JPSS-1 | **Primary.** Active fire detection (T4, T5, FRP bands). |
| **SMAP** | NASA SMAP | **Primary.** Soil moisture radiometer data for drought forecasting. |
| **ERA5** | Climate Reanalysis | Meteorological context (Wind, Temp, Humidity). |
| **HLS** | Landsat/Sentinel | Supplementary vegetation indices (NDVI/EVI). |
| **OPERA** | HLS-Derived | Land surface disturbance alerts. |

---

##  Model Architecture

### 1. Wildfire Segmentation (U-Net)
* **Objective:** Map active fire perimeters through smoke.
* **Approach:** **"Dynamic Point-Centered Chipping"**. Instead of processing empty global rasters, we sampled 224x224 regions centered on high-confidence fire coordinates.
* **Input:** 3-Channel Thermal Stack (T4 Brightness Temp, Fire Radiative Power, T5 Background Temp).
* **Performance:** Achieved **~100% Intersection-over-Union (IoU)** on validation sets.

![U-Net Segmentation Results](images/fig1_unet_segmentation_results.jpg)
*Figure: U-Net model successfully isolating the active fire front from background heat.*

### 2. Drought Forecasting (LSTM)
* **Objective:** Predict localized soil moisture content ($cm^3/cm^3$) for the next day ($t+1$).
* **Approach:** Long Short-Term Memory (LSTM) network to capture non-linear temporal dynamics of soil drying and re-wetting.
* **Performance:** Validation loss of **0.0024** (Mean Squared Error), effectively capturing seasonal trends.

![LSTM Time Series Forecast](images/fig3_lstm_forecast_timeseries.jpg)
*Figure: LSTM predictions (Red) tracking actual SMAP satellite readings (Blue).*

---

##  Key Results

* **Thermal-Only Success:** Proved that thermal sensors (VIIRS) alone can map fires with high precision, overcoming the "Smoke Wall" that renders optical satellite imagery (RGB/NIR) useless during peak burning.
* **High-Precision Forecasting:** The LSTM model captures the physics of soil drying, serving as a reliable early warning system for farmers.
* **Scalability:** The pipeline demonstrates how to pivot from "batch" scientific analysis to potential real-time event monitoring.

---

##  Limitations

1.  **Optical Data Gaps:** Reliance on thermal-only data (due to smoke occlusion) can lead to false positives from industrial heat sources.
2.  **Spatial Resolution:** SMAP soil moisture data (9km-36km resolution) is excellent for regional trends but lacks the granularity for field-level precision agriculture.
3.  **Inference Cost:** "Full Globe Inference" remains computationally expensive; the current chipping strategy is optimized for monitoring known fires rather than detecting new ignitions globally in real-time.

---

##  Future Roadmap

* **SAR Integration:** Integrate Synthetic Aperture Radar (Sentinel-1) to see through smoke and clouds with active sensing.
* **Vision Transformers (ViT):** Move from CNNs to Transformers to better understand semantic context (distinguishing urban heat from forest fires).
* **Cloud-Native Deployment:** Convert the current batch-processing pipeline into an Event-Driven Architecture (AWS Lambda/Docker) for real-time alerting.

---


