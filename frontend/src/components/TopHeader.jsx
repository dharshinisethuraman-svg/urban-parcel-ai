import React from 'react';
import { Layers, Play, Sparkles, FolderPlus } from 'lucide-react';

export default function TopHeader({ 
  title, 
  subtitle, 
  projects = [], 
  activeProject, 
  setActiveProject, 
  onQuickDemo,
  onNewUpload 
}) {
  return (
    <header className="top-header">
      <div className="header-title-block">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="header-actions">
        {projects.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Project:</span>
            <select
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                fontFamily: 'inherit',
                maxWidth: '240px',
                background: 'white'
              }}
              value={activeProject ? activeProject.id : ''}
              onChange={(e) => {
                const selected = projects.find((p) => p.id === e.target.value);
                if (selected) setActiveProject(selected);
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.parcels_count || 0} parcels)
                </option>
              ))}
            </select>
          </div>
        )}

        <button 
          className="btn btn-secondary" 
          onClick={onQuickDemo}
          title="Load demonstration flight survey with drone orthomosaic"
        >
          <Sparkles size={16} color="#0284c7" />
          <span>Load Demo Survey</span>
        </button>

        <button 
          className="btn btn-primary" 
          onClick={onNewUpload}
        >
          <FolderPlus size={16} />
          <span>New Survey Upload</span>
        </button>
      </div>
    </header>
  );
}
