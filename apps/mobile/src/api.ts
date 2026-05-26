export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3004/api/v1";

export type RegisterPayload = {
  email: string;
  fullName: string;
  dateOfBirth: string;
  password: string;
};

export type PlayerProfile = {
  id: string;
  userId: string;
  displayName: string | null;
  gender: string | null;
  primaryPosition: string | null;
  secondaryPositions: string[];
  dominantFoot: string | null;
  category: string | null;
  modality: string | null;
  availabilityStatus: string | null;
  locationLabel: string | null;
  locationLat: number | null;
  locationLng: number | null;
  searchRadiusKm: number | null;
  bio: string | null;
  visibilityLevel: string;
  createdAt: string;
  updatedAt: string;
};

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  primaryRole: string;
  playerProfile?: PlayerProfile | null;
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

export type PlayerApplication = {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  opportunity: Opportunity;
};

export type PlayerProfilePayload = {
  displayName?: string;
  gender?: string;
  primaryPosition?: string;
  secondaryPositions?: string[];
  dominantFoot?: string;
  category?: string;
  modality?: string;
  availabilityStatus?: string;
  locationLabel?: string;
  locationLat?: number;
  locationLng?: number;
  searchRadiusKm?: number;
  bio?: string;
  visibilityLevel?: string;
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

export function registerPlayer(payload: RegisterPayload) {
  return apiRequest<Session>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getCurrentSession(token: string): Promise<Session> {
  const user = await apiRequest<SessionUser>("/auth/me", { token });
  return { accessToken: token, user };
}

export function listOpportunities() {
  return apiRequest<Opportunity[]>("/opportunities?limit=30");
}

export function getPlayerProfile(token: string) {
  return apiRequest<PlayerProfile | null>("/players/me", { token });
}

export function savePlayerProfile(
  token: string,
  payload: PlayerProfilePayload
) {
  return apiRequest<PlayerProfile>("/players/me", {
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

export function listMyApplications(token: string) {
  return apiRequest<PlayerApplication[]>("/players/me/applications", {
    token
  });
}

export function withdrawApplication(token: string, applicationId: string) {
  return apiRequest<PlayerApplication>(`/applications/${applicationId}/withdraw`, {
    method: "POST",
    token
  });
}
