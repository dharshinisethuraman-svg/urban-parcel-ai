import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import DisclaimerBanner from './components/DisclaimerBanner';

import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import MapViewerPage from './pages/MapViewerPage';
import ExportPage from './pages/ExportPage';
import AboutPage from './pages/AboutPage';

import { api } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0 && !activeProject) {
        setActiveProject(data[0]);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleQuickDemo = async () => {
    try {
      setLoading(true);
      const demoProj = await api.initDemoProject();
      await fetchProjects();
      setActiveProject(demoProj);
      
      // If demo is already processed, go straight to map, otherwise to processing
      if (demoProj.parcels_count > 0 || demoProj.status === 'completed') {
        setCurrentPage('map');
      } else {
        setCurrentPage('processing');
      }
    } catch (err) {
      alert('Error initializing demo project: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectReady = (project, autoProcess = false) => {
    fetchProjects();
    setActiveProject(project);
    if (autoProcess) {
      setCurrentPage('processing');
    } else {
      setCurrentPage('map');
    }
  };

  const handleSelectProject = (project) => {
    setActiveProject(project);
    if (project.status === 'completed') {
      setCurrentPage('map');
    } else {
      setCurrentPage('processing');
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'landing': return 'Automated Cadastral Mapping System';
      case 'dashboard': return 'Cadastral Survey Dashboard';
      case 'upload': return 'Upload Drone Orthomosaic Imagery';
      case 'processing': return 'AI Feature Extraction & Segmentation';
      case 'map': return 'Interactive Cadastral Map Viewer';
      case 'exports': return 'Export Cadastral GeoJSON & Tabular Data';
      case 'about': return 'Technical Architecture & Methodology';
      default: return 'Urban Cadastre AI';
    }
  };

  const getPageSubtitle = () => {
    if (activeProject) {
      return `Current Project: ${activeProject.name} (${activeProject.location})`;
    }
    return 'Drone photogrammetry & AI-powered land parcel extraction platform';
  };

  return (
    <div className="app-container">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        activeProject={activeProject} 
      />

      <div className="main-wrapper">
        <TopHeader
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          projects={projects}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          onQuickDemo={handleQuickDemo}
          onNewUpload={() => setCurrentPage('upload')}
        />

        <DisclaimerBanner />

        <main className={currentPage === 'map' ? '' : 'page-content'}>
          {currentPage === 'landing' && (
            <LandingPage
              onStartMapping={() => setCurrentPage('upload')}
              onViewDashboard={() => setCurrentPage('dashboard')}
              onQuickDemo={handleQuickDemo}
            />
          )}

          {currentPage === 'dashboard' && (
            <DashboardPage
              onSelectProject={handleSelectProject}
              onNavigateUpload={() => setCurrentPage('upload')}
              onNavigateProcessing={() => setCurrentPage('processing')}
              onNavigateMap={() => setCurrentPage('map')}
              onNavigateExport={() => setCurrentPage('exports')}
              onQuickDemo={handleQuickDemo}
            />
          )}

          {currentPage === 'upload' && (
            <UploadPage
              onProjectReady={handleProjectReady}
              onQuickDemo={handleQuickDemo}
            />
          )}

          {currentPage === 'processing' && (
            <ProcessingPage
              project={activeProject}
              onNavigateMap={() => setCurrentPage('map')}
            />
          )}

          {currentPage === 'map' && (
            <MapViewerPage
              project={activeProject}
              onNavigateExport={() => setCurrentPage('exports')}
            />
          )}

          {currentPage === 'exports' && (
            <ExportPage
              project={activeProject}
            />
          )}

          {currentPage === 'about' && (
            <AboutPage />
          )}
        </main>
      </div>
    </div>
  );
}
