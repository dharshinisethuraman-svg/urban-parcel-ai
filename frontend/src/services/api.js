const API_BASE = 'http://127.0.0.1:8000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch (_) {}
    const err = new Error(errorDetail);
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

export const api = {
  // Health
  async getHealth() {
    return request('/health');
  },

  // Dashboard
  async getDashboardStats() {
    return request('/dashboard/stats');
  },

  // Projects
  async getProjects() {
    return request('/projects');
  },

  async getProject(projectId) {
    return request(`/projects/${projectId}`);
  },

  async createProject(data) {
    return request('/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateProject(projectId, data) {
    return request(`/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteProject(projectId) {
    return request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  async initDemoProject() {
    return request('/projects/init-demo', {
      method: 'POST',
    });
  },

  // Upload image with XHR progress support
  uploadImage(projectId, file, location, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      if (location) {
        formData.append('location', location);
      }

      xhr.open('POST', `${API_BASE}/projects/${projectId}/upload`);

      if (xhr.upload && onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        });
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          let msg = `Upload failed with status ${xhr.status}`;
          try {
            const errJson = JSON.parse(xhr.responseText);
            if (errJson.detail) msg = errJson.detail;
          } catch (_) {}
          reject(new Error(msg));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred during image upload.'));
      };

      xhr.send(formData);
    });
  },

  async getProjectImages(projectId) {
    return request(`/projects/${projectId}/images`);
  },

  // Processing
  async startProcessing(projectId) {
    return request(`/projects/${projectId}/process`, {
      method: 'POST',
    });
  },

  async getProcessingStatus(projectId) {
    return request(`/projects/${projectId}/status`);
  },

  // Layers & Features
  async getProjectLayers(projectId) {
    return request(`/projects/${projectId}/layers`);
  },

  async getParcels(projectId) {
    return request(`/projects/${projectId}/parcels`);
  },

  async getBuildings(projectId) {
    return request(`/projects/${projectId}/buildings`);
  },

  async getRoads(projectId) {
    return request(`/projects/${projectId}/roads`);
  },

  async updateParcel(projectId, parcelId, data) {
    return request(`/projects/${projectId}/parcels/${parcelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Export URLs
  getExportGeoJsonUrl(projectId, layer = 'combined') {
    return `${API_BASE}/projects/${projectId}/export/geojson?layer=${layer}`;
  },

  getExportCsvUrl(projectId, layer = 'parcels') {
    return `${API_BASE}/projects/${projectId}/export/csv?layer=${layer}`;
  },
};
