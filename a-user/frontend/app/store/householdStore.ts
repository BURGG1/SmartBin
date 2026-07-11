import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "@/config";

type Household = any;

let household: Household | null = null;
let listeners: Array<() => void> = [];

const emit = () => listeners.forEach((l) => l());

export function getHousehold() {
  return household;
}

export function setHousehold(next: Household | null) {
  household = next;
  emit();
}

// Adjusts points immediately in the UI without waiting on a network round trip
export function updatePointsLocally(delta: number) {
  if (!household) return;
  household = {
    ...household,
    points: {
      total: (household.points?.total ?? 0) + delta,
      thisMonth: (household.points?.thisMonth ?? 0) + delta,
    },
  };
  emit();
}

export async function fetchHousehold() {
  try {
    const token = await AsyncStorage.getItem("token");
    const userStr = await AsyncStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user?.id) return null;

    const res = await fetch(`${API_BASE}/api/households/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      setHousehold(data.data);
      return data.data;
    }
  } catch (err) {
    console.error("Failed to fetch household:", err);
  }
  return null;
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function useHousehold(): Household | null {
  return useSyncExternalStore(subscribe, getHousehold, getHousehold);
}