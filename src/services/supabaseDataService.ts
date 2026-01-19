import { supabase } from "./supabaseClient";

export interface SupabaseTestResult {
  id: string;
  platform: string;
  journey_name: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  passed_steps: number;
  failed_steps: number;
  total_steps: number;
  duration_ms: number;
  created_at: string;
  steps?: SupabaseTestStep[];
}

export interface SupabaseTestStep {
  step_name: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  duration_ms: number;
  error_message?: string;
  category?: string;
}

export interface ProcessedPlatformData {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  lastRun: string;
  modules: ProcessedModule[];
}

export interface ProcessedModule {
  name: string;
  passed: number;
  failed: number;
  duration: number;
  status: "PASSED" | "FAILED";
  steps: SupabaseTestStep[];
}

export async function fetchLatestDesktopData(): Promise<ProcessedPlatformData | null> {
  try {
    // Fetch the most recent test results for desktop platform
    const { data: testResults, error } = await supabase
      .from("test_results")
      .select(
        `
        *,
        test_steps (
          step_name,
          status,
          duration_ms,
          error_message,
          category
        )
      `,
      )
      .eq("platform", "desktop")
      .order("created_at", { ascending: false })
      .limit(50); // Get recent results to process

    if (error) {
      console.error("Error fetching desktop data from Supabase:", error);
      return null;
    }

    if (!testResults || testResults.length === 0) {
      console.log("No desktop test results found in Supabase");
      return null;
    }

    // Process the data to match the expected format
    const processedData = processSupabaseData(testResults);
    return processedData;
  } catch (error) {
    console.error("Error in fetchLatestDesktopData:", error);
    return null;
  }
}

function processSupabaseData(testResults: any[]): ProcessedPlatformData {
  // Group results by journey name to get the latest result for each journey
  const journeyMap = new Map<string, any>();

  testResults.forEach((result) => {
    const journeyName = result.journey_name;
    if (
      !journeyMap.has(journeyName) ||
      new Date(result.created_at) >
        new Date(journeyMap.get(journeyName).created_at)
    ) {
      journeyMap.set(journeyName, result);
    }
  });

  const latestResults = Array.from(journeyMap.values());

  // Calculate totals
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let totalDuration = 0;
  let latestTimestamp = "";

  const modules: ProcessedModule[] = latestResults.map((result) => {
    const passed = result.passed_steps || 0;
    const failed = result.failed_steps || 0;
    const total = result.total_steps || 0;
    const skipped = total - passed - failed;
    const duration = result.duration_ms || 0;

    totalPassed += passed;
    totalFailed += failed;
    totalSkipped += skipped;
    totalDuration += duration;

    // Track the latest timestamp
    if (
      !latestTimestamp ||
      new Date(result.created_at) > new Date(latestTimestamp)
    ) {
      latestTimestamp = result.created_at;
    }

    return {
      name: result.journey_name,
      passed,
      failed,
      duration,
      status: result.status || (failed > 0 ? "FAILED" : "PASSED"),
      steps: result.test_steps || [],
    };
  });

  return {
    total: totalPassed + totalFailed + totalSkipped,
    passed: totalPassed,
    failed: totalFailed,
    skipped: totalSkipped,
    duration: totalDuration,
    lastRun: latestTimestamp || new Date().toISOString(),
    modules,
  };
}

export async function fetchAllPlatformsData() {
  try {
    // For now, only fetch desktop data as requested
    const desktopData = await fetchLatestDesktopData();

    return {
      desktop: desktopData,
      // Keep other platforms as they were (using existing API or mock data)
      mobile: null,
      android: null, // Partner Panel
      ios: null,
      oms: null,
    };
  } catch (error) {
    console.error("Error fetching all platforms data:", error);
    return {
      desktop: null,
      mobile: null,
      android: null,
      ios: null,
      oms: null,
    };
  }
}
