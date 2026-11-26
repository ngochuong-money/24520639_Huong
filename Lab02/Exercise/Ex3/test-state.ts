import type { ViewState } from "./state-machine";
const idle: ViewState<string[]> = {
  status: "IDLE"
};

const loading: ViewState<string[]> = {
  status: "LOADING"
};

const success: ViewState<string[]> = {
  status: "SUCCESS",
  data: ["Task 1", "Task 2"]
};

const error: ViewState<string[]> = {
  status: "ERROR",
  error: "Connection failed"
};






const invalid: ViewState<string[]> = {
  status: "PENDING"
};