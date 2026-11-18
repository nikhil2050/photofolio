import type { NextConfig } from "next";

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
