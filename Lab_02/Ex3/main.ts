
import type { ViewState } from "./state-machine";
import { createSkeleton } from "./skeleton";
import { createErrorBoundary } from "./error-boundary";
import "./skeleton.css";

type Item = {
  id: number;
  title: string;
};

let state: ViewState<Item[]> = {
  status: "IDLE"
};

let requestId = 0;

const root = document.getElementById("app");

async function fetchFeed(): Promise<Item[]> {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/todos?_limit=5"
  );

  if (!response.ok) {
    throw new Error("Unable to load data.");
  }

  return (await response.json()) as Item[];
}

async function loadData(): Promise<void> {
  const currentRequest = ++requestId;

  state = { status: "LOADING" };
  render();

  try {
    const items = await fetchFeed();

    if (currentRequest !== requestId) {
      return;
    }

    state = {
      status: "SUCCESS",
      data: items
    };
  } catch (error: unknown) {
    if (currentRequest !== requestId) {
      return;
    }

    state = {
      status: "ERROR",
      error:
        error instanceof Error
          ? error.message
          : "Unable to connect to server."
    };
  }

  render();
}

function render(): void {
  if (!root) {
    return;
  }

  if (state.status === "LOADING") {
    root.replaceChildren(createSkeleton());
    return;
  }

  if (state.status === "ERROR") {
    root.replaceChildren(
      createErrorBoundary(state.error, loadData)
    );
    return;
  }

  if (state.status === "SUCCESS") {
    const section = document.createElement("section");
    const heading = document.createElement("h2");
    const list = document.createElement("ul");

    heading.textContent = "Loaded Tasks";

    for (const item of state.data) {
      const li = document.createElement("li");
      li.textContent = item.title;
      list.appendChild(li);
    }

    section.append(heading, list);
    root.replaceChildren(section);
    return;
  }

  const message = document.createElement("p");
  message.textContent = "Ready to load tasks.";
  root.replaceChildren(message);
}

render();
void loadData();
