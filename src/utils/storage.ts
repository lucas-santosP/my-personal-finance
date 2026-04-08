import { STORAGE_KEY } from "../constants";
import type { MonthsMap } from "../types";

export function loadData(): MonthsMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") || {};
  } catch {
    return {};
  }
}

export function saveData(d: MonthsMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}
