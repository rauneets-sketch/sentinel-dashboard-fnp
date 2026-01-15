import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Setup
const supabaseUrl =
  process.env.SUPABASE_URL || "https://wnymknrycmldwqzdqoct.supabase.co";
const supabaseKey =
  process.env.SUPABASE_KEY || "your_supabase_service_role_key_here";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

// --- Helper Functions (Ported from testDataService.ts) ---

function formatDuration(durationMs) {
  if (!durationMs || durationMs <= 0) return "0ms";
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  } else if (durationMs < 60000) {
    return `${(durationMs / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}

// Mock Data Generator
const generateMockTestResults = () => {
  const generateMockSteps = (count, passed) => {
    return Array.from({ length: count }, (_, i) => ({
      name: `Step ${i + 1}`,
      status: i < passed ? "PASSED" : "FAILED",
      duration: Math.floor(Math.random() * 1000),
      step_name: `Step ${i + 1}`,
    }));
  };

  const createModule = (name, passed, failed, duration) => ({
    name,
    passed,
    failed,
    duration,
    status: failed > 0 ? "FAILED" : "PASSED",
    steps: generateMockSteps(passed + failed, passed),
  });

  return {
    desktop: {
      total: 145,
      passed: 132,
      failed: 8,
      skipped: 5,
      duration: 1245,
      lastRun: new Date().toISOString(),
      totalSteps: 1000, // Approximate
      modules: [
        createModule("Login", 12, 0, 145),
        createModule("Checkout", 18, 2, 234),
        createModule("Product Search", 25, 1, 189),
        createModule("Cart Operations", 20, 1, 167),
        createModule("Payment Flow", 15, 2, 298),
        createModule("User Profile", 22, 1, 134),
        createModule("Order History", 20, 1, 78),
      ],
    },
    mobile: {
      total: 138,
      passed: 125,
      failed: 10,
      skipped: 3,
      duration: 1389,
      lastRun: new Date().toISOString(),
      totalSteps: 900,
      modules: [
        createModule("Login", 11, 1, 156),
        createModule("Checkout", 17, 2, 245),
        createModule("Product Search", 24, 2, 201),
        createModule("Cart Operations", 19, 2, 178),
        createModule("Payment Flow", 14, 2, 312),
        createModule("User Profile", 21, 1, 145),
        createModule("Order History", 19, 0, 152),
      ],
    },
    android: {
      total: 142,
      passed: 128,
      failed: 9,
      skipped: 5,
      duration: 1456,
      lastRun: new Date().toISOString(),
      totalSteps: 950,
      modules: [
        createModule("Login", 12, 0, 167),
        createModule("Checkout", 17, 2, 267),
        createModule("Product Search", 23, 2, 212),
        createModule("Cart Operations", 20, 1, 189),
        createModule("Payment Flow", 14, 3, 334),
        createModule("User Profile", 22, 1, 156),
        createModule("Order History", 20, 0, 131),
      ],
    },
    ios: {
      comingSoon: true,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      lastRun: new Date().toISOString(),
      modules: [],
    },
    oms: {
      total: 156,
      passed: 142,
      failed: 11,
      skipped: 3,
      duration: 1678,
      lastRun: new Date().toISOString(),
      totalSteps: 1100,
      modules: [
        createModule("Order Management", 28, 2, 345),
        createModule("Inventory Sync", 25, 3, 289),
        createModule("Shipping Integration", 22, 2, 267),
        createModule("Returns Processing", 20, 1, 234),
        createModule("Vendor Management", 24, 2, 278),
        createModule("Reporting", 23, 1, 265),
      ],
    },
  };
};

async function fetchTabPerformanceManual(system, days) {
  try {
    const startDate = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: steps, error } = await supabase
      .from("steps")
      .select(
        `
        *,
        test_runs!inner(metadata)
      `
      )
      .like("step_name", "Tab:%")
      .gte("created_at", startDate)
      .not("metadata->>load_time_ms", "is", null);

    if (error) {
      console.error(`Error fetching ${system} tab steps:`, error);
      return [];
    }

    const systemSteps = (steps || []).filter(
      (step) => step.test_runs?.metadata?.system === system
    );

    const grouped = systemSteps.reduce((acc, step) => {
      const tabName = step.metadata?.tab_name;
      const loadTime = parseInt(step.metadata?.load_time_ms || "0");

      if (!tabName) return acc;

      if (!acc[tabName]) {
        acc[tabName] = { loadTimes: [], passed: 0, failed: 0 };
      }

      acc[tabName].loadTimes.push(loadTime);
      acc[tabName].passed += step.status === "PASSED" ? 1 : 0;
      acc[tabName].failed += step.status === "FAILED" ? 1 : 0;

      return acc;
    }, {});

    return Object.entries(grouped).map(([tabName, data]) => ({
      tab_name: tabName,
      test_count: data.loadTimes.length,
      avg_load_time_ms:
        data.loadTimes.length > 0
          ? Math.round(
              data.loadTimes.reduce((a, b) => a + b, 0) / data.loadTimes.length
            )
          : 0,
      min_load_time_ms:
        data.loadTimes.length > 0 ? Math.min(...data.loadTimes) : 0,
      max_load_time_ms:
        data.loadTimes.length > 0 ? Math.max(...data.loadTimes) : 0,
      passed_count: data.passed,
      failed_count: data.failed,
      success_rate:
        data.loadTimes.length > 0
          ? ((data.passed / data.loadTimes.length) * 100).toFixed(2)
          : "0",
    }));
  } catch (error) {
    console.error(`Error in fetchTabPerformanceManual for ${system}:`, error);
    return [];
  }
}

async function fetchTabPerformance(system, days = 7) {
  try {
    const { data, error } = await supabase.rpc("get_tab_performance", {
      system_name: system,
      days_back: days,
    });

    if (error) {
      console.error(`Error fetching ${system} tab performance:`, error);
      return await fetchTabPerformanceManual(system, days);
    }

    return data || [];
  } catch (error) {
    console.error(`Error in fetchTabPerformance for ${system}:`, error);
    return await fetchTabPerformanceManual(system, days);
  }
}

async function fetchRecentFailuresManual(limit) {
  try {
    const { data: failedSteps, error } = await supabase
      .from("steps")
      .select(
        `
        run_id,
        step_name,
        status,
        error_type,
        error_message,
        duration_ms,
        created_at,
        test_runs!inner(metadata)
      `
      )
      .eq("status", "FAILED")
      .in("test_runs.metadata->>system", ["OMS", "PARTNER_PANEL"])
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching failed steps:", error);
      return [];
    }

    return (failedSteps || []).map((step) => ({
      system: step.test_runs?.metadata?.system,
      readable_run_id: step.test_runs?.metadata?.readable_run_id,
      step_name: step.step_name,
      error_type: step.error_type,
      error_message: step.error_message,
      duration_ms: step.duration_ms,
      created_at: step.created_at,
    }));
  } catch (error) {
    console.error("Error in fetchRecentFailuresManual:", error);
    return [];
  }
}

async function fetchRecentFailures(limit = 20) {
  try {
    const { data, error } = await supabase.rpc("get_recent_failures", {
      limit_count: limit,
    });

    if (error) {
      console.error("Error fetching recent failures:", error);
      return await fetchRecentFailuresManual(limit);
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchRecentFailures:", error);
    return await fetchRecentFailuresManual(limit);
  }
}

async function fetchLatestSystemRun(system) {
  try {
    // Get the latest test run for the system
    const { data: latestRun, error: runError } = await supabase
      .from("test_runs")
      .select("*")
      .eq("metadata->>system", system)
      .order("executed_at", { ascending: false })
      .limit(1)
      .single();

    if (runError || !latestRun) {
      console.error(`Error fetching latest ${system} run:`, runError);
      return null;
    }

    // Get all journeys for this run
    const { data: journeys, error: journeysError } = await supabase
      .from("journeys")
      .select("*")
      .eq("run_id", latestRun.run_id)
      .order("journey_number", { ascending: true });

    if (journeysError) {
      console.error(`Error fetching ${system} journeys:`, journeysError);
      return null;
    }

    // Get all steps for this run
    const { data: steps, error: stepsError } = await supabase
      .from("steps")
      .select("*")
      .eq("run_id", latestRun.run_id)
      .order("step_number", { ascending: true });

    if (stepsError) {
      console.error(`Error fetching ${system} steps:`, stepsError);
      return null;
    }

    // Associate steps with their journeys
    const journeysWithSteps = (journeys || []).map((journey) => {
      const journeySteps = (steps || []).filter(
        (step) => step.journey_id === journey.journey_id
      );
      return {
        ...journey,
        steps: journeySteps,
      };
    });

    // Calculate summary statistics for the system
    const { data: recentRuns, error: summaryError } = await supabase
      .from("test_runs")
      .select("success_rate, total_runtime_ms, executed_at")
      .eq("metadata->>system", system)
      .order("executed_at", { ascending: false })
      .limit(10);

    const summary = {
      totalRuns: recentRuns?.length || 0,
      successRate:
        recentRuns && recentRuns.length > 0
          ? recentRuns.reduce((sum, run) => sum + (run.success_rate || 0), 0) /
            recentRuns.length
          : 0,
      avgRuntime:
        recentRuns && recentRuns.length > 0
          ? recentRuns.reduce(
              (sum, run) => sum + (run.total_runtime_ms || 0),
              0
            ) / recentRuns.length
          : 0,
      lastExecution: latestRun.executed_at,
    };

    return {
      latestRun,
      journeys: journeysWithSteps,
      steps: steps || [],
      summary,
    };
  } catch (error) {
    console.error(`Error in fetchLatestSystemRun for ${system}:`, error);
    return null;
  }
}

// --- API Routes ---

app.get("/api/test-results", async (req, res) => {
  try {
    // Start with mock data
    const mockResults = generateMockTestResults();

    // Desktop Data
    const today = new Date();
    const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // Fetch Desktop logs
    const { data: rawLogs } = await supabase
      .from("raw_test_logs")
      .select("*")
      .gte("executed_at", yesterday.toISOString())
      .lt("executed_at", endOfToday.toISOString())
      .order("executed_at", { ascending: false });

    let desktopRawLog = null;
    if (rawLogs && rawLogs.length > 0) {
      desktopRawLog = rawLogs.find((log) => {
        const system = log.raw_payload?.metadata?.system;
        return !system || system === "DESKTOP" || system === "WEB";
      });
    }

    if (desktopRawLog) {
      const rawPayload = desktopRawLog.raw_payload;
      const journeys = rawPayload?.journeys || [];
      const desktopModules = journeys.map((journey) => ({
        name: journey.journey_name || `Journey ${journey.journey_number}`,
        status: journey.status,
        passed: journey.passed_steps || 0,
        failed: journey.failed_steps || 0,
        duration: journey.duration_ms || 0,
        steps: journey.steps || [],
      }));

      const totalJourneys = desktopModules.length;
      const passedJourneys = desktopModules.filter(
        (j) => j.status === "PASSED"
      ).length;
      const failedJourneys = desktopModules.filter(
        (j) => j.status === "FAILED"
      ).length;
      const totalSteps = desktopModules.reduce(
        (sum, j) => sum + (j.steps?.length || 0),
        0
      );
      const passedSteps = desktopModules.reduce(
        (sum, j) => sum + (j.passed || 0),
        0
      );
      const failedSteps = desktopModules.reduce(
        (sum, j) => sum + (j.failed || 0),
        0
      );
      const totalDuration = desktopModules.reduce(
        (sum, j) => sum + (j.duration || 0),
        0
      );

      mockResults.desktop = {
        total: totalJourneys,
        passed: passedJourneys,
        failed: failedJourneys,
        skipped: 0,
        duration: totalDuration,
        lastRun: desktopRawLog.executed_at,
        modules: desktopModules,
        totalSteps,
        passedSteps,
        failedSteps,
      };
    }

    // OMS Data
    const omsData = await fetchLatestSystemRun("OMS");
    if (omsData) {
      const omsJourneys = omsData.journeys.map((j) => ({
        name: j.journey_name,
        status: j.status,
        passed: j.passed_steps,
        failed: j.failed_steps,
        duration: j.duration_ms,
        steps: j.steps,
      }));
      mockResults.oms = {
        total: omsJourneys.length,
        passed: omsJourneys.filter((j) => j.status === "PASSED").length,
        failed: omsJourneys.filter((j) => j.status === "FAILED").length,
        skipped: 0,
        duration: omsJourneys.reduce((sum, j) => sum + (j.duration || 0), 0),
        lastRun: omsData.latestRun.executed_at,
        modules: omsJourneys,
      };
    }

    // Partner Panel Data
    const ppData = await fetchLatestSystemRun("PARTNER_PANEL");
    if (ppData) {
      const ppJourneys = ppData.journeys.map((j) => ({
        name: j.journey_name,
        status: j.status,
        passed: j.passed_steps,
        failed: j.failed_steps,
        duration: j.duration_ms,
        steps: j.steps,
      }));
      mockResults.android = {
        // Mapping Partner Panel to 'android' key for frontend compatibility
        total: ppJourneys.length,
        passed: ppJourneys.filter((j) => j.status === "PASSED").length,
        failed: ppJourneys.filter((j) => j.status === "FAILED").length,
        skipped: 0,
        duration: ppJourneys.reduce((sum, j) => sum + (j.duration || 0), 0),
        lastRun: ppData.latestRun.executed_at,
        modules: ppJourneys,
      };
    }

    res.json(mockResults);
  } catch (error) {
    console.error("Error in /api/test-results:", error);
    res.status(500).json({ error: "Failed to fetch test results" });
  }
});

app.get("/api/test-results/:platform", async (req, res) => {
  try {
    // Generate full results (optimized: in real app, only fetch what's needed)
    // For now, we reuse the logic from /api/test-results to ensure consistency
    const mockResults = generateMockTestResults();

    // For now, let's just handle 'desktop' as it's the one being tested.
    if (req.params.platform === "desktop") {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
      const endOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      );

      const { data: rawLogs } = await supabase
        .from("raw_test_logs")
        .select("*")
        .gte("executed_at", yesterday.toISOString())
        .lt("executed_at", endOfToday.toISOString())
        .order("executed_at", { ascending: false });

      let desktopRawLog = null;
      if (rawLogs && rawLogs.length > 0) {
        desktopRawLog = rawLogs.find((log) => {
          const system = log.raw_payload?.metadata?.system;
          return !system || system === "DESKTOP" || system === "WEB";
        });
      }

      if (desktopRawLog) {
        const rawPayload = desktopRawLog.raw_payload;
        const journeys = rawPayload?.journeys || [];
        const desktopModules = journeys.map((journey) => ({
          name: journey.journey_name || `Journey ${journey.journey_number}`,
          status: journey.status,
          passed: journey.passed_steps || 0,
          failed: journey.failed_steps || 0,
          duration: journey.duration_ms || 0,
          steps: journey.steps || [],
        }));

        const totalJourneys = desktopModules.length;
        const passedJourneys = desktopModules.filter(
          (j) => j.status === "PASSED"
        ).length;
        const failedJourneys = desktopModules.filter(
          (j) => j.status === "FAILED"
        ).length;
        const totalSteps = desktopModules.reduce(
          (sum, j) => sum + (j.steps?.length || 0),
          0
        );
        const passedSteps = desktopModules.reduce(
          (sum, j) => sum + (j.passed || 0),
          0
        );
        const failedSteps = desktopModules.reduce(
          (sum, j) => sum + (j.failed || 0),
          0
        );
        const totalDuration = desktopModules.reduce(
          (sum, j) => sum + (j.duration || 0),
          0
        );

        mockResults.desktop = {
          total: totalJourneys,
          passed: passedJourneys,
          failed: failedJourneys,
          skipped: 0,
          duration: totalDuration,
          lastRun: desktopRawLog.executed_at,
          modules: desktopModules,
          totalSteps,
          passedSteps,
          failedSteps,
        };
      }
      res.json(mockResults.desktop);
    } else {
      res.json({
        message: "Not implemented specifically, use /api/test-results",
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/tab-performance/:system", async (req, res) => {
  try {
    const system = req.params.system.toUpperCase();
    if (system !== "OMS" && system !== "PARTNER_PANEL") {
      return res
        .status(400)
        .json({ error: "Invalid system. Use 'OMS' or 'PARTNER_PANEL'" });
    }

    const days = parseInt(req.query.days || "7");
    const tabPerformance = await fetchTabPerformance(system, days);
    res.json(tabPerformance);
  } catch (error) {
    console.error("Error in /api/tab-performance:", error);
    res.status(500).json({ error: "Failed to fetch tab performance" });
  }
});

app.get("/api/recent-failures", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "20");
    const failures = await fetchRecentFailures(limit);
    res.json(failures);
  } catch (error) {
    console.error("Error in /api/recent-failures:", error);
    res.status(500).json({ error: "Failed to fetch recent failures" });
  }
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
