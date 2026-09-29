import React from 'react';
import { 
  Compass, 
  LayoutDashboard, 
  FolderKanban, 
  UploadCloud, 
  Cpu, 
  MapPin, 
  Download, 
  Info,
  Layers
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, activeProject }) {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Compass },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Drone Imagery', icon: UploadCloud },
    { id: 'processing', label: 'AI Processing', icon: Cpu },
    { id: 'map', label: 'Interactive Map Viewer', icon: MapPin },
    { id: 'exports', label: 'Cadastral Exports', icon: Download },
    { id: 'about', label: 'System & Architecture', icon: Info },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Layers size={22} />
        </div>
        <div>
          <div className="sidebar-title">Urban Cadastre AI</div>
          <div className="sidebar-sub">Drone Parcel Mapping MVP</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {activeProject && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-dark)', background: '#131b2e' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 600 }}>
            Active Survey Project
          </div>
          <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeProject.name}
          </div>
          <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px' }}>
            {activeProject.location}
          </div>
        </div>
      )}

      <div className="sidebar-footer">
        <div>GIS Cadastral AI Engine v1.0</div>
        <div style={{ color: '#64748b', marginTop: '2px' }}>WGS84 EPSG:4326 Ready</div>
      </div>
    </aside>
  );
}
