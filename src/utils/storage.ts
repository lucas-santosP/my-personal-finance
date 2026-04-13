import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { MonthData, MonthsMap } from "../types";

const monthsCol = (uid: string) => collection(db, "users", uid, "months");
const monthDoc = (uid: string, key: string) => doc(db, "users", uid, "months", key);

export async function loadAllMonths(uid: string): Promise<MonthsMap> {
  const snap = await getDocs(monthsCol(uid));
  const result: MonthsMap = {};
  snap.forEach((d) => {
    result[d.id] = d.data() as MonthData;
  });
  return result;
}

export async function saveMonth(uid: string, key: string, data: MonthData): Promise<void> {
  await setDoc(monthDoc(uid, key), data);
}

export async function deleteMonthDoc(uid: string, key: string): Promise<void> {
  await deleteDoc(monthDoc(uid, key));
}

export async function replaceAllMonths(uid: string, data: MonthsMap): Promise<void> {
  const existing = await getDocs(monthsCol(uid));
  const batch = writeBatch(db);
  existing.forEach((d) => batch.delete(d.ref));
  Object.entries(data).forEach(([key, monthData]) => {
    batch.set(monthDoc(uid, key), monthData);
  });
  await batch.commit();
}
