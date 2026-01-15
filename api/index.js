import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || "https://wnymknrycmldwqzdqoct.supabase.co";
const supabaseKey =
  process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueW1rbnJ5Y21sZHdxemRxb2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcwMDk1MywiZXhwIjoyMDgzMjc2OTUzfQ.HCK8yC6jRIb67LUxOEEXI_dLs_fXcLK6m4_50iN8tPU";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function generateMockTestResults() {
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
      totalSteps: 1000,
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
}

async function fetchLatestSystemRun(system) {
  try {
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

    const { data: journeys, error: journeysError } = await supabase
      .from("journeys")
      .select("*")
      .eq("run_id", latestRun.run_id)
      .order("journey_number", { ascending: true });

    if (journeysError) {
      console.error(`Error fetching ${system} journeys:`, journeysError);
      return null;
    }

    const { data: steps, error: stepsError } = await supabase
      .from("steps")
      .select("*")
      .eq("run_id", latestRun.run_id)
      .order("step_number", { ascending: true });

    if (stepsError) {
      console.error(`Error fetching ${system} steps:`, stepsError);
      return null;
    }

    const journeysWithSteps = (journeys || []).map((journey) => {
      const journeySteps = (steps || []).filter(
        (step) => step.journey_id === journey.journey_id
      );
      return {
        ...journey,
        steps: journeySteps,
      };
    });

    const { data: recentRuns, error: summaryError } = await supabase
      .from("test_runs")
      .select("success_rate, total_runtime_ms, executed_at")
      .eq("metadata->>system", system)
      .order("executed_at", { ascending: false })
      .limit(10);

    if (summaryError) {
      console.error(`Error fetching ${system} summary:`, summaryError);
    }

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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }
  try {
    const mockResults = generateMockTestResults();

    const today = new Date();
    const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const { data: rawLogs, error: rawLogsError } = await supabase
      .from("raw_test_logs")
      .select("*")
      .gte("executed_at", yesterday.toISOString())
      .lt("executed_at", endOfToday.toISOString())
      .order("executed_at", { ascending: false });

    if (rawLogsError) {
      console.error("Error fetching raw_test_logs:", rawLogsError);
    }

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
        total: ppJourneys.length,
        passed: ppJourneys.filter((j) => j.status === "PASSED").length,
        failed: ppJourneys.filter((j) => j.status === "FAILED").length,
        skipped: 0,
        duration: ppJourneys.reduce((sum, j) => sum + (j.duration || 0), 0),
        lastRun: ppData.latestRun.executed_at,
        modules: ppJourneys,
      };
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(mockResults));
  } catch (error) {
    console.error("Error in /api/index:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Failed to fetch test results" }));
  }
}
