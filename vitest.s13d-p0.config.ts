import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

const projectId = process.env.FIREBASE_PROJECT_ID?.startsWith("demo-")
  ? process.env.FIREBASE_PROJECT_ID
  : "demo-s13d-ci-emulator-test";

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_USE_FIREBASE_EMULATORS": JSON.stringify("true"),
    "import.meta.env.VITE_FIREBASE_DEMO_PROJECT_ID": JSON.stringify(projectId),
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: [
      "src/test/eventFormFunctions.test.ts",
      "src/test/eventFormSparkIntegration.test.ts",
      "src/test/counselingSafeDeleteV2.test.ts",
      "src/test/counselingHandwritingAutosaveRules.test.tsx",
      "src/test/counselingHandwritingRules.test.ts",
      "src/test/counselingHandwritingEmulatorUI.test.tsx",
      "src/test/counselingRevisionWritePaths.test.ts",
      "src/test/userRegistrationHandwritingUI.test.tsx",
      "src/test/counselingForceDeleteEmulatorUI.test.tsx",
    ],
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
