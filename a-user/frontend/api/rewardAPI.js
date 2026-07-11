import {API_BASE} from "../config.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REWARD_API_BASE = `${API_BASE}/api/rewards`;

export async function getRewards() {
  const res = await fetch(REWARD_API_BASE);
  if (!res.ok) throw new Error("Failed to fetch rewards");
  return res.json();
}

export async function createReward({ name, points, stocks, imageFile }) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("points", points);
  formData.append("stocks", stocks);
  if (imageFile) formData.append("image", imageFile);

  const res = await fetch(REWARD_API_BASE, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Failed to create reward");
  return res.json();
}

export async function updateReward(id, { name, points, stocks, imageFile }) {
  const formData = new FormData();
  if (name !== undefined) formData.append("name", name);
  if (points !== undefined) formData.append("points", points);
  if (stocks !== undefined) formData.append("stocks", stocks);
  if (imageFile) formData.append("image", imageFile);

  const res = await fetch(`${REWARD_API_BASE}/${id}`, { method: "PUT", body: formData });
  if (!res.ok) throw new Error("Failed to update reward");
  return res.json();
}

export async function deleteReward(id) {
  const res = await fetch(`${REWARD_API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete reward");
  return res.json();
}

export const redeemReward = async (rewardId, householdId) => {
  const token = await AsyncStorage.getItem("token");
  const res = await fetch(`${API_BASE}/api/rewards/${rewardId}/redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ householdId }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to redeem reward");
  }
  return data;
};

export const getHouseholdActivity = async (householdId, limit = 10) => {
  const token = await AsyncStorage.getItem("token");
  const res = await fetch(`${API_BASE}/api/households/${householdId}/activity?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch activity");
  return data.data;
};