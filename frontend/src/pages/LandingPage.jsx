import React from 'react';
import { 
  MapPin, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  UploadCloud, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  CheckCircle,
  Eye,
  Sliders,
  Database
} from 'lucide-react';

export default function LandingPage({ 
  onStartMapping, 
  onViewDashboard, 
  onQuickDemo 
}) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 0 48px' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '16px',
        padding: '56px 48px',
        color: 'white',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '40px'
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.35) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, color: '#38bdf8', marginBottom: '20px' }}>
          <Sparkles size={14} />
          <span>Cadastral AI & Drone Photogrammetry Prototype</span>
        </div>

        <h1 style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px', maxWidth: '850px' }}>
          AI-Based Automated Urban Parcel Mapping & Cadastral Feature Extraction
        </h1>

        <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: 1.6, maxWidth: '780px', marginBottom: '32px' }}>
          An intelligent web platform that analyzes high-resolution aerial drone imagery to automatically identify, delineate, and extract cadastral parcels, building footprints, and road corridors. Accelerates municipal parcel mapping with interactive surveyor verification and standard OGC GeoJSON export.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: '12px 24px', fontSize: '15px' }}
            onClick={onStartMapping}
          >
            <UploadCloud size={18} />
            <span>Upload Drone Imagery</span>
            <ArrowRight size={16} />
          </button>

          <button 
            className="btn" 
            style={{ padding: '12px 22px', fontSize: '15px', background: '#0284c7', color: 'white' }}
            onClick={onQuickDemo}
          >
            <Sparkles size={18} />
            <span>Try Sample Drone Survey</span>
          </button>

          <button 
            className="btn btn-outline" 
            style={{ padding: '12px 22px', fontSize: '15px', borderColor: '#475569', color: '#e2e8f0', background: 'rgba(30, 41, 59, 0.5)' }}
            onClick={onViewDashboard}
          >
            <Layers size={18} />
            <span>View Survey Dashboard</span>
          </button>
        </div>
      </section>

      {/* Key Benefits Grid */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>
            Core System Capabilities
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Engineered to streamline cadastral GIS surveying and urban land administration
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div className="panel" style={{ padding: '24px', marginBottom: 0 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <MapPin size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
              Automated Parcel Delineation
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Extracts property subdivision boundaries, compound walls, and fences using edge-preserving bilateral filtering, multi-scale Canny gradients, and distance-transform watershed segmentation.
            </p>
          </div>

          <div className="panel" style={{ padding: '24px', marginBottom: 0 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
              Multi-Class Cadastral Extraction
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Simultaneously detects building footprints via roof spectral analysis (terracotta, concrete slabs, metal roofing) and identifies road thoroughfares for comprehensive urban baseline mapping.
            </p>
          </div>

          <div className="panel" style={{ padding: '24px', marginBottom: 0 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Sliders size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
              Interactive Boundary Editing
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Human-in-the-loop verification allows licensed surveyors to inspect, refine vertex coordinates, modify land-use tags, and distinguish between "AI Detected" and "User Corrected" records.
            </p>
          </div>

          <div className="panel" style={{ padding: '24px', marginBottom: 0 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
              OGC GeoJSON & CSV Export
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Export cadastral boundaries as standard WGS84 RFC 7946 GeoJSON files and attribute CSVs, fully interoperable with QGIS, ArcGIS, MapServer, and municipal databases.
            </p>
          </div>
        </div>
      </section>

      {/* Step-by-Step Workflow */}
      <section className="panel" style={{ padding: '36px 32px', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
          End-to-End Processing Workflow
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', position: 'relative' }}>
          {[
            { step: '1', title: 'Imagery Upload', desc: 'Drone orthomosaic (JPG, PNG, TIFF) validated and geo-bounded.' },
            { step: '2', title: 'Noise Suppression', desc: 'Bilateral filtering removes texture noise while keeping parcel edges sharp.' },
            { step: '3', title: 'Feature Detection', desc: 'Spectral roof analysis & asphalt linear corridor extraction.' },
            { step: '4', title: 'Parcel Delineation', desc: 'Multi-scale gradient and watershed partition into cadastral lots.' },
            { step: '5', title: 'Spatial Topology', desc: 'Associates buildings with containing parcels & assigns land use.' },
            { step: '6', title: 'GIS Vectorization', desc: 'Pixel-to-WGS84 projection and interactive Leaflet map rendering.' },
          ].map((item) => (
            <div key={item.step} style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', margin: '0 auto 10px' }}>
                {item.step}
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Architecture Section */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="panel" style={{ padding: '24px', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Cpu size={20} color="#0284c7" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Technology Architecture</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Frontend:</strong> React 19, Vite, Leaflet interactive mapping, Lucide GIS icon set</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Backend API:</strong> Python, FastAPI asynchronous endpoints, Pydantic data schemas</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Computer Vision:</strong> OpenCV, NumPy, Pillow, Shapely geometry engine</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Database:</strong> SQLite with foreign keys (designed for easy PostGIS / PostgreSQL migration)</span>
            </li>
          </ul>
        </div>

        <div className="panel" style={{ padding: '24px', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <ShieldCheck size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>AI Transparency & Ethics</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
            This application implements a modular computer vision pipeline featuring edge analysis, morphological filtering, and distance transform watershed partitioning. The pipeline interface is modularly architected for drop-in integration with trained deep learning models (U-Net, Mask R-CNN, YOLOv8-seg).
          </p>
          <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '12px', color: '#92400e' }}>
            <strong>Official Surveyor Notice:</strong> Extracted boundaries are advisory and require ground validation by licensed land surveyors before official legal cadastral registration.
          </div>
        </div>
      </section>
    </div>
  );
}
