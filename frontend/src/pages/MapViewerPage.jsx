import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Download, 
  Layers, 
  Maximize2, 
  RotateCcw, 
  Edit3, 
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import LayerControl from '../components/LayerControl';
import ParcelDetailDrawer from '../components/ParcelDetailDrawer';
import EditParcelModal from '../components/EditParcelModal';

export default function MapViewerPage({ project, onNavigateExport }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Layer groups refs
  const baseTileLayerRef = useRef(null);
  const imageOverlayRef = useRef(null);
  const parcelsLayerRef = useRef(null);
  const buildingsLayerRef = useRef(null);
  const roadsLayerRef = useRef(null);

  // State
  const [layersData, setLayersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [layersState, setLayersState] = useState({
    imagery: true,
    parcels: true,
    buildings: true,
    roads: true,
  });

  const [imageryOpacity, setImageryOpacity] = useState(0.85);
  const [basemap, setBasemap] = useState('carto');

  const [selectedParcel, setSelectedParcel] = useState(null);
  const [editingParcel, setEditingParcel] = useState(null);

  // Basemap URLs
  const basemaps = {
    carto: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  // Fetch project layers
  const fetchLayers = async () => {
    if (!project) return;
    try {
      setLoading(true);
      const data = await api.getProjectLayers(project.id);
      setLayersData(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayers();
  }, [project]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const center = project?.center_lat && project?.center_lng
        ? [project.center_lat, project.center_lng]
        : [12.9716, 77.5946];

      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: project?.zoom_level || 18,
        maxZoom: 22,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topleft' }).addTo(map);

      // Base tile layer
      const baseTile = L.tileLayer(basemaps.carto, {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 22,
      }).addTo(map);
      baseTileLayerRef.current = baseTile;

      // Layer groups
      parcelsLayerRef.current = L.geoJSON(null).addTo(map);
      buildingsLayerRef.current = L.geoJSON(null).addTo(map);
      roadsLayerRef.current = L.geoJSON(null).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Basemap
  useEffect(() => {
    if (!mapInstanceRef.current || !baseTileLayerRef.current) return;
    baseTileLayerRef.current.setUrl(basemaps[basemap]);
  }, [basemap]);

  // Render / Update Drone Image Overlay
  useEffect(() => {
    if (!mapInstanceRef.current || !layersData) return;
    const map = mapInstanceRef.current;

    if (imageOverlayRef.current) {
      map.removeLayer(imageOverlayRef.current);
      imageOverlayRef.current = null;
    }

    if (layersData.image_overlay && layersState.imagery) {
      const { url, bounds } = layersData.image_overlay;
      if (bounds && bounds[0] && bounds[1]) {
        const overlay = L.imageOverlay(`http://127.0.0.1:8000${url}`, bounds, {
          opacity: imageryOpacity,
          interactive: false,
        }).addTo(map);
        imageOverlayRef.current = overlay;

        // Auto-fit bounds on initial load
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [layersData, layersState.imagery]);

  // Update Drone Image Opacity
  useEffect(() => {
    if (imageOverlayRef.current) {
      imageOverlayRef.current.setOpacity(imageryOpacity);
    }
  }, [imageryOpacity]);

  // Style and Render Parcels Layer
  useEffect(() => {
    if (!parcelsLayerRef.current || !layersData) return;
    const layer = parcelsLayerRef.current;
    layer.clearLayers();

    if (!layersState.parcels || !layersData.parcels) return;

    layer.addData(layersData.parcels);

    layer.setStyle((feature) => {
      const isCorrected = feature.properties?.status === 'User Corrected';
      return {
        color: isCorrected ? '#f59e0b' : '#0284c7',
        weight: isCorrected ? 2.5 : 2,
        opacity: 0.9,
        fillColor: isCorrected ? '#fef3c7' : '#38bdf8',
        fillOpacity: isCorrected ? 0.35 : 0.25,
      };
    });

    layer.eachLayer((polyLayer) => {
      const feat = polyLayer.feature;
      const props = feat.properties || {};

      polyLayer.bindTooltip(`
        <div style="font-family: var(--font-sans); font-size: 12px; padding: 2px 4px;">
          <strong>${props.parcel_number || 'Parcel'}</strong><br/>
          <span>Area: ${Number(props.area || 0).toLocaleString()} m²</span><br/>
          <span style="color: ${props.status === 'User Corrected' ? '#d97706' : '#0284c7'}; font-weight: 600;">
            ${props.status || 'AI Detected'}
          </span>
        </div>
      `, { sticky: true, opacity: 0.95 });

      polyLayer.on({
        mouseover: (e) => {
          const l = e.target;
          l.setStyle({
            weight: 3.5,
            fillOpacity: 0.5,
          });
        },
        mouseout: (e) => {
          layer.resetStyle(e.target);
        },
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedParcel(feat);
        },
      });
    });
  }, [layersData, layersState.parcels]);

  // Style and Render Buildings Layer
  useEffect(() => {
    if (!buildingsLayerRef.current || !layersData) return;
    const layer = buildingsLayerRef.current;
    layer.clearLayers();

    if (!layersState.buildings || !layersData.buildings) return;

    layer.addData(layersData.buildings);

    layer.setStyle({
      color: '#ea580c',
      weight: 2,
      opacity: 0.95,
      fillColor: '#f97316',
      fillOpacity: 0.55,
    });

    layer.eachLayer((polyLayer) => {
      const props = polyLayer.feature.properties || {};
      polyLayer.bindTooltip(`
        <div style="font-family: var(--font-sans); font-size: 12px;">
          <strong>${props.building_number || 'Building'}</strong><br/>
          <span>Type: ${props.building_type || 'Residential'}</span><br/>
          <span>Area: ${Number(props.area || 0).toLocaleString()} m²</span>
        </div>
      `, { sticky: true, opacity: 0.95 });
    });
  }, [layersData, layersState.buildings]);

  // Style and Render Roads Layer
  useEffect(() => {
    if (!roadsLayerRef.current || !layersData) return;
    const layer = roadsLayerRef.current;
    layer.clearLayers();

    if (!layersState.roads || !layersData.roads) return;

    layer.addData(layersData.roads);

    layer.setStyle({
      color: '#eab308',
      weight: 2.5,
      opacity: 0.9,
      fillColor: '#fef08a',
      fillOpacity: 0.4,
    });

    layer.eachLayer((polyLayer) => {
      const props = polyLayer.feature.properties || {};
      polyLayer.bindTooltip(`
        <div style="font-family: var(--font-sans); font-size: 12px;">
          <strong>${props.road_name || 'Road'}</strong><br/>
          <span>Class: ${props.road_type || 'Paved'}</span>
        </div>
      `, { sticky: true });
    });
  }, [layersData, layersState.roads]);

  const handleFitProjectBounds = () => {
    if (!mapInstanceRef.current || !layersData?.image_overlay?.bounds) return;
    mapInstanceRef.current.fitBounds(layersData.image_overlay.bounds, { padding: [30, 30] });
  };

  const handleParcelUpdated = (updatedParcel) => {
    // Refresh layers from backend to update geometry & badge
    fetchLayers();
    setSelectedParcel(null);
    setEditingParcel(null);
  };

  if (!project) {
    return (
      <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>No Project Selected</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Select or load a survey project to visualize cadastral boundaries.
        </p>
      </div>
    );
  }

  const parcelsCount = layersData?.parcels?.features?.length || 0;
  const buildingsCount = layersData?.buildings?.features?.length || 0;
  const roadsCount = layersData?.roads?.features?.length || 0;

  return (
    <div style={{ height: 'calc(100vh - 64px - 37px)', display: 'flex', flexDirection: 'column' }}>
      {/* Map Toolbar */}
      <div style={{
        height: '46px',
        background: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            {project.name}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: 'var(--text-muted)' }}>
            Parcels: <strong style={{ color: '#0284c7' }}>{parcelsCount}</strong>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            Buildings: <strong style={{ color: '#ea580c' }}>{buildingsCount}</strong>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            Roads: <strong style={{ color: '#d97706' }}>{roadsCount}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn btn-outline" 
            style={{ padding: '5px 12px', fontSize: '12px' }}
            onClick={handleFitProjectBounds}
            title="Fit view to drone survey bounding box"
          >
            <Maximize2 size={13} />
            <span>Reset View</span>
          </button>

          <a 
            className="btn btn-secondary" 
            style={{ padding: '5px 12px', fontSize: '12px', textDecoration: 'none' }}
            href={api.getExportGeoJsonUrl(project.id, 'combined')}
            download
            title="Download standard GeoJSON for QGIS / ArcGIS"
          >
            <Download size={13} />
            <span>GeoJSON</span>
          </a>

          <a 
            className="btn btn-secondary" 
            style={{ padding: '5px 12px', fontSize: '12px', textDecoration: 'none' }}
            href={api.getExportCsvUrl(project.id, 'parcels')}
            download
            title="Download parcel attribute table as CSV"
          >
            <Download size={13} />
            <span>CSV</span>
          </a>
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="map-page-wrapper">
        <div ref={mapContainerRef} className="leaflet-map-container" />

        {/* Floating Layer Controls */}
        <LayerControl
          layersState={layersState}
          setLayersState={setLayersState}
          imageryOpacity={imageryOpacity}
          setImageryOpacity={setImageryOpacity}
          basemap={basemap}
          setBasemap={setBasemap}
          stats={{
            parcels_count: parcelsCount,
            buildings_count: buildingsCount,
            roads_count: roadsCount,
          }}
        />

        {/* Floating Selected Parcel Inspector */}
        {selectedParcel && (
          <ParcelDetailDrawer
            parcel={selectedParcel}
            onClose={() => setSelectedParcel(null)}
            onEdit={(p) => setEditingParcel(p)}
          />
        )}
      </div>

      {/* Boundary Editing Modal */}
      {editingParcel && (
        <EditParcelModal
          project={project}
          parcel={editingParcel}
          onClose={() => setEditingParcel(null)}
          onParcelUpdated={handleParcelUpdated}
        />
      )}
    </div>
  );
}
