import type { NextConfig } from "next";
import { validatePublicEnv } from "./src/lib/supabase/env";

// Fail builds before application code is bundled when required public config is
// missing or malformed. Values are never included in the thrown message.
validatePublicEnv();

const nextConfig: NextConfig = {
  // Authenticated studio routes depend on request cookies. Keep the default App
  // Router cache behaviour until a future feature has a measured caching need.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
