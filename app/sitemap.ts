import type { MetadataRoute } from "next";
import { site, allRoutes } from "@/lib/site";
import { projectsWithPages } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Each project with a page of its own also has a booking page of its own.
  const routes = [
    ...allRoutes,
    ...projectsWithPages.map((project) => `/site-booking/${project.slug}`),
  ];

  return routes.map((route) => ({
    url: new URL(route, site.url).toString(),
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority:
      route === "/" ? 1 : route === "/contact" || route === "/site-booking" ? 0.9 : 0.8,
  }));
}
