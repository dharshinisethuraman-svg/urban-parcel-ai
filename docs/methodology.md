# Cadastral Feature Extraction Methodology & Mathematical Foundations

## 1. Aerial Photogrammetry & Ground Sampling Distance (GSD)
Ground Sampling Distance (GSD) dictates the physical ground dimension represented by a single image pixel:

$$\text{GSD} = \frac{H \cdot S_w}{F \cdot W}$$

Where:
- $H$ = Drone flight altitude above ground level (m)
- $S_w$ = Sensor width (mm)
- $F$ = Focal length (mm)
- $W$ = Image sensor pixel width

In this system, a typical GSD of $\approx 0.08\text{ m/pixel}$ is assumed for standard urban UAV flights at 60–80m AGL, enabling ground area estimation via:

$$\text{Area}_{\text{ground}} = \text{Area}_{\text{pixels}} \times \text{GSD}^2$$

---

## 2. Image Preprocessing & Contrast Enhancement
1. **Bilateral Filtering:** Unlike Gaussian blurring which smooths all high frequencies, bilateral filtering operates on both spatial closeness and radiometric similarity:
   $$I^{\text{filtered}}(x) = \frac{1}{W_p} \sum_{x_i \in \Omega} I(x_i) f_r(\|I(x_i) - I(x)\|) g_s(\|x_i - x\|)$$
   This suppresses micro-textures (grass blades, gravel) while preserving crisp parcel boundary fences and building walls.
2. **CLAHE (Contrast-Limited Adaptive Histogram Equalization):** Applied to the L-channel of the LAB color space to equalize lighting disparities across shadowed and sunlit roof facets.

---

## 3. Parcel Boundary Extraction Pipeline
Cadastral land parcels represent space-filling private subdivisions separated by hedges, walls, pathways, and roads:
1. **Multi-Scale Gradient Operator:** Computes Sobel and Canny gradients across luminance and color saturation channels.
2. **Morphological Closing:** Bridges micro-discontinuities in fence lines using rectangular structuring elements.
3. **Distance Transform & Watershed Segmentation:**
   $$\text{dist}(x) = \min_{y \in \text{Boundary}} \|x - y\|_2$$
   Regional maxima of the distance transform identify core parcel interiors, which serve as topological catchment basins for watershed partitioning.
4. **Douglas-Peucker Polygon Approximation:**
   Simplifies recursive perimeter curves into straight cadastral property boundary lines with tolerance $\varepsilon$:
   $$\varepsilon = 0.02 \times \text{Perimeter}$$

---

## 4. Cadastral Accuracy & Ethical Legal Disclaimer
> **Notice:** AI-generated parcel boundaries are indicative representations created for decision-support and planning. Official land title registration requires ground truth verification by licensed land surveying professionals.
