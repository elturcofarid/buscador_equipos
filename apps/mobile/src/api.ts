export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3004/api/v1";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  primaryRole: string;
};

export type Session = {
  accessToken: string;
  user: SessionUser;
};

export type Opportunity = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  gender: string | null;
  modality: string;
  primaryPosition: string;
  ageMin: number | null;
  ageMax: number | null;
  locationLabel: string | null;
  level: string | null;
  opportunityType: string;
  status: string;
  club: {
    id: string;
    name: string;
    city: string | null;
    verificationStatus: string;
  };
};

export type PlayerProfilePayload = {
  displayName: string;
  primaryPosition: string;
  modality: string;
  availabilityStatus: string;
  locationLabel: string;
  searchRadiusKm: number;
};

type RequestOptions = RequestInit & {
  token?: string | null;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers ?? {})
    }
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body?.message === "string"
        ? body.message
        : "No se pudo completar la accion";
    throw new Error(message);
  }

  return body as T;
}

export function login(email: string, password: string) {
  return apiRequest<Session>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function listOpportunities() {
  return apiRequest<Opportunity[]>("/opportunities?limit=30");
}

export function savePlayerProfile(
  token: string,
  payload: PlayerProfilePayload
) {
  return apiRequest("/players/me", {
    method: "PUT",
    token,
    body: JSON.stringify(payload)
  });
}

export function applyToOpportunity(
  token: string,
  opportunityId: string,
  message: string
) {
  return apiRequest(`/opportunities/${opportunityId}/applications`, {
    method: "POST",
    token,
    body: JSON.stringify({ message })
  });
}
