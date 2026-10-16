
export function createSkeleton(): HTMLElement {
  const skeleton = document.createElement("section");
  skeleton.className = "skeleton";
  skeleton.setAttribute("aria-busy", "true");
  skeleton.setAttribute("aria-label", "Loading content");

  const title = document.createElement("div");
  title.className = "skeleton-title";
  title.setAttribute("aria-hidden", "true");

  const line = document.createElement("div");
  line.className = "skeleton-line";
  line.setAttribute("aria-hidden", "true");

  skeleton.append(title, line);

  return skeleton;
}
