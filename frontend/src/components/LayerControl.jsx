import React from 'react';
import { Layers, Sliders, Eye, EyeOff } from 'lucide-react';

export default function LayerControl({
  layersState,
  setLayersState,
  imageryOpacity,
  setImageryOpacity,
  basemap,
  setBasemap,
  stats
}) {
  const toggle = (layerKey) => {
    setLayersState((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  return (
    <div className="map-floating-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}>
          <Layers size={17} color="#0284c7" />
          <span>Cadastral Layers</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GIS View</span>
      </div>

      <div className="layer-toggle">
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}>
          <input
            type="checkbox"
            checked={layersState.imagery}
            onChange={() => toggle('imagery')}
            style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
          <span className="color-swatch" style={{ background: '#38bdf8' }} />
          <span>Drone Orthomosaic</span>
        </label>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Raster</span>
      </div>

      {layersState.imagery && (
        <div style={{ padding: '6px 8px 10px', background: '#f8fafc', borderRadius: '4px', margin: '4px 0 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>Imagery Opacity</span>
            <span>{Math.round(imageryOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={imageryOpacity}
            onChange={(e) => setImageryOpacity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
        </div>
      )}

      <div className="layer-toggle">
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}>
          <input
            type="checkbox"
            checked={layersState.parcels}
            onChange={() => toggle('parcels')}
            style={{ accentColor: '#0284c7', cursor: 'pointer' }}
          />
          <span className="color-swatch" style={{ background: '#0284c7', border: '1px solid #0369a1' }} />
          <span>Parcel Boundaries</span>
        </label>
        <span className="badge badge-info" style={{ fontSize: '10px' }}>
          {stats?.parcels_count || 0}
        </span>
      </div>

      <div className="layer-toggle">
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}>
          <input
            type="checkbox"
            checked={layersState.buildings}
            onChange={() => toggle('buildings')}
            style={{ accentColor: '#ea580c', cursor: 'pointer' }}
          />
          <span className="color-swatch" style={{ background: '#ea580c' }} />
          <span>Building Footprints</span>
        </label>
        <span className="badge badge-warning" style={{ fontSize: '10px' }}>
          {stats?.buildings_count || 0}
        </span>
      </div>

      <div className="layer-toggle">
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}>
          <input
            type="checkbox"
            checked={layersState.roads}
            onChange={() => toggle('roads')}
            style={{ accentColor: '#eab308', cursor: 'pointer' }}
          />
          <span className="color-swatch" style={{ background: '#eab308' }} />
          <span>Road Network</span>
        </label>
        <span className="badge" style={{ fontSize: '10px', background: '#fef08a', color: '#854d0e' }}>
          {stats?.roads_count || 0}
        </span>
      </div>

      <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
          Basemap Style
        </div>
        <select
          value={basemap}
          onChange={(e) => setBasemap(e.target.value)}
          style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', background: 'white' }}
        >
          <option value="carto">CartoDB Positron (Clean Light)</option>
          <option value="osm">OpenStreetMap Standard</option>
          <option value="satellite">ESRI World Imagery (Satellite)</option>
        </select>
      </div>
    </div>
  );
}
