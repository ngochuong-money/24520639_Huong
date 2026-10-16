
import { useState, renderApp } from "./reactive-engine.js";

function TaskApp() {
  const [tasks, setTasks] = useState([
    "Review PR",
    "Verify AST"
  ]);

  const [filter, setFilter] = useState("ALL");

  const visibleTasks =
    filter === "ALL" ? tasks : [];

  const main = document.createElement("main");
  main.className = "app-container";

  const header = document.createElement("header");

  const title = document.createElement("h2");
  title.textContent = `Tasks: ${tasks.length}`;
  header.appendChild(title);

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.textContent = "Add Task";

  addButton._onClick = () => {
    setTasks([
      ...tasks,
      `Task ${Date.now()}`
    ]);
  };

  const filterButton = document.createElement("button");
  filterButton.type = "button";
  filterButton.textContent = `Filter: ${filter}`;

  filterButton._onClick = () => {
    setFilter(filter === "ALL" ? "NONE" : "ALL");
  };

  const list = document.createElement("ul");

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.textContent = task;
    list.appendChild(item);
  });

  main.append(header, addButton, filterButton, list);

  return main;
}

renderApp(TaskApp, document.getElementById("app"));
