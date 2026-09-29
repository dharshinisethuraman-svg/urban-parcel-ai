import React, { useState } from 'react';
import { X, Save, RotateCcw, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function EditParcelModal({ 
  project, 
  parcel, 
  onClose, 
  onParcelUpdated 
}) {
  const [parcelNumber, setParcelNumber] = useState(parcel.properties.parcel_number || parcel.id);
  const [landUse, setLandUse] = useState(parcel.properties.land_use || 'Residential');
  const [ownerInfo, setOwnerInfo] = useState(parcel.properties.owner_info || 'Cadastral Municipal Record');
  const [area, setArea] = useState(parcel.properties.area || parcel.properties.area_sqm || 0);
  const [coordsText, setCoordsText] = useState(
    JSON.stringify(parcel.geometry.coordinates, null, 2)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      let parsedCoords;
      try {
        parsedCoords = JSON.parse(coordsText);
      } catch (err) {
        throw new Error("Coordinates must be valid GeoJSON coordinate JSON (e.g. [[[lng, lat], ...]])");
      }

      const updateData = {
        parcel_number: parcelNumber,
        land_use: landUse,
        owner_info: ownerInfo,
        area: parseFloat(area),
        status: "User Corrected",
        geometry: {
          type: parcel.geometry.type || "Polygon",
          coordinates: parsedCoords
        }
      };

      const updated = await api.updateParcel(project.id, parcel.properties.id || parcel.id, updateData);
      onParcelUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToAi = async () => {
    setSaving(true);
    try {
      const updateData = {
        status: "AI Detected"
      };
      const updated = await api.updateParcel(project.id, parcel.properties.id || parcel.id, updateData);
      onParcelUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
              Edit Cadastral Boundary: {parcelNumber}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Current Status: <strong>{parcel.properties.status || 'AI Detected'}</strong>
            </p>
          </div>
          <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {error && (
            <div style={{ padding: '8px 12px', background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Parcel Number
              </label>
              <input
                type="text"
                value={parcelNumber}
                onChange={(e) => setParcelNumber(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Land Use Classification
              </label>
              <select
                value={landUse}
                onChange={(e) => setLandUse(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', background: 'white' }}
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed-Use">Mixed-Use</option>
                <option value="Open Space / Vacant">Open Space / Vacant</option>
                <option value="Public Infrastructure">Public Infrastructure</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Ground Area (sq. meters)
              </label>
              <input
                type="number"
                step="0.1"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Registry Record Notes
              </label>
              <input
                type="text"
                value={ownerInfo}
                onChange={(e) => setOwnerInfo(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Polygon Boundary Coordinates (WGS84 EPSG:4326)
              </label>
              <span style={{ fontSize: '11px', color: '#0284c7' }}>[ [ [lng, lat], ... ] ]</span>
            </div>
            <textarea
              rows={6}
              value={coordsText}
              onChange={(e) => setCoordsText(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                lineHeight: '1.4'
              }}
            />
          </div>

          <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            Saving changes will flag this parcel as <strong>User Corrected</strong>, distinguishing verified surveyor adjustments from automated AI detections.
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-outline" 
            onClick={handleResetToAi} 
            disabled={saving}
            title="Mark back as AI Detected"
          >
            <RotateCcw size={14} />
            <span>Reset to AI</span>
          </button>
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Save Boundary Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
