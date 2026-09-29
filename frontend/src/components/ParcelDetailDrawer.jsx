import React from 'react';
import { X, Edit3, ShieldCheck, CheckCircle2, Home, Compass } from 'lucide-react';

export default function ParcelDetailDrawer({ 
  parcel, 
  onClose, 
  onEdit 
}) {
  if (!parcel) return null;

  const props = parcel.properties || {};
  const areaSqm = props.area || props.area_sqm || 0;
  const areaSqFt = Math.round(areaSqm * 10.7639);
  const isUserCorrected = props.status === 'User Corrected';

  return (
    <div className="feature-drawer">
      <div className="drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '6px', borderRadius: '6px' }}>
            <Home size={18} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              {props.parcel_number || 'Parcel Details'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Cadastral Property Subdivision
            </div>
          </div>
        </div>
        <button 
          className="btn btn-outline" 
          style={{ padding: '4px 6px', border: 'none' }} 
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={`badge ${isUserCorrected ? 'badge-warning' : 'badge-info'}`}>
            {isUserCorrected ? '✍️ User Corrected' : '🤖 AI Detected'}
          </span>
          <span className="badge badge-success">
            Confidence: {Math.round((props.confidence || 0.85) * 100)}%
          </span>
        </div>
      </div>

      <div className="drawer-field">
        <span className="drawer-field-key">Ground Area:</span>
        <span className="drawer-field-val">
          {Number(areaSqm).toLocaleString()} m² <span style={{ fontSize: '11px', color: '#64748b' }}>({areaSqFt.toLocaleString()} sq ft)</span>
        </span>
      </div>

      <div className="drawer-field">
        <span className="drawer-field-key">Perimeter:</span>
        <span className="drawer-field-val">
          {Number(props.perimeter || props.perimeter_m || 0).toLocaleString()} m
        </span>
      </div>

      <div className="drawer-field">
        <span className="drawer-field-key">Land Use:</span>
        <span className="drawer-field-val">{props.land_use || 'Residential'}</span>
      </div>

      <div className="drawer-field">
        <span className="drawer-field-key">Registry Reference:</span>
        <span className="drawer-field-val" style={{ fontSize: '12px' }}>
          {props.owner_info || 'Cadastral Municipal Record'}
        </span>
      </div>

      <div className="drawer-field">
        <span className="drawer-field-key">Coordinates:</span>
        <span className="drawer-field-val" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          {parcel.geometry?.coordinates?.[0]?.length || 4} boundary vertices
        </span>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%' }} 
          onClick={() => onEdit(parcel)}
        >
          <Edit3 size={15} />
          <span>Edit Parcel Boundary</span>
        </button>
      </div>
    </div>
  );
}
