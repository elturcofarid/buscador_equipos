export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3004/api/v1";

export type RegisterPayload = {
  email: string;
  fullName: string;
  dateOfBirth: string;
  password: string;
  role?: "PLAYER" | "CLUB_MEMBER";
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
  clubId?: string;
  teamId?: string | null;
  createdByUserId?: string;
  title: string;
  description: string;
  category: string | null;
  gender: string | null;
  modality: string;
  primaryPosition: string;
  secondaryPositions?: string[];
  ageMin: number | null;
  ageMax: number | null;
  locationLabel: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  level: string | null;
  opportunityType: string;
  requirements?: string | null;
  deadlineAt?: string | null;
  status: string;
  club: {
    id: string;
    name: string;
    city: string | null;
    verificationStatus: string;
  };
};

export type Club = {
  id: string;
  name: string;
  normalizedName?: string;
  federationRegion: string | null;
  city: string | null;
  province: string | null;
  country: string;
  website: string | null;
  contactEmail: string | null;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
};

export type ClubMembership = {
  id: string;
  clubId: string;
  userId: string;
  role: string;
  verificationStatus: string;
  verificationMethod: string | null;
  club: Club;
  createdAt: string;
  updatedAt: string;
};

export type PlayerApplication = {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  opportunity: Opportunity;
};

export type ClubApplication = {
  id: string;
  message: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  opportunity: Opportunity;
  playerProfile: PlayerProfile & {
    user: {
      id: string;
      email: string;
      fullName: string;
    };
  };
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

export type CreateClubPayload = {
  name: string;
  city?: string;
  province?: string;
  federationRegion?: string;
  website?: string;
  contactEmail?: string;
};

export type CreateOpportunityPayload = {
  clubId: string;
  title: string;
  description: string;
  category?: string;
  gender?: string;
  modality: string;
  primaryPosition: string;
  secondaryPositions?: string[];
  ageMin?: number;
  ageMax?: number;
  locationLabel?: string;
  level?: string;
  opportunityType: string;
  requirements?: string;
  deadlineAt?: string;
};

export type UpdateOpportunityPayload = Partial<
  Omit<CreateOpportunityPayload, "clubId" | "ageMin" | "ageMax">
> & {
  ageMin?: number | null;
  ageMax?: number | null;
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

export function listMyClubMemberships(token: string) {
  return apiRequest<ClubMembership[]>("/clubs/mine", { token });
}

export function createClub(token: string, payload: CreateClubPayload) {
  return apiRequest<Club>("/clubs", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function listClubOpportunities(token: string, clubId: string) {
  return apiRequest<Opportunity[]>(`/clubs/${clubId}/opportunities`, {
    token
  });
}

export function createOpportunity(
  token: string,
  payload: CreateOpportunityPayload
) {
  return apiRequest<Opportunity>("/opportunities", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function updateOpportunity(
  token: string,
  opportunityId: string,
  payload: UpdateOpportunityPayload
) {
  return apiRequest<Opportunity>(`/opportunities/${opportunityId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload)
  });
}

export function deleteOpportunity(token: string, opportunityId: string) {
  return apiRequest<Opportunity>(`/opportunities/${opportunityId}`, {
    method: "DELETE",
    token
  });
}

export function publishOpportunity(token: string, opportunityId: string) {
  return apiRequest<Opportunity>(`/opportunities/${opportunityId}/publish`, {
    method: "POST",
    token
  });
}

export function pauseOpportunity(token: string, opportunityId: string) {
  return apiRequest<Opportunity>(`/opportunities/${opportunityId}/pause`, {
    method: "POST",
    token
  });
}

export function closeOpportunity(token: string, opportunityId: string) {
  return apiRequest<Opportunity>(`/opportunities/${opportunityId}/close`, {
    method: "POST",
    token
  });
}

export function listClubApplications(token: string, clubId: string) {
  return apiRequest<ClubApplication[]>(`/clubs/${clubId}/applications`, {
    token
  });
}

export function updateApplicationStatus(
  token: string,
  applicationId: string,
  status: string
) {
  return apiRequest<ClubApplication>(`/applications/${applicationId}/status`, {
    method: "PUT",
    token,
    body: JSON.stringify({ status })
  });
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
