
export function createErrorBoundary(
  message: string,
  onRetry: () => void
): HTMLElement {
  const section = document.createElement("section");
  section.className = "error-boundary";
  section.setAttribute("role", "alert");

  const errorMessage = document.createElement("p");
  errorMessage.textContent = `Connection failed: ${message}`;

  const retryButton = document.createElement("button");
  retryButton.type = "button";
  retryButton.textContent = "Retry Connection";

  section.append(errorMessage, retryButton);

  section.addEventListener("click", (event) => {
    if (event.target === retryButton) {
      onRetry();
    }
  });

  return section;
}
