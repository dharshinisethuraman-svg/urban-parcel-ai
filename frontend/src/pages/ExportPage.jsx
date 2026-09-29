import React, { useEffect, useState } from 'react';
import { 
  Download, 
  FileText, 
  Layers, 
  Home, 
  Navigation, 
  CheckCircle,
  Database,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export default function ExportPage({ project }) {
  const [layersData, setLayersData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (project) {
      api.getProjectLayers(project.id)
        .then((data) => setLayersData(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [project]);

  if (!project) {
    return (
      <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>No Project Selected</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Please select a project to export cadastral data.
        </p>
      </div>
    );
  }

  const parcels = layersData?.parcels?.features || [];
  const buildings = layersData?.buildings?.features || [];
  const roads = layersData?.roads?.features || [];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Cadastral Data Export Center</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Download vector datasets and attribute tables formatted for GIS software (QGIS, ArcGIS, MapInfo) and land registries.
        </p>
      </div>

      {/* Export Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Combined GeoJSON */}
        <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '6px' }}>
                <Layers size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Combined Cadastral GeoJSON</h3>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RFC 7946 Standard • EPSG:4326</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Contains all detected layers: parcels, buildings, and roads with topological properties and legal surveyor disclaimers.
            </p>
          </div>
          <a
            className="btn btn-primary"
            style={{ width: '100%', textDecoration: 'none' }}
            href={api.getExportGeoJsonUrl(project.id, 'combined')}
            download
          >
            <Download size={15} />
            <span>Download Combined GeoJSON ({parcels.length + buildings.length + roads.length} features)</span>
          </a>
        </div>

        {/* Parcels GeoJSON */}
        <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '6px' }}>
                <Layers size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Parcel Boundaries GeoJSON</h3>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Polygon Features • {parcels.length} lots</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Individual land lots with calculated ground area ($m^2$), perimeter ($m$), survey status, and land-use classification.
            </p>
          </div>
          <a
            className="btn btn-secondary"
            style={{ width: '100%', textDecoration: 'none' }}
            href={api.getExportGeoJsonUrl(project.id, 'parcels')}
            download
          >
            <Download size={15} />
            <span>Download Parcels GeoJSON</span>
          </a>
        </div>

        {/* Buildings GeoJSON */}
        <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ background: '#ffedd5', color: '#ea580c', padding: '8px', borderRadius: '6px' }}>
                <Home size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Building Footprints GeoJSON</h3>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Polygon Features • {buildings.length} footprints</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Building rooftop polygons, classification (residential/commercial), roof material type, and containing parent parcel IDs.
            </p>
          </div>
          <a
            className="btn btn-secondary"
            style={{ width: '100%', textDecoration: 'none' }}
            href={api.getExportGeoJsonUrl(project.id, 'buildings')}
            download
          >
            <Download size={15} />
            <span>Download Buildings GeoJSON</span>
          </a>
        </div>

        {/* Parcel Attributes CSV */}
        <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ background: '#ecfdf5', color: '#10b981', padding: '8px', borderRadius: '6px' }}>
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Parcel Registry CSV Table</h3>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Spreadsheet / Municipal Tabular</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Tabular spreadsheet of all lots including Parcel ID, Area ($m^2$), Perimeter ($m$), AI Confidence, Status, and Registry Notes.
            </p>
          </div>
          <a
            className="btn btn-success"
            style={{ width: '100%', textDecoration: 'none' }}
            href={api.getExportCsvUrl(project.id, 'parcels')}
            download
          >
            <Download size={15} />
            <span>Download Parcels CSV</span>
          </a>
        </div>
      </div>

      {/* Attribute Preview Table */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Extracted Cadastral Registry Preview</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing {parcels.length} parcel boundary records detected in this survey
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Parcel Number</th>
                <th>Ground Area (m²)</th>
                <th>Perimeter (m)</th>
                <th>AI Confidence</th>
                <th>Survey Status</th>
                <th>Land Use</th>
                <th>Registry Notes</th>
              </tr>
            </thead>
            <tbody>
              {parcels.slice(0, 10).map((p, idx) => {
                const props = p.properties || {};
                const isCorrected = props.status === 'User Corrected';
                return (
                  <tr key={idx}>
                    <td><strong>{props.parcel_number || p.id}</strong></td>
                    <td>{Number(props.area || props.area_sqm || 0).toLocaleString()}</td>
                    <td>{Number(props.perimeter || props.perimeter_m || 0).toLocaleString()}</td>
                    <td>{Math.round((props.confidence || 0.85) * 100)}%</td>
                    <td>
                      <span className={`badge ${isCorrected ? 'badge-warning' : 'badge-info'}`}>
                        {props.status || 'AI Detected'}
                      </span>
                    </td>
                    <td>{props.land_use || 'Residential'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {props.owner_info || 'Cadastral Municipal Record'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {parcels.length > 10 && (
            <div style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', background: '#f8fafc' }}>
              Showing first 10 of {parcels.length} parcels. Download full CSV or GeoJSON to view all records.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
