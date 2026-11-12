import type { MetadataRoute } from "next";

// Lets the app be added to the iPhone Home Screen and open full screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ollie",
    short_name: "Ollie",
    description: "The household brain for Project OLYMPUS.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#1f3a5f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
