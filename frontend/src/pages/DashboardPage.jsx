import React, { useEffect, useState } from 'react';
import { 
  FolderKanban, 
  UploadCloud, 
  MapPin, 
  Home, 
  Navigation, 
  Layers, 
  Sparkles, 
  Plus, 
  Trash2, 
  Play, 
  Download,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardPage({ 
  onSelectProject, 
  onNavigateUpload, 
  onNavigateProcessing, 
  onNavigateMap,
  onNavigateExport,
  onQuickDemo 
}) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete project "${name}"?`)) {
      try {
        await api.deleteProject(id);
        fetchStats();
      } catch (err) {
        alert("Failed to delete project: " + err.message);
      }
    }
  };

  if (loading && !stats) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '16px', fontWeight: 600 }}>Loading Dashboard metrics...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Metric Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Projects</div>
            <div className="stat-val">{stats?.total_projects || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <FolderKanban size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Uploaded Imagery</div>
            <div className="stat-val">{stats?.total_images || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
            <UploadCloud size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Detected Parcels</div>
            <div className="stat-val" style={{ color: '#0284c7' }}>{stats?.total_parcels || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Layers size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Building Footprints</div>
            <div className="stat-val" style={{ color: '#ea580c' }}>{stats?.total_buildings || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>
            <Home size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Road Networks</div>
            <div className="stat-val" style={{ color: '#d97706' }}>{stats?.total_roads || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Navigation size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Surveyed Ground Area</div>
            <div className="stat-val" style={{ fontSize: '20px' }}>
              {Math.round(stats?.total_area_surveyed_sqm || 0).toLocaleString()} <span style={{ fontSize: '13px', color: '#64748b' }}>m²</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <MapPin size={22} />
          </div>
        </div>
      </div>

      {/* Action Banner if no projects */}
      {(!stats?.recent_projects || stats.recent_projects.length === 0) && (
        <div className="panel" style={{ padding: '40px 24px', textAlign: 'center', background: '#f8fafc', borderStyle: 'dashed' }}>
          <Layers size={40} color="#0284c7" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>No Survey Projects Yet</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 20px' }}>
            Get started immediately by loading a pre-configured sample drone survey or upload your own drone orthomosaic imagery.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={onQuickDemo}>
              <Sparkles size={16} />
              <span>Load Sample Drone Survey</span>
            </button>
            <button className="btn btn-secondary" onClick={onNavigateUpload}>
              <Plus size={16} />
              <span>Upload Custom Image</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Projects Table */}
      {stats?.recent_projects && stats.recent_projects.length > 0 && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Recent Cadastral Survey Projects</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Select a project to visualize cadastral boundaries or run AI detection
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={onNavigateUpload}>
                <Plus size={15} />
                <span>New Survey</span>
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Imagery</th>
                  <th>Parcels</th>
                  <th>Buildings</th>
                  <th>Roads</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_projects.map((proj) => {
                  const isDone = proj.status === 'completed';
                  return (
                    <tr 
                      key={proj.id} 
                      onClick={() => onSelectProject(proj)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{proj.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {proj.id.substring(0, 8)}...</div>
                      </td>
                      <td>{proj.location || 'Urban Zone'}</td>
                      <td>
                        <span className={`badge ${
                          proj.status === 'completed' ? 'badge-success' : 
                          proj.status === 'running' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {proj.status === 'completed' ? '✓ Processed' : proj.status === 'running' ? '⏳ Processing' : 'Uploaded'}
                        </span>
                      </td>
                      <td>{proj.images_count || 0}</td>
                      <td><strong style={{ color: '#0284c7' }}>{proj.parcels_count || 0}</strong></td>
                      <td><strong style={{ color: '#ea580c' }}>{proj.buildings_count || 0}</strong></td>
                      <td><strong style={{ color: '#d97706' }}>{proj.roads_count || 0}</strong></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(proj.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                          {isDone ? (
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                              onClick={() => {
                                onSelectProject(proj);
                                onNavigateMap();
                              }}
                              title="Open in Interactive Map"
                            >
                              <MapPin size={13} />
                              <span>Map</span>
                            </button>
                          ) : (
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                              onClick={() => {
                                onSelectProject(proj);
                                onNavigateProcessing();
                              }}
                              title="Run AI Processing"
                            >
                              <Play size={13} />
                              <span>Process</span>
                            </button>
                          )}

                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '4px 8px' }}
                            onClick={() => {
                              onSelectProject(proj);
                              onNavigateExport();
                            }}
                            title="Export GeoJSON/CSV"
                          >
                            <Download size={13} />
                          </button>

                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '4px 8px', color: '#ef4444' }}
                            onClick={(e) => handleDelete(proj.id, proj.name, e)}
                            title="Delete Project"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
