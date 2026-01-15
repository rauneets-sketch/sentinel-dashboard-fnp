# Testing Strategy for Dashboard Sentinel

This document outlines the testing strategy for the Dashboard Sentinel project, ensuring the integrity of the MERN stack restructuring.

## 1. Backend Testing (Node.js + Express)

The backend is responsible for serving the React application and providing API endpoints for data retrieval from Supabase.

### Test Cases
- **Server Initialization**: Verify the server starts correctly on the specified port.
- **Static File Serving**: Ensure the `dist` directory is served correctly for the frontend.
- **API Endpoints**:
    - `GET /api/test-results`: Verify it returns the correct structure for desktop, mobile, android, ios, and oms.
    - `GET /api/test-results/:platform`: Verify it filters by platform correctly.
    - `GET /api/tab-performance/:system`: Verify it returns tab performance data.
    - `GET /api/recent-failures`: Verify it returns a list of recent failures.
- **Error Handling**: Ensure invalid routes or API errors return appropriate HTTP status codes.

### Running Backend Tests
We have a dedicated test script `test-dashboard.js` that verifies all key API endpoints and the server status.

1.  **Start the Server**:
    ```bash
    npm start
    ```
    Ensure the server is running on `http://localhost:3000`.

2.  **Run the Test Script**:
    ```bash
    node test-dashboard.js
    ```

### Expected Output
```
🧪 Testing Dashboard API and Data Display...

1. Testing main API endpoint...
✅ API Response received
📊 Desktop Site: 145 journeys, 1000 steps
...

2. Testing individual platform endpoint...
✅ Endpoints are consistent

3. Testing Tab Performance API...
✅ Tab Performance (OMS): Received X tab metrics

4. Testing Recent Failures API...
✅ Recent Failures: Received X failure records

5. Testing dashboard page...
✅ Dashboard page loads successfully

🎉 Dashboard test completed!
```

## 2. Frontend Testing (React + Vite)

The frontend is verified via:
1.  **Build Verification**: `npm run build` ensures the React app compiles without errors.
2.  **End-to-End Check**: The `test-dashboard.js` script verifies the main page loads (status 200).

## 3. Manual Verification Steps

1.  Open `http://localhost:3000` in your browser.
2.  Verify the Dashboard loads with the correct title "Sentinel".
3.  Check if graphs are rendering (Highcharts).
4.  Switch tabs (Desktop, Mobile, etc.) and verify data updates.
5.  Toggle Dark/Light mode.

## 4. Status

- **Backend API**: ✅ Verified with `test-dashboard.js`.
- **Frontend Build**: ✅ Verified with `npm run build`.
- **Integration**: ✅ Verified server serves frontend correctly.
