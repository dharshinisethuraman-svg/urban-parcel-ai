import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Play, 
  RotateCw,
  Terminal,
  Layers,
  Home,
  Navigation
} from 'lucide-react';
import { api } from '../services/api';

export default function ProcessingPage({ 
  project, 
  onNavigateMap 
}) {
  const [jobStatus, setJobStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [layersData, setLayersData] = useState(null);
  const pollingRef = useRef(null);

  const steps = [
    { id: 1, label: 'Image Preprocessing', threshold: 10 },
    { id: 2, label: 'Road Network Detection', threshold: 30 },
    { id: 3, label: 'Building Footprints', threshold: 50 },
    { id: 4, label: 'Parcel Delineation', threshold: 70 },
    { id: 5, label: 'Spatial Topology', threshold: 85 },
    { id: 6, label: 'Vector Generation', threshold: 100 },
  ];

  const pollStatus = async () => {
    if (!project) return;
    try {
      const statusData = await api.getProcessingStatus(project.id);
      setJobStatus(statusData);

      if (statusData.status === 'completed') {
        setIsProcessing(false);
        if (pollingRef.current) clearInterval(pollingRef.current);
        // Fetch generated layers
        const lData = await api.getProjectLayers(project.id);
        setLayersData(lData);
      } else if (statusData.status === 'failed') {
        setIsProcessing(false);
        setError(statusData.error_message || 'Processing failed');
        if (pollingRef.current) clearInterval(pollingRef.current);
      }
    } catch (err) {
      // If 404, not started yet
    }
  };

  const handleStartProcessing = async () => {
    if (!project) return;
    setIsProcessing(true);
    setError(null);
    try {
      await api.startProcessing(project.id);
      // Start polling every 1 second
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(pollStatus, 1000);
      pollStatus();
    } catch (err) {
      setIsProcessing(false);
      setError(err.response?.data?.detail || err.message);
    }
  };

  useEffect(() => {
    if (project) {
      pollStatus();
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [project]);

  if (!project) {
    return (
      <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>No Project Selected</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Please select a survey project from the top header or create a new upload.
        </p>
      </div>
    );
  }

  const progressPct = jobStatus ? jobStatus.progress_pct : 0;
  const isCompleted = jobStatus?.status === 'completed';
  const logs = jobStatus?.logs || [];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>AI Cadastral Processing Engine</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Project: <strong>{project.name}</strong> • Location: {project.location}
          </p>
        </div>

        <div>
          {!isProcessing && !isCompleted && (
            <button 
              className="btn btn-primary" 
              onClick={handleStartProcessing}
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              <Play size={16} />
              <span>Start AI Extraction</span>
            </button>
          )}

          {isCompleted && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleStartProcessing}
                title="Re-run AI pipeline"
              >
                <RotateCw size={15} />
                <span>Re-run Analysis</span>
              </button>

              <button 
                className="btn btn-success" 
                onClick={onNavigateMap}
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                <MapPin size={16} />
                <span>Open Interactive Map</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} />
          <div>
            <strong>Processing Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Progress Stepper Bar */}
      <div className="panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="#0284c7" />
            <span style={{ fontSize: '14px', fontWeight: 700 }}>
              {isCompleted ? 'Analysis Completed' : isProcessing ? 'Analysis in Progress' : 'Ready to Analyze'}
            </span>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
            {progressPct}%
          </span>
        </div>

        {/* Progress Bar Line */}
        <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '28px' }}>
          <div 
            style={{ 
              width: `${progressPct}%`, 
              height: '100%', 
              background: isCompleted ? 'var(--emerald)' : 'linear-gradient(90deg, #0284c7, #38bdf8)', 
              transition: 'width 0.4s ease' 
            }} 
          />
        </div>

        {/* Step Nodes */}
        <div className="progress-stepper">
          {steps.map((st) => {
            const isStepDone = progressPct >= st.threshold;
            const isStepActive = progressPct < st.threshold && progressPct >= (st.threshold - 20);
            return (
              <div 
                key={st.id} 
                className={`step-node ${isStepDone ? 'completed' : isStepActive ? 'active' : ''}`}
              >
                <div className="step-circle">
                  {isStepDone ? <CheckCircle2 size={18} /> : st.id}
                </div>
                <div className="step-label" style={{ textAlign: 'center', maxWidth: '100px' }}>
                  {st.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extracted Metrics (if completed) */}
      {isCompleted && layersData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="stat-card">
            <div>
              <div className="stat-label">Delineated Parcels</div>
              <div className="stat-val" style={{ color: '#0284c7' }}>
                {layersData.parcels?.features?.length || 0}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Cadastral Land Subdivisions
              </div>
            </div>
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Layers size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">Extracted Buildings</div>
              <div className="stat-val" style={{ color: '#ea580c' }}>
                {layersData.buildings?.features?.length || 0}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Rooftop Polygonal Footprints
              </div>
            </div>
            <div className="stat-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>
              <Home size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">Road Networks</div>
              <div className="stat-val" style={{ color: '#d97706' }}>
                {layersData.roads?.features?.length || 0}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Paved Access Thoroughfares
              </div>
            </div>
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Navigation size={22} />
            </div>
          </div>
        </div>
      )}

      {/* Real-time Processing Logs Terminal */}
      <div className="panel">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} color="#64748b" />
            <span className="panel-title">Computer Vision & AI Execution Log</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {logs.length} pipeline events logged
          </span>
        </div>

        <div className="panel-body" style={{ padding: '16px' }}>
          <div className="terminal-box">
            {logs.length === 0 ? (
              <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                Pipeline waiting for trigger. Press "Start AI Extraction" to begin analysis.
              </div>
            ) : (
              logs.map((item, idx) => (
                <div key={idx} className="log-entry">
                  <span className="log-time">[{item.time}]</span>
                  <span className="log-step">&gt; {item.step}:</span>
                  <span className="log-msg">{item.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
