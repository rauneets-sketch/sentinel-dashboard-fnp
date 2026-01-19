import { useEffect, useState, useRef } from "react";
import type React from "react";
import Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more";
import Highcharts3D from "highcharts/highcharts-3d";
import SolidGauge from "highcharts/modules/solid-gauge";
import Heatmap from "highcharts/modules/heatmap";
import Funnel from "highcharts/modules/funnel";
import Exporting from "highcharts/modules/exporting";
import ExportData from "highcharts/modules/export-data";
import Accessibility from "highcharts/modules/accessibility";
import axios from "axios";
import { JourneyDetailsView } from "./components/JourneyDetailsView";
import "./components/JourneyDetailsView.css";
import { fetchLatestDesktopData } from "./services/supabaseDataService";

const initModule = (mod: any) => {
  if (typeof mod === "function") {
    mod(Highcharts);
  } else if (mod && typeof mod.default === "function") {
    mod.default(Highcharts);
  }
};

initModule(HighchartsMore);
initModule(Highcharts3D);
initModule(SolidGauge);
initModule(Heatmap);
initModule(Funnel);
initModule(Exporting);
initModule(ExportData);
initModule(Accessibility);

interface ModuleStats {
  name: string;
  passed: number;
  failed: number;
  duration: number;
}

interface PlatformStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  lastRun: string;
  modules: ModuleStats[];
  comingSoon?: boolean;
}

interface TestResultsResponse {
  desktop: PlatformStats;
  mobile: PlatformStats;
  android: PlatformStats;
  ios: PlatformStats;
  oms: PlatformStats;
}

type PlatformKey = "desktop" | "mobile" | "android" | "ios" | "oms";

