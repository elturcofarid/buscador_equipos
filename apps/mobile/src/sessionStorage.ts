import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { Session } from "./api";

const SESSION_KEY = "bpf_mobile_session";

export async function loadStoredSession(): Promise<Session | null> {
  const rawSession = await readStoredValue();

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as Session;
  } catch {
    await clearStoredSession();
    return null;
  }
}

export async function storeSession(session: Session) {
  await writeStoredValue(JSON.stringify(session));
}

export async function clearStoredSession() {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_KEY);
}

async function readStoredValue() {
  if (Platform.OS === "web") {
    return getWebStorage()?.getItem(SESSION_KEY) ?? null;
  }

  return SecureStore.getItemAsync(SESSION_KEY);
}

async function writeStoredValue(value: string) {
  if (Platform.OS === "web") {
    getWebStorage()?.setItem(SESSION_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, value);
}

function getWebStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}
