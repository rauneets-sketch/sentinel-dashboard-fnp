import axios from "axios";

async function testDashboard() {
  const baseUrl = "http://localhost:3000";

  console.log("🧪 Testing Dashboard API and Data Display...\n");

  try {
    // Test main API endpoint
    console.log("1. Testing main API endpoint...");
    const response = await axios.get(`${baseUrl}/api/test-results`);
    const data = response.data;

    console.log("✅ API Response received");
    console.log(
      `📊 Desktop Site: ${data.desktop.total} journeys, ${data.desktop.totalSteps} steps`
    );
    console.log(`📊 OMS: ${data.oms.total} journeys`);
    console.log(`📊 Partner Panel: ${data.android.total} journeys`);

    // Check Desktop Site data
    if (data.desktop.modules && data.desktop.modules.length > 0) {
      const journey = data.desktop.modules[0];
      console.log(`\n🎯 Desktop Site Journey Details:`);
      console.log(`   Name: ${journey.name}`);
      console.log(`   Status: ${journey.status}`);
      console.log(`   Steps: ${journey.steps.length} steps`);

      if (journey.steps && journey.steps.length > 0) {
        console.log(`   First 3 steps:`);
        journey.steps.slice(0, 3).forEach((step, i) => {
          console.log(
            `     ${i + 1}. ${step.name || step.step_name} - ${step.status}`
          );
        });
      }
    }

    // Test individual platform endpoint
    console.log("\n2. Testing individual platform endpoint...");
    const desktopResponse = await axios.get(
      `${baseUrl}/api/test-results/desktop`
    );
    const desktopData = desktopResponse.data;

    console.log(
      `📱 Individual Desktop endpoint: ${desktopData.total} journeys`
    );
    if (desktopData.total !== data.desktop.total) {
      console.log(
        `⚠️  WARNING: Mismatch between main endpoint (${data.desktop.total}) and individual endpoint (${desktopData.total})`
      );
    } else {
      console.log("✅ Endpoints are consistent");
    }

    // Test Tab Performance
    console.log("\n3. Testing Tab Performance API...");
    try {
      const tabResponse = await axios.get(`${baseUrl}/api/tab-performance/OMS`);
      if (Array.isArray(tabResponse.data)) {
        console.log(
          `✅ Tab Performance (OMS): Received ${tabResponse.data.length} tab metrics`
        );
      } else {
        console.log("❌ Tab Performance: Invalid response format");
      }
    } catch (e) {
      console.log(`❌ Tab Performance failed: ${e.message}`);
    }

    // Test Recent Failures
    console.log("\n4. Testing Recent Failures API...");
    try {
      const failuresResponse = await axios.get(
        `${baseUrl}/api/recent-failures`
      );
      if (Array.isArray(failuresResponse.data)) {
        console.log(
          `✅ Recent Failures: Received ${failuresResponse.data.length} failure records`
        );
      } else {
        console.log("❌ Recent Failures: Invalid response format");
      }
    } catch (e) {
      console.log(`❌ Recent Failures failed: ${e.message}`);
    }

    // Test dashboard page
    console.log("\n5. Testing dashboard page...");
    const pageResponse = await axios.get(baseUrl);
    if (pageResponse.status === 200 && pageResponse.data.includes("root")) {
      // Note: React app has <div id="root">, it might not have 'Sentinel' text directly in HTML if rendered by JS
      // But we can check for main.css or bundle js reference
      console.log("✅ Dashboard page loads successfully");
    } else {
      console.log("❌ Dashboard page failed to load or content unexpected");
    }

    console.log("\n🎉 Dashboard test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testDashboard();
