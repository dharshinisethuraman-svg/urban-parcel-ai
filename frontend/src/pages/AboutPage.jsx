import React from 'react';
import { 
  Info, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  ArrowRight,
  Code,
  FileCheck2
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>
          System Methodology & Technical Architecture
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          AI-Based Automated Urban Parcel Mapping and Cadastral Feature Extraction System using Drone Imagery
        </p>
      </div>

      {/* Official Legal Disclaimer Box */}
      <div style={{ padding: '16px 20px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', color: '#92400e', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
          <ShieldCheck size={18} color="#d97706" />
          <span>Cadastral Accuracy & Legal Notice</span>
        </div>
        <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
          AI-generated parcel boundaries and building footprints are indicative representations designed for <strong>decision-support and planning workflows</strong>. They do not constitute legally binding cadastral surveys. All extracted boundaries require verification and formal ground-truthing by authorized cadastral and surveying professionals before official registration in land administration systems.
        </p>
      </div>

      {/* AI Model Architecture & Transparency */}
      <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Cpu size={20} color="#0284c7" />
          <h3 style={{ fontSize: '17px', fontWeight: 700 }}>AI Transparency & Modular Architecture</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '14px' }}>
          To ensure scientific integrity, the system clearly specifies its detection engine:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#0284c7', marginBottom: '6px' }}>
              ✓ Current Implementation: CV Prototype
            </div>
            <ul style={{ fontSize: '12px', color: 'var(--text-muted)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>• Contrast-Limited Adaptive Histogram Equalization (CLAHE)</li>
              <li>• Edge-preserving Bilateral Noise Filtering</li>
              <li>• Spectral HSV rooftop segmentation</li>
              <li>• Multi-scale Canny gradient & morphological closing</li>
              <li>• Distance transform & watershed cadastral partitioning</li>
              <li>• Douglas-Peucker polygon approximation</li>
            </ul>
          </div>

          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#10b981', marginBottom: '6px' }}>
              🚀 Future Drop-In Model Roadmap
            </div>
            <ul style={{ fontSize: '12px', color: 'var(--text-muted)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>• <strong>U-Net Segmentation:</strong> Trained on aerial land cover datasets</li>
              <li>• <strong>YOLOv8-seg / Mask R-CNN:</strong> Instance segmentation for roofs</li>
              <li>• <strong>SAM (Segment Anything):</strong> Zero-shot parcel prompting</li>
              <li>• <strong>DEM / DSM Photogrammetry:</strong> Elevation-based building heights</li>
              <li>• <strong>PostGIS Integration:</strong> Spatial indexing & topology tables</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Photogrammetry & Mathematical Principles */}
      <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <BookOpen size={20} color="#6366f1" />
          <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Photogrammetric & Mathematical Foundations</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>1. Ground Sampling Distance (GSD):</strong>
            <p style={{ marginTop: '2px' }}>
              GSD represents the real-world distance between pixel centers. For drone flights at flight altitude $H$, sensor width $S_w$, focal length $F$, and image width $W$:
            </p>
            <div style={{ padding: '8px 12px', background: '#f1f5f9', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px', margin: '6px 0', color: '#0f172a' }}>
              GSD = (H × S_w) / (F × W)  ≈ 0.05m to 0.10m / pixel
            </div>
          </div>

          <div>
            <strong style={{ color: 'var(--text-main)' }}>2. Pixel-to-WGS84 Coordinate Transformation:</strong>
            <p style={{ marginTop: '2px' }}>
              Every pixel $(x, y)$ in the drone orthomosaic is mapped to longitude and latitude using affine geographic bounding constraints:
            </p>
            <div style={{ padding: '8px 12px', background: '#f1f5f9', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px', margin: '6px 0', color: '#0f172a' }}>
              λ = West + (x / W) × (East - West)<br/>
              φ = North - (y / H) × (North - South)
            </div>
          </div>

          <div>
            <strong style={{ color: 'var(--text-main)' }}>3. Douglas-Peucker Polygon Simplification:</strong>
            <p style={{ marginTop: '2px' }}>
              Raw pixel contours contain hundreds of stair-step vertices. The Douglas-Peucker algorithm simplifies the perimeter into clean polygonal cadastral boundaries with an error tolerance $\varepsilon = 0.02 \times \text{Perimeter}$.
            </p>
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Verification */}
      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <FileCheck2 size={20} color="#ea580c" />
          <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Human-in-the-Loop Surveyor Verification</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          The application follows an active verification workflow. Automatically extracted parcels are initially tagged as <code>AI Detected</code>. Licensed surveyors can select any lot, inspect calculated areas, adjust vertices, and modify land use classifications. Once saved, the database updates the status to <code>User Corrected</code>, providing an audit trail for municipal land records.
        </p>
      </div>
    </div>
  );
}
