import time
from app.main import app
from fastapi.testclient import TestClient

def test_full_pipeline():
    with TestClient(app) as client:
        projs = client.get('/api/projects').json()
        assert len(projs) > 0, "No projects found"
        p_id = projs[0]['id']
        print(f"Triggering processing on project {p_id}...")
        
        proc_res = client.post(f"/api/projects/{p_id}/process")
        print("Process trigger response:", proc_res.status_code)
        assert proc_res.status_code == 202

        # Poll status
        for i in range(20):
            time.sleep(1)
            st = client.get(f"/api/projects/{p_id}/status").json()
            print(f"Step {i+1}: {st['status']} ({st['progress_pct']}%) - {st['current_step']}")
            if st['status'] in ['completed', 'failed']:
                if st['status'] == 'failed':
                    print("Error message:", st.get('error_message'))
                break

        # Check layers
        layers = client.get(f"/api/projects/{p_id}/layers").json()
        parcels = layers['parcels']['features']
        buildings = layers['buildings']['features']
        roads = layers['roads']['features']
        
        print(f"Success! Detected {len(parcels)} parcels, {len(buildings)} buildings, {len(roads)} roads.")
        
        # Test export GeoJSON
        export_geo = client.get(f"/api/projects/{p_id}/export/geojson?layer=combined")
        assert export_geo.status_code == 200
        print(f"Export GeoJSON size: {len(export_geo.content)} bytes")

        # Test export CSV
        export_csv = client.get(f"/api/projects/{p_id}/export/csv?layer=parcels")
        assert export_csv.status_code == 200
        print(f"Export CSV lines: {len(export_csv.content.splitlines())}")

if __name__ == "__main__":
    test_full_pipeline()
