import { createSkeleton } from "./skeleton";
import "./skeleton.css";
export type ViewState<T> =
  | { status: "IDLE" }
    | { status: "LOADING" }
    | { status: "SUCCESS"; data: T }
    | { status: "ERROR"; error: string };
