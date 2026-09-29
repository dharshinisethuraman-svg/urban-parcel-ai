import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileImage, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Play, 
  Sparkles,
  MapPin,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function UploadPage({ 
  onProjectReady, 
  onQuickDemo 
}) {
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('Urban Cadastral Ward 5');
  const [centerLat, setCenterLat] = useState(12.9716);
  const [centerLng, setCenterLng] = useState(77.5946);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [createdProject, setCreatedProject] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    const validExtensions = ['.jpg', '.jpeg', '.png', '.tif', '.tiff'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(ext)) {
      setError(`Unsupported file format '${ext}'. Please upload JPG, JPEG, PNG, or TIFF drone imagery.`);
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File exceeds 50MB maximum upload limit.');
      return;
    }

    setFile(selectedFile);
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }

    if (!projectName) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setProjectName(`Survey - ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a drone image to upload.');
      return;
    }
    if (!projectName.trim()) {
      setError('Please provide a project name.');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      // 1. Create project
      const proj = await api.createProject({
        name: projectName.trim(),
        description: `Aerial drone cadastral survey of ${location}`,
        location: location.trim(),
        center_lat: parseFloat(centerLat),
        center_lng: parseFloat(centerLng),
        zoom_level: 18
      });

      // 2. Upload Image
      await api.uploadImage(proj.id, file, location, (percent) => {
        setUploadProgress(percent);
      });

      setCreatedProject(proj);
      setUploadSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Upload Drone Imagery</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Upload high-resolution orthomosaic imagery captured from aerial drone surveys (JPG, JPEG, PNG, TIFF).
        </p>
      </div>

      {/* Quick Demo Option */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={18} color="#0284c7" />
          <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 500 }}>
            Don't have a drone image right now? Test immediately with our synthetic high-resolution urban survey!
          </span>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ padding: '6px 14px', fontSize: '12px' }}
          onClick={onQuickDemo}
        >
          Load Demo Orthomosaic
        </button>
      </div>

      {uploadSuccess && createdProject ? (
        <div className="panel" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={32} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            Imagery Uploaded Successfully!
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px' }}>
            Project <strong>"{createdProject.name}"</strong> has been created and the orthomosaic is ready for AI feature extraction.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              className="btn btn-success" 
              style={{ padding: '10px 24px', fontSize: '14px' }}
              onClick={() => onProjectReady(createdProject, true)}
            >
              <Play size={16} />
              <span>Start Cadastral Analysis</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUploadSubmit} className="panel" style={{ padding: '24px' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', borderRadius: '6px', fontSize: '13px', marginBottom: '20px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Project Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Survey Project Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sector 4 Urban Cadastre"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Survey Location / Municipality
              </label>
              <input
                type="text"
                placeholder="e.g. Municipal Ward 7"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Center Latitude (WGS84)
              </label>
              <input
                type="number"
                step="0.0001"
                value={centerLat}
                onChange={(e) => setCenterLat(parseFloat(e.target.value))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Center Longitude (WGS84)
              </label>
              <input
                type="number"
                step="0.0001"
                value={centerLng}
                onChange={(e) => setCenterLng(parseFloat(e.target.value))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            className={`dropzone ${dragActive ? 'dragover' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ marginBottom: '20px' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.tif,.tiff"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  validateAndSetFile(e.target.files[0]);
                }
              }}
            />

            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ maxWidth: '200px', maxHeight: '140px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                ) : (
                  <FileImage size={48} color="#0284c7" />
                )}
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>{file.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB • Click or drag to replace
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <UploadCloud size={44} color="#64748b" />
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Drag & Drop Drone Orthomosaic Image Here
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  or click to browse from your computer (JPG, PNG, TIFF up to 50MB)
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                <span>Uploading Imagery to Server...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s ease' }} />
              </div>
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading || !file}
              style={{ padding: '10px 24px', fontSize: '14px' }}
            >
              <UploadCloud size={16} />
              <span>{uploading ? 'Uploading...' : 'Upload & Create Project'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