function App() {
  const [testData, setTestData] = useState<
    Partial<Record<PlatformKey, PlatformStats>>
  >({});
  const [currentPlatform, setCurrentPlatform] =
    useState<PlatformKey>("desktop");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const overviewChartRef = useRef<Highcharts.Chart | null>(null);
  const trendChartRef = useRef<Highcharts.Chart | null>(null);
  const bubbleChartRef = useRef<Highcharts.Chart | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  }, [theme]);

  useEffect(() => {
    return () => {
      if (overviewChartRef.current) {
        overviewChartRef.current.destroy();
        overviewChartRef.current = null;
      }
      if (trendChartRef.current) {
        trendChartRef.current.destroy();
        trendChartRef.current = null;
      }
      if (bubbleChartRef.current) {
        bubbleChartRef.current.destroy();
        bubbleChartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setLastRefreshTime(new Date());
    renderLiveStats();
    renderStats();
    renderCharts();
    showModules(currentPlatform);
  }, [testData, currentPlatform]);

  useEffect(() => {
    const currentDateEl = document.getElementById("currentDate");
    if (currentDateEl) {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      currentDateEl.textContent = new Date().toLocaleString(undefined, options);
    }
  }, []);

  useEffect(() => {
    initDashboard();
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastRefreshTime) {
        const diffMs = Date.now() - lastRefreshTime.getTime();
        const minutes = Math.floor(diffMs / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        const liveUpdateTime = document.getElementById("liveUpdateTime");
        if (liveUpdateTime) {
          if (minutes === 0 && seconds < 10) {
            liveUpdateTime.textContent = "just now";
          } else if (minutes === 0) {
            liveUpdateTime.textContent = `${seconds}s ago`;
          } else {
            liveUpdateTime.textContent = `${minutes}m ${seconds}s ago`;
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefreshTime]);

  function generateMockData(): TestResultsResponse {
    return {
      desktop: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        lastRun: new Date().toISOString(),
        modules: [],
      },
      mobile: {
        total: 138,
        passed: 125,
        failed: 10,
        skipped: 3,
        duration: 1389,
        lastRun: new Date().toISOString(),
        modules: [],
      },
      android: {
        total: 142,
        passed: 128,
        failed: 9,
        skipped: 5,
        duration: 1456,
        lastRun: new Date().toISOString(),
        modules: [],
      },
      ios: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        lastRun: new Date().toISOString(),
        modules: [],
        comingSoon: true,
      },
      oms: {
        total: 156,
        passed: 142,
        failed: 11,
        skipped: 3,
        duration: 1678,
        lastRun: new Date().toISOString(),
        modules: [],
      },
    };
  }

  async function loadData() {
    try {
      console.log("🔍 Loading data - fetching desktop from Supabase...");

      // Fetch desktop data from Supabase
      const desktopData = await fetchLatestDesktopData();

      // Fetch other platforms from existing API (fallback to mock if needed)
      let otherPlatformsData = null;
      try {
        const timestamp = Date.now();
        const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(
          /\/+$/,
          "",
        );
        const url = `${baseUrl}/api/index?_t=${timestamp}`;
        const response = await axios.get<TestResultsResponse>(url, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        otherPlatformsData = response.data;
      } catch (apiError) {
        console.log("API call failed, using mock data for other platforms");
        otherPlatformsData = generateMockData();
      }

      // Combine Supabase desktop data with other platforms data
      const combinedData = {
        ...otherPlatformsData,
        desktop: desktopData ||
          otherPlatformsData?.desktop || {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0,
            lastRun: new Date().toISOString(),
            modules: [],
          },
      };

      console.log("✅ Desktop data from Supabase:", desktopData);
      console.log("📊 Combined data:", combinedData);

      setTestData((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(combinedData)) return prev;
        return combinedData;
      });
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error("❌ Error in loadData:", error);
      if (!testData || Object.keys(testData).length === 0) {
        setTestData(generateMockData());
      }
    }
  }

  async function initDashboard() {
    await loadData();
    setLastRefreshTime(new Date());
    setLoading(false);
  }

  function renderLiveStats() {
    const liveStatsGrid = document.getElementById("liveStatsGrid");
    if (!liveStatsGrid) return;
    const desktop = testData.desktop;
    const mobile = testData.mobile;
    const oms = testData.oms;
    const android = testData.android;
    const ios = testData.ios;

    const cards: string[] = [];

    // Desktop Site Card
    if (desktop) {
      const successRate =
        desktop.total > 0
          ? Math.round((desktop.passed / desktop.total) * 100)
          : 0;
      const avgTime = (desktop.duration / 1000).toFixed(3);
      const status = desktop.failed > 0 ? "ISSUES DETECTED" : "ALL SYSTEMS GO";
      const statusClass =
        desktop.failed > 0 ? "status-error" : "status-success";

      cards.push(`
        <div class="detailed-stat-card desktop-border">
          <div class="card-header">
            <div class="card-icon desktop-bg"><i class="fas fa-laptop-code"></i></div>
            <div class="card-title">Desktop Site</div>
          </div>
          <div class="card-content">
            <div class="automation-info">FNP Automation Framework - Playwright Test Suite</div>
            <div class="platform-info">Platform: <span class="platform-value">WEB</span></div>
            <div class="environment-info">Environment: <span class="env-value">prod</span></div>
            <div class="duration-info">Duration: <span class="duration-value">${desktop.duration}ms</span></div>
            <div class="journeys-info">User Journeys: <span class="journeys-value">${desktop.modules?.length || 0}</span></div>
            <div class="steps-info">Test Steps: <span class="steps-value">${desktop.total}</span></div>
            <div class="success-info">Success Rate: <span class="success-value">${successRate}%</span></div>
            <div class="avg-time-info">Avg Step Time: <span class="time-value">${avgTime}ms</span></div>
            <div class="failed-info">Failed Steps: <span class="failed-value">${desktop.failed}</span></div>
          </div>
          <div class="card-status ${statusClass}">Status: ${status} ${desktop.failed > 0 ? "⚠" : "✓"}</div>
        </div>
      `);
    }

    // Mobile Site Card
    if (mobile) {
      const successRate =
        mobile.total > 0 ? Math.round((mobile.passed / mobile.total) * 100) : 0;
      const avgTime = (mobile.duration / 1000).toFixed(3);
      const status = mobile.failed > 0 ? "ISSUES DETECTED" : "ALL SYSTEMS GO";
      const statusClass = mobile.failed > 0 ? "status-error" : "status-success";

      cards.push(`
        <div class="detailed-stat-card mobile-border">
          <div class="card-header">
            <div class="card-icon mobile-bg"><i class="fas fa-mobile-screen"></i></div>
            <div class="card-title">Mobile Site</div>
          </div>
          <div class="card-content">
            <div class="automation-info">FNP Mobile Automation - Playwright Test Suite</div>
            <div class="platform-info">Platform: <span class="platform-value">MOBILE WEB</span></div>
            <div class="environment-info">Environment: <span class="env-value">prod</span></div>
            <div class="duration-info">Duration: <span class="duration-value">${mobile.duration}ms</span></div>
            <div class="journeys-info">User Journeys: <span class="journeys-value">${mobile.modules?.length || 0}</span></div>
            <div class="steps-info">Test Steps: <span class="steps-value">${mobile.total}</span></div>
            <div class="success-info">Success Rate: <span class="success-value">${successRate}%</span></div>
            <div class="avg-time-info">Avg Step Time: <span class="time-value">${avgTime}ms</span></div>
            <div class="failed-info">Failed Steps: <span class="failed-value">${mobile.failed}</span></div>
          </div>
          <div class="card-status ${statusClass}">Status: ${status} ${mobile.failed > 0 ? "⚠" : "✓"}</div>
        </div>
      `);
    }

    // OMS Card
    if (oms) {
      const successRate =
        oms.total > 0 ? Math.round((oms.passed / oms.total) * 100) : 0;
      const avgTime = (oms.duration / 1000).toFixed(3);
      const status = oms.failed > 0 ? "ISSUES DETECTED" : "ALL SYSTEMS GO";
      const statusClass = oms.failed > 0 ? "status-error" : "status-success";

      cards.push(`
        <div class="detailed-stat-card oms-border">
          <div class="card-header">
            <div class="card-icon oms-bg"><i class="fas fa-boxes-stacked"></i></div>
            <div class="card-title">OMS</div>
          </div>
          <div class="card-content">
            <div class="automation-info">FNP OMS Automation - Playwright Test Suite</div>
            <div class="platform-info">Platform: <span class="platform-value">ADMIN PANEL</span></div>
            <div class="environment-info">Environment: <span class="env-value">prod</span></div>
            <div class="duration-info">Duration: <span class="duration-value">${oms.duration}ms</span></div>
            <div class="journeys-info">User Journeys: <span class="journeys-value">${oms.modules?.length || 0}</span></div>
            <div class="steps-info">Test Steps: <span class="steps-value">${oms.total}</span></div>
            <div class="success-info">Success Rate: <span class="success-value">${successRate}%</span></div>
            <div class="avg-time-info">Avg Step Time: <span class="time-value">${avgTime}ms</span></div>
            <div class="failed-info">Failed Steps: <span class="failed-value">${oms.failed}</span></div>
          </div>
          <div class="card-status ${statusClass}">Status: ${status} ${oms.failed > 0 ? "⚠" : "✓"}</div>
        </div>
      `);
    }

    // Partner Panel Card
    if (android) {
      const successRate =
        android.total > 0
          ? Math.round((android.passed / android.total) * 100)
          : 0;
      const avgTime = (android.duration / 1000).toFixed(3);
      const status = android.failed > 0 ? "ISSUES DETECTED" : "ALL SYSTEMS GO";
      const statusClass =
        android.failed > 0 ? "status-error" : "status-success";

      cards.push(`
        <div class="detailed-stat-card android-border">
          <div class="card-header">
            <div class="card-icon android-bg"><i class="fas fa-handshake"></i></div>
            <div class="card-title">Partner Panel</div>
          </div>
          <div class="card-content">
            <div class="automation-info">FNP Partner Automation - Playwright Test Suite</div>
            <div class="platform-info">Platform: <span class="platform-value">PARTNER WEB</span></div>
            <div class="environment-info">Environment: <span class="env-value">prod</span></div>
            <div class="duration-info">Duration: <span class="duration-value">${android.duration}ms</span></div>
            <div class="journeys-info">User Journeys: <span class="journeys-value">${android.modules?.length || 0}</span></div>
            <div class="steps-info">Test Steps: <span class="steps-value">${android.total}</span></div>
            <div class="success-info">Success Rate: <span class="success-value">${successRate}%</span></div>
            <div class="avg-time-info">Avg Step Time: <span class="time-value">${avgTime}ms</span></div>
            <div class="failed-info">Failed Steps: <span class="failed-value">${android.failed}</span></div>
          </div>
          <div class="card-status ${statusClass}">Status: ${status} ${android.failed > 0 ? "⚠" : "✓"}</div>
        </div>
      `);
    }

    // Android Card (iOS data but labeled as Android)
    if (ios) {
      cards.push(`
        <div class="detailed-stat-card ios-border disabled-card">
          <div class="card-header">
            <div class="card-icon ios-bg"><i class="fab fa-android"></i></div>
            <div class="card-title">Android</div>
          </div>
          <div class="card-content">
            <div class="platform-development">Platform under development</div>
          </div>
          <div class="card-status status-disabled">Status: COMING SOON ⏳</div>
        </div>
      `);
    }

    liveStatsGrid.innerHTML = cards.join("");
  }

  function renderStats() {
    const statsGrid = document.getElementById("statsGrid");
    if (!statsGrid) return;
    const platforms: PlatformKey[] = [
      "desktop",
      "mobile",
      "oms",
      "android",
      "ios",
    ];
    const html = platforms
      .map((platform) => {
        const data = testData[platform];
        if (!data) return "";
        const passRate =
          data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0;
        const failRate =
          data.total > 0 ? Math.round((data.failed / data.total) * 100) : 0;
        const cardClass =
          platform === "desktop"
            ? "desktop-bg"
            : platform === "mobile"
              ? "mobile-bg"
              : platform === "android"
                ? "android-bg"
                : platform === "oms"
                  ? "oms-bg"
                  : "ios-bg";
        const label =
          platform === "desktop"
            ? "Desktop Site"
            : platform === "mobile"
              ? "Mobile Site"
              : platform === "android"
                ? "Partner Panel"
                : platform === "oms"
                  ? "OMS"
                  : "Android";
        return `
          <div class="stat-card">
            <div class="stat-icon ${cardClass}">
              <i class="fas fa-circle-notch"></i>
            </div>
            <div class="stat-value">${passRate}%</div>
            <div class="stat-label">${label} Success Rate</div>
            <div class="stat-details">
              <div class="stat-detail"><span>Passed:</span><strong>${data.passed}</strong></div>
              <div class="stat-detail"><span>Failed:</span><strong>${data.failed}</strong></div>
              <div class="stat-detail"><span>Skipped:</span><strong>${data.skipped}</strong></div>
            </div>
          </div>
        `;
      })
      .join("");
    statsGrid.innerHTML = html;
  }

  function renderCharts() {
    if (!testData || Object.keys(testData).length === 0) return;

    const desktop = testData.desktop || ({} as PlatformStats);
    const mobile = testData.mobile || ({} as PlatformStats);
    const android = testData.android || ({} as PlatformStats);
    const ios = testData.ios || ({} as PlatformStats);
    const oms = testData.oms || ({} as PlatformStats);

    const platformKeys: PlatformKey[] = [
      "desktop",
      "mobile",
      "android",
      "ios",
      "oms",
    ];
    const categories = [
      "Desktop Site",
      "Mobile Site",
      "Partner Panel",
      "Android",
      "OMS",
    ];

    const getData = (field: "passed" | "failed" | "skipped") =>
      platformKeys.map((key) => {
        const data = testData[key];
        return data && !data.comingSoon
          ? (data as PlatformStats)[field] || 0
          : 0;
      });

    const passed = getData("passed");
    const failed = getData("failed");
    const skipped = getData("skipped");

    const overviewOptions: Highcharts.Options = {
      chart: {
        type: "column",
        options3d: {
          enabled: true,
          alpha: 15,
          beta: 15,
          depth: 50,
          viewDistance: 25,
        },
      },
      exporting: { enabled: false },
      title: { text: undefined },
      xAxis: {
        categories,
        labels: { style: { fontSize: "13px" } },
      },
      yAxis: { min: 0, title: { text: "Number of Journeys/Tests" } },
      plotOptions: {
        column: {
          depth: 25,
          dataLabels: { enabled: true, format: "{point.y}" },
        },
      },
      credits: { enabled: false },
      colors: ["#4CAF50", "#F44336", "#FFC107"],
      series: [
        { name: "Passed", data: passed, type: "column" },
        { name: "Failed", data: failed, type: "column" },
        { name: "Skipped", data: skipped, type: "column" },
      ],
    };

    if (overviewChartRef.current) {
      overviewChartRef.current.update(overviewOptions, true, true);
      overviewChartRef.current.reflow();
    } else {
      overviewChartRef.current = Highcharts.chart(
        "overviewChart",
        overviewOptions,
      );
    }

    const calculateSuccessRate = (data: PlatformStats | undefined) => {
      if (!data) return 0;
      if (
        data.modules &&
        data.modules.length > 0 &&
        (data as any).successRate
      ) {
        return (data as any).successRate || 0;
      }
      const total = (data.passed || 0) + (data.failed || 0);
      return total > 0 ? Math.round(((data.passed || 0) / total) * 100) : 0;
    };

    const trendCategories = [
      "Day 1",
      "Day 2",
      "Day 3",
      "Day 4",
      "Day 5",
      "Day 6",
      "Today",
    ];

    const generateTrendData = (currentRate: number) => {
      const baseRate = currentRate;
      const variation = 5;
      return trendCategories.map((_, index) => {
        if (index === trendCategories.length - 1) return baseRate;
        const randomVariation = (Math.random() - 0.5) * variation;
        const rate = Math.max(0, Math.min(100, baseRate + randomVariation));
        return Math.round(rate);
      });
    };

    const desktopRate = calculateSuccessRate(desktop);
    const mobileRate = calculateSuccessRate(mobile);
    const omsRate = calculateSuccessRate(oms);
    const partnerPanelRate = calculateSuccessRate(android);
    const iosRate = calculateSuccessRate(ios);

    const trendSeries: Highcharts.SeriesOptionsType[] = [];

    if (desktop && typeof desktop.total === "number") {
      trendSeries.push({
        type: "line",
        name: "Desktop Site",
        data: generateTrendData(desktopRate),
        color: "#4CAF50",
        marker: { symbol: "circle" },
      });
    }
    if (mobile && typeof mobile.total === "number") {
      trendSeries.push({
        type: "line",
        name: "Mobile Site",
        data: generateTrendData(mobileRate),
        color: "#2196F3",
        marker: { symbol: "square" },
      });
    }
    if (oms && typeof oms.total === "number") {
      trendSeries.push({
        type: "line",
        name: "OMS",
        data: generateTrendData(omsRate),
        color: "#9C27B0",
        marker: { symbol: "diamond" },
      });
    }
    if (android && typeof android.total === "number") {
      trendSeries.push({
        type: "line",
        name: "Partner Panel",
        data: generateTrendData(partnerPanelRate),
        color: "#FF9800",
        marker: { symbol: "triangle" },
      });
    }
    if (ios && typeof ios.total === "number" && !ios.comingSoon) {
      trendSeries.push({
        type: "line",
        name: "Android",
        data: generateTrendData(iosRate),
        color: "#607D8B",
        marker: { symbol: "hexagon" as any },
      });
    }

    const trendOptions: Highcharts.Options = {
      chart: {
        type: "line",
        backgroundColor: "transparent",
      },
      exporting: { enabled: false },
      title: { text: undefined },
      xAxis: {
        categories: trendCategories,
        labels: {
          style: {
            fontSize: "11px",
            color: "#666",
          },
        },
        gridLineWidth: 1,
        gridLineColor: "#e0e0e0",
      },
      yAxis: {
        title: {
          text: "Success Rate (%)",
          style: { color: "#666" },
        },
        min: 0,
        max: 100,
        gridLineColor: "#e0e0e0",
      },
      tooltip: {
        shared: true,
        valueSuffix: "%",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#ccc",
        borderRadius: 8,
        shadow: true,
      },
      credits: { enabled: false },
      legend: {
        align: "center",
        verticalAlign: "bottom",
        layout: "horizontal",
        itemStyle: {
          fontSize: "11px",
          color: "#666",
        },
      },
      plotOptions: {
        line: {
          lineWidth: 3,
          marker: {
            radius: 5,
            lineWidth: 2,
            lineColor: "#fff",
          },
          states: {
            hover: {
              lineWidth: 4,
            },
          },
        },
      },
      series: trendSeries,
    };

    if (trendChartRef.current) {
      trendChartRef.current.update(trendOptions, true, true);
      trendChartRef.current.reflow();
    } else {
      trendChartRef.current = Highcharts.chart("trendChart", trendOptions);
    }

    // Helper function to process modules for bubble chart
    const processModulesForBubble = (
      modules: any[],
      platformName: string,
      platformData: any,
    ) => {
      return modules.map((module: any, index: number) => {
        const totalSteps =
          module.totalSteps ||
          module.steps?.length ||
          (module.passed || 0) + (module.failed || 0) ||
          1;
        const passedSteps =
          module.passed ||
          module.steps?.filter((s: any) => s.status === "PASSED").length ||
          0;
        const successRate =
          totalSteps > 0 ? (passedSteps / totalSteps) * 100 : 0;
        const duration = (module.duration || 0) / 1000; // Convert to seconds

        // Calculate status properly - same logic as JourneyDetailsView
        const status =
          module.status || (module.failed > 0 ? "FAILED" : "PASSED");

        // Format last run time
        const lastRun = platformData?.lastRun
          ? new Date(platformData.lastRun)
          : null;
        const lastRunFormatted = lastRun ? lastRun.toLocaleString() : "Unknown";

        return {
          x: duration,
          y: Math.round(successRate),
          z: totalSteps,
          name: module.name || `${platformName} Journey ${index + 1}`,
          status: status,
          platform: platformName,
          lastRun: lastRunFormatted,
        };
      });
    };

    const bubbleSeries: Highcharts.SeriesOptionsType[] = [];

    // Add Desktop data
    if (desktop.modules && desktop.modules.length > 0) {
      bubbleSeries.push({
        type: "bubble",
        name: "Desktop Site",
        data: processModulesForBubble(desktop.modules, "Desktop", desktop),
        color: "#4CAF50",
      });
    }

    // Add Mobile data
    if (mobile.modules && mobile.modules.length > 0) {
      bubbleSeries.push({
        type: "bubble",
        name: "Mobile Site",
        data: processModulesForBubble(mobile.modules, "Mobile", mobile),
        color: "#2196F3",
      });
    }

    // Add OMS data
    if (oms.modules && oms.modules.length > 0) {
      bubbleSeries.push({
        type: "bubble",
        name: "OMS",
        data: processModulesForBubble(oms.modules, "OMS", oms),
        color: "#9C27B0",
      });
    }

    // Add Partner Panel data (mapped to android key)
    if (android.modules && android.modules.length > 0) {
      bubbleSeries.push({
        type: "bubble",
        name: "Partner Panel",
        data: processModulesForBubble(
          android.modules,
          "Partner Panel",
          android,
        ),
        color: "#FF9800",
      });
    }

    const bubbleOptions: Highcharts.Options = {
      chart: {
        type: "bubble",
        plotBorderWidth: 1,
        zoomType: "xy",
      } as Highcharts.ChartOptions & { zoomType?: "x" | "y" | "xy" },
      exporting: { enabled: false },
      title: {
        text: "Journey Performance Analysis",
        style: {
          fontSize: "16px",
          fontWeight: "600",
        },
      },
      subtitle: {
        text: "Duration vs Success Rate vs Step Count (Bubble Size = Steps)",
        style: {
          fontSize: "12px",
          color: "#666",
        },
      },
      xAxis: { title: { text: "Duration (seconds)" }, gridLineWidth: 1 },
      yAxis: {
        title: { text: "Success Rate (%)" },
        min: 0,
        max: 100,
        startOnTick: false,
        endOnTick: false,
      },
      tooltip: {
        useHTML: true,
        followPointer: true,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#ccc",
        borderRadius: 8,
        shadow: true,
        formatter: function (this: any) {
          const point = this.point;
          const status = point.status || "UNKNOWN";
          const statusColor =
            status === "FAILED"
              ? "#ef4444"
              : status === "PASSED"
                ? "#22c55e"
                : "#666";

          return `
            <table>
              <tr><th colspan="2"><h3>${point.name}</h3></th></tr>
              <tr><th>Platform:</th><td><strong>${point.platform}</strong></td></tr>
              <tr><th>Status:</th><td><span style="color: ${statusColor}">${status}</span></td></tr>
              <tr><th>Duration:</th><td>${point.x}s</td></tr>
              <tr><th>Success Rate:</th><td>${point.y}%</td></tr>
              <tr><th>Total Steps:</th><td>${point.z}</td></tr>
              <tr><th>Last Run:</th><td><strong>${point.lastRun}</strong></td></tr>
            </table>
          `;
        },
      },
      plotOptions: {
        bubble: {
          minSize: 10,
          maxSize: 50,
          dataLabels: {
            enabled: true,
            format: "{point.name}",
            style: {
              fontSize: "10px",
              fontWeight: "bold",
              textOutline: "1px contrast",
            },
          },
          marker: {
            fillOpacity: 0.7,
            lineWidth: 2,
            lineColor: "#ffffff",
          },
        },
        series: {
          cursor: "pointer",
          point: {
            events: {
              click: function () {
                // Optional: Add click handler for journey details
                console.log(
                  "Journey clicked:",
                  this.name,
                  "Platform:",
                  (this as any).platform,
                );
              },
            },
          },
        },
      },
      credits: { enabled: false },
      legend: {
        align: "center",
        verticalAlign: "bottom",
        layout: "horizontal",
        itemStyle: {
          fontSize: "12px",
          color: "#666",
        },
        symbolRadius: 8,
      },
      series: bubbleSeries,
    };

    if (bubbleChartRef.current) {
      bubbleChartRef.current.update(bubbleOptions, true, true);
      bubbleChartRef.current.reflow();
    } else {
      bubbleChartRef.current = Highcharts.chart("bubbleChart", bubbleOptions);
    }
  }

  function showModules(
    platform: PlatformKey,
    event?: React.MouseEvent<HTMLButtonElement>,
  ) {
    const journeyNames: Record<number, string> = {
      1: "Home Page Exploration",
      2: "Payment Methods Testing",
      3: "International Phone Number Change",
      4: "Reminder and FAQ Testing",
      5: "International Purchase",
      6: "Mobile Location Testing",
      7: "Combinational Purchase",
      8: "Mobile Message Card",
      9: "Cake Variant Testing",
      10: "Coupon Testing",
      11: "Personalized Product Purchase",
      12: "Message Card Integration",
      13: "Product Exploration Journey",
      14: "Same SKU Product Exploration",
      15: "Search Based Purchase",
      16: "Personalized Product with Photo Upload",
      17: "Location Testing",
      18: "Spherical Home Page Icon Exploration",
      19: "Gmail OTP Login",
      20: "Gmail OTP Login",
    };

    const modulesGrid = document.getElementById("modulesGrid");
    if (!modulesGrid) return;
    setCurrentPlatform(platform);
    const data = testData[platform];
    if (!data) {
      modulesGrid.innerHTML = "";
      return;
    }
    const html = data.modules
      .map((module, index) => {
        const journeyNum = index + 1;
        const journeyName = journeyNames[journeyNum] || module.name;
        return `
        <div class="module-card">
          <div class="module-name">Journey ${journeyNum} - ${journeyName}</div>
          <div class="module-stats">
            <span>Passed: ${module.passed}</span>
            <span>Failed: ${module.failed}</span>
          </div>
        </div>
      `;
      })
      .join("");
    modulesGrid.innerHTML = html;
    if (event && event.currentTarget) {
      const parent = event.currentTarget.parentElement;
      if (parent) {
        const buttons = parent.querySelectorAll(".tab");
        buttons.forEach((btn) => btn.classList.remove("active"));
        event.currentTarget.classList.add("active");
      }
    }
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  async function refreshData() {
    await initDashboard();
  }

  return (
    <div className="container">
      <div className="header">
        <div className="logo-section">
          <img
            src="/static/fnp-logo.svg"
            alt="FNP Logo"
            className="logo"
            style={{ height: 50, width: "auto" }}
          />
          <div>
            <div className="title">Sentinel</div>
            <div className="subtitle">
              <strong>
                <em>
                  A system that constantly watches all business flows and alerts
                  on anomalies before impact.
                </em>
              </strong>
            </div>
          </div>
        </div>
        <div className="header-controls">
          <div
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginRight: 15,
              textAlign: "right",
            }}
          >
            <div
              id="currentDate"
              style={{ fontWeight: 600, color: "var(--text-primary)" }}
            />
          </div>
          <div className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? (
              <i
                className="fas fa-moon"
                style={{ fontSize: 16, color: "var(--text-secondary)" }}
              />
            ) : (
              <i
                className="fas fa-sun"
                style={{ fontSize: 16, color: "#fbbf24" }}
              />
            )}
          </div>
          <button className="btn btn-primary" onClick={refreshData}>
            <i className="fas fa-sync-alt" /> Refresh
          </button>
        </div>
      </div>

      <div className="modules-section">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div className="chart-title" style={{ marginBottom: 0 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.2)",
                animation: "pulse 2s infinite",
                marginRight: 4,
              }}
            />
            <i className="fas fa-broadcast-tower" />
            Live Test Execution Context
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            <i className="fas fa-clock" /> Updated{" "}
            <span id="liveUpdateTime">just now</span>
          </div>
        </div>
        <div className="responsive-stats-grid" id="liveStatsGrid" />
      </div>

      <div className="modules-section">
        <div className="chart-title">
          <i className="fas fa-chart-line" />
          Overall
        </div>
        <div className="responsive-stats-grid" id="statsGrid" />
      </div>

      <JourneyDetailsView testData={testData} />

      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-title">
            <i className="fas fa-chart-bar" />
            Test Results Overview (3D Column)
          </div>
          <div id="overviewChart" />
        </div>
        <div className="chart-card">
          <div className="chart-title">
            <i className="fas fa-chart-line" />
            Performance Trend Analysis
          </div>
          <div id="trendChart" />
        </div>
      </div>

      <div className="chart-card full-width-chart">
        <div className="chart-title">
          <i className="fas fa-chart-scatter" />
          Real-Time Journey Performance Analysis
        </div>
        <div id="bubbleChart" />
      </div>
    </div>
  );
}

export default App;
