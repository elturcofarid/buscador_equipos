import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import {
  API_BASE_URL,
  ClubApplication,
  ClubCatalogItem,
  ClubMembership,
  Conversation,
  ConversationMessage,
  CreateClubPayload,
  CreateOpportunityPayload,
  Opportunity,
  PlayerApplication,
  PlayerProfile,
  PlayerProfilePayload,
  Session,
  UpdateOpportunityPayload,
  applyToOpportunity,
  closeOpportunity,
  createClub,
  createOpportunity,
  deleteOpportunity,
  getCurrentSession,
  getPlayerProfile,
  getApplicationConversation,
  listClubCatalog,
  listClubApplications,
  listClubOpportunities,
  listConversationMessages,
  listConversations,
  listMyClubMemberships,
  listMyApplications,
  listOpportunities,
  login,
  pauseOpportunity,
  publishOpportunity,
  registerPlayer,
  requestClubMembership,
  savePlayerProfile,
  sendConversationMessage,
  updateOpportunity,
  updateApplicationStatus,
  withdrawApplication
} from "./api";
import {
  clearStoredSession,
  loadStoredSession,
  storeSession
} from "./sessionStorage";

type ViewMode =
  | "search"
  | "opportunityDetail"
  | "applications"
  | "messages"
  | "club"
  | "account";
type AuthMode = "login" | "register";
type RegistrationRole = "PLAYER" | "CLUB_MEMBER";
type ClubForm = {
  name: string;
  city: string;
  province: string;
  federationRegion: string;
  contactEmail: string;
  website: string;
};
type ClubCatalogFilterForm = {
  search: string;
  federation: string;
  category: string;
  level: string;
};
type OpportunityForm = {
  title: string;
  description: string;
  category: string;
  gender: string;
  modality: string;
  primaryPosition: string;
  ageMin: string;
  ageMax: string;
  locationLabel: string;
  level: string;
  opportunityType: string;
  requirements: string;
};
type ProfileForm = {
  displayName: string;
  primaryPosition: string;
  modality: string;
  availabilityStatus: string;
  locationLabel: string;
  searchRadiusKm: string;
  category: string;
  dominantFoot: string;
  bio: string;
};

const defaultProfileForm: ProfileForm = {
  displayName: "Jugador Candidato",
  primaryPosition: "Portero",
  modality: "FOOTBALL_11",
  availabilityStatus: "Disponible",
  locationLabel: "Madrid",
  searchRadiusKm: "30",
  category: "Senior",
  dominantFoot: "Derecho",
  bio: ""
};

const defaultClubForm: ClubForm = {
  name: "",
  city: "Madrid",
  province: "Madrid",
  federationRegion: "Real Federacion de Futbol de Madrid",
  contactEmail: "",
  website: ""
};

const defaultClubCatalogFilters: ClubCatalogFilterForm = {
  search: "",
  federation: "RFFM",
  category: "",
  level: ""
};

const defaultOpportunityForm: OpportunityForm = {
  title: "Buscamos jugador para prueba",
  description: "Convocatoria abierta para realizar una prueba con el equipo.",
  category: "Senior",
  gender: "MALE",
  modality: "FOOTBALL_11",
  primaryPosition: "Portero",
  ageMin: "18",
  ageMax: "35",
  locationLabel: "Madrid",
  level: "Amateur",
  opportunityType: "TRIAL",
  requirements: ""
};

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("search");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [registrationRole, setRegistrationRole] =
    useState<RegistrationRole>("PLAYER");
  const [fullName, setFullName] = useState("Jugador Candidato");
  const [dateOfBirth, setDateOfBirth] = useState("1999-01-01");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [profileForm, setProfileForm] =
    useState<ProfileForm>(defaultProfileForm);
  const [clubForm, setClubForm] = useState<ClubForm>(defaultClubForm);
  const [clubCatalogFilters, setClubCatalogFilters] =
    useState<ClubCatalogFilterForm>(defaultClubCatalogFilters);
  const [clubCatalog, setClubCatalog] = useState<ClubCatalogItem[]>([]);
  const [selectedCatalogClub, setSelectedCatalogClub] =
    useState<ClubCatalogItem | null>(null);
  const [manualClubMode, setManualClubMode] = useState(false);
  const [opportunityForm, setOpportunityForm] =
    useState<OpportunityForm>(defaultOpportunityForm);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<PlayerApplication[]>([]);
  const [clubMemberships, setClubMemberships] = useState<ClubMembership[]>([]);
  const [clubOpportunities, setClubOpportunities] = useState<Opportunity[]>([]);
  const [clubApplications, setClubApplications] = useState<ClubApplication[]>(
    []
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<
    string | null
  >(null);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [editingOpportunityId, setEditingOpportunityId] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState(
    "Estoy disponible para una prueba esta semana."
  );
  const [messageDraft, setMessageDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [clubLoading, setClubLoading] = useState(false);
  const [clubCatalogLoading, setClubCatalogLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sessionRestoring, setSessionRestoring] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedOpportunity = useMemo(
    () =>
      opportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ??
      opportunities[0],
    [opportunities, selectedOpportunityId]
  );
  const screenTitle = getScreenTitle(viewMode);
  const selectedClubMembership = useMemo(
    () =>
      clubMemberships.find(
        (membership) => membership.club.id === selectedClubId
      ) ?? clubMemberships[0],
    [clubMemberships, selectedClubId]
  );
  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId
      ) ?? conversations[0],
    [conversations, selectedConversationId]
  );
  const isPlayerSession = session?.user.primaryRole === "PLAYER";
  const isClubSession = session?.user.primaryRole === "CLUB_MEMBER";

  useEffect(() => {
    void refreshOpportunities();
    void restorePreviousSession();
  }, []);

  async function refreshOpportunities() {
    setLoading(true);
    setNotice("");

    try {
      const result = await listOpportunities();
      setOpportunities(result);
      if (result.length > 0 && !selectedOpportunityId) {
        setSelectedOpportunityId(result[0].id);
      }
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar busquedas"
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshApplications(
    authToken = session?.accessToken,
    role = session?.user.primaryRole
  ) {
    if (!authToken || role !== "PLAYER") {
      setApplications([]);
      return;
    }

    setLoading(true);
    setNotice("");

    try {
      const result = await listMyApplications(authToken);
      setApplications(result);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar postulaciones"
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshConversations(
    authToken = session?.accessToken,
    role = session?.user.primaryRole,
    clubId = role === "CLUB_MEMBER" ? selectedClubId : undefined
  ) {
    if (!authToken || (role !== "PLAYER" && role !== "CLUB_MEMBER")) {
      setConversations([]);
      setConversationMessages([]);
      setSelectedConversationId(null);
      return;
    }

    setMessagesLoading(true);

    try {
      const result = await listConversations(
        authToken,
        role === "CLUB_MEMBER" ? clubId : undefined
      );
      setConversations(result);

      const nextConversationId =
        result.find(
          (conversation) => conversation.id === selectedConversationId
        )?.id ?? result[0]?.id ?? null;
      setSelectedConversationId(nextConversationId);

      if (nextConversationId) {
        const messages = await listConversationMessages(
          authToken,
          nextConversationId
        );
        setConversationMessages(messages);
      } else {
        setConversationMessages([]);
      }
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar mensajes"
      );
    } finally {
      setMessagesLoading(false);
    }
  }

  async function refreshConversationMessages(
    authToken = session?.accessToken,
    conversationId = selectedConversationId
  ) {
    if (!authToken || !conversationId) {
      setConversationMessages([]);
      return;
    }

    setMessagesLoading(true);

    try {
      const messages = await listConversationMessages(authToken, conversationId);
      setConversationMessages(messages);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar mensajes"
      );
    } finally {
      setMessagesLoading(false);
    }
  }

  async function refreshClubMemberships(
    authToken = session?.accessToken,
    role = session?.user.primaryRole
  ) {
    if (!authToken || role !== "CLUB_MEMBER") {
      setClubMemberships([]);
      setClubOpportunities([]);
      setClubApplications([]);
      setConversations([]);
      setConversationMessages([]);
      setSelectedClubId(null);
      setSelectedConversationId(null);
      return;
    }

    setClubLoading(true);

    try {
      const memberships = await listMyClubMemberships(authToken);
      setClubMemberships(memberships);

      const nextMembership =
        memberships.find((membership) => membership.club.id === selectedClubId) ??
        memberships[0];
      const nextClubId = nextMembership?.club.id ?? null;
      setSelectedClubId(nextClubId);

      if (nextMembership) {
        await refreshClubWorkspace(authToken, nextMembership);
      } else {
        setClubOpportunities([]);
        setClubApplications([]);
      }
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar clubes"
      );
    } finally {
      setClubLoading(false);
    }
  }

  async function refreshClubCatalog(
    authToken = session?.accessToken,
    role = session?.user.primaryRole
  ) {
    if (!authToken || role !== "CLUB_MEMBER") {
      setClubCatalog([]);
      return;
    }

    setClubCatalogLoading(true);
    setNotice("");

    try {
      const result = await listClubCatalog(authToken, {
        ...clubCatalogFilters,
        limit: 30
      });
      setClubCatalog(result);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el catalogo de clubes"
      );
    } finally {
      setClubCatalogLoading(false);
    }
  }

  async function refreshClubWorkspace(
    authToken = session?.accessToken,
    membership = selectedClubMembership
  ) {
    if (!authToken || !membership) {
      setClubOpportunities([]);
      setClubApplications([]);
      return;
    }

    setClubLoading(true);

    try {
      const ownOpportunities = await listClubOpportunities(
        authToken,
        membership.club.id
      );
      setClubOpportunities(ownOpportunities);

      if (isVerifiedClubMembership(membership)) {
        const receivedApplications = await listClubApplications(
          authToken,
          membership.club.id
        );
        setClubApplications(receivedApplications);
      } else {
        setClubApplications([]);
      }
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el portal club"
      );
    } finally {
      setClubLoading(false);
    }
  }

  async function restorePreviousSession() {
    setSessionRestoring(true);

    try {
      const storedSession = await loadStoredSession();

      if (!storedSession) {
        return;
      }

      const verifiedSession = await getCurrentSession(storedSession.accessToken);
      await activateSession(verifiedSession, "Sesion restaurada");
    } catch {
      await clearStoredSession();
      setSession(null);
      setApplications([]);
      setNotice("La sesion guardada vencio. Vuelve a entrar.");
    } finally {
      setSessionRestoring(false);
    }
  }

  async function activateSession(nextSession: Session, successMessage: string) {
    setSession(nextSession);
    setEmail(nextSession.user.email);
    setFullName(nextSession.user.fullName || fullName);
    await storeSession(nextSession);
    if (nextSession.user.primaryRole === "PLAYER") {
      await ensurePlayerProfile(nextSession);
      await refreshApplications(nextSession.accessToken, nextSession.user.primaryRole);
      await refreshConversations(
        nextSession.accessToken,
        nextSession.user.primaryRole
      );
      setClubMemberships([]);
      setClubOpportunities([]);
      setClubApplications([]);
      setClubCatalog([]);
      setSelectedCatalogClub(null);
      setManualClubMode(false);
      setSelectedClubId(null);
      setViewMode("search");
    } else if (nextSession.user.primaryRole === "CLUB_MEMBER") {
      setApplications([]);
      await refreshClubMemberships(
        nextSession.accessToken,
        nextSession.user.primaryRole
      );
      await refreshClubCatalog(
        nextSession.accessToken,
        nextSession.user.primaryRole
      );
      await refreshConversations(
        nextSession.accessToken,
        nextSession.user.primaryRole,
        undefined
      );
      setViewMode("club");
    }
    setNotice(successMessage);
  }

  async function ensurePlayerProfile(nextSession: Session) {
    const profile =
      nextSession.user.playerProfile ??
      (await getPlayerProfile(nextSession.accessToken));

    if (profile) {
      syncProfileForm(profile, nextSession.user.fullName);
      return;
    }

    const createdProfile = await savePlayerProfile(
      nextSession.accessToken,
      buildProfilePayload(
        {
          ...defaultProfileForm,
          displayName: nextSession.user.fullName || defaultProfileForm.displayName
        },
        nextSession.user.fullName
      )
    );
    syncProfileForm(createdProfile, nextSession.user.fullName);
  }

  function syncProfileForm(profile: PlayerProfile, fallbackDisplayName: string) {
    setProfileForm({
      displayName:
        profile.displayName ?? fallbackDisplayName ?? defaultProfileForm.displayName,
      primaryPosition:
        profile.primaryPosition ?? defaultProfileForm.primaryPosition,
      modality: profile.modality ?? defaultProfileForm.modality,
      availabilityStatus:
        profile.availabilityStatus ?? defaultProfileForm.availabilityStatus,
      locationLabel: profile.locationLabel ?? defaultProfileForm.locationLabel,
      searchRadiusKm: String(
        profile.searchRadiusKm ?? defaultProfileForm.searchRadiusKm
      ),
      category: profile.category ?? defaultProfileForm.category,
      dominantFoot: profile.dominantFoot ?? defaultProfileForm.dominantFoot,
      bio: profile.bio ?? defaultProfileForm.bio
    });
  }

  function updateProfileField(field: keyof ProfileForm, value: string) {
    setProfileForm((currentProfile) => ({
      ...currentProfile,
      [field]: value
    }));
  }

  function handleSelectCatalogClub(club: ClubCatalogItem) {
    setSelectedCatalogClub(club);
    setManualClubMode(false);
    setClubForm(catalogClubToForm(club));
  }

  function handleUseManualClub() {
    setSelectedCatalogClub(null);
    setManualClubMode(true);
    setClubForm(defaultClubForm);
  }

  function handleClearCatalogSelection() {
    setSelectedCatalogClub(null);
    setManualClubMode(false);
    setClubForm(defaultClubForm);
  }

  async function handleLogin() {
    setLoading(true);
    setNotice("");

    try {
      const nextSession = await login(email.trim(), password);
      await activateSession(nextSession, "Sesion iniciada");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo entrar");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setLoading(true);
    setNotice("");

    try {
      const nextSession = await registerPlayer({
        email: email.trim(),
        fullName: fullName.trim(),
        dateOfBirth,
        password,
        role: registrationRole
      });
      await activateSession(nextSession, "Cuenta creada y sesion guardada");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    if (session && session.user.primaryRole !== "PLAYER") {
      setNotice("Las cuentas de club no pueden postular como jugador");
      setViewMode("club");
      return;
    }

    if (!session || !selectedOpportunity) {
      setNotice("Inicia sesion para postular");
      setViewMode("account");
      return;
    }

    setLoading(true);
    setNotice("");

    try {
      await applyToOpportunity(
        session.accessToken,
        selectedOpportunity.id,
        message
      );
      await refreshApplications(session.accessToken);
      await refreshConversations(session.accessToken, session.user.primaryRole);
      setViewMode("applications");
      setNotice("Postulacion enviada");
      if (Platform.OS !== "web") {
        Alert.alert("Postulacion enviada");
      }
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "No se pudo enviar postulacion"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw(applicationId: string) {
    if (!session || session.user.primaryRole !== "PLAYER") {
      return;
    }

    setLoading(true);
    setNotice("");

    try {
      await withdrawApplication(session.accessToken, applicationId);
      await refreshApplications(session.accessToken);
      await refreshConversations(session.accessToken, session.user.primaryRole);
      setNotice("Postulacion retirada");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "No se pudo retirar"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!session || session.user.primaryRole !== "PLAYER") {
      setNotice("El perfil deportivo solo esta disponible para jugadores");
      return;
    }

    setProfileSaving(true);
    setNotice("");

    try {
      const savedProfile = await savePlayerProfile(
        session.accessToken,
        buildProfilePayload(profileForm, session.user.fullName)
      );
      syncProfileForm(savedProfile, session.user.fullName);
      setNotice("Perfil guardado");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "No se pudo guardar el perfil"
      );
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleCreateClub() {
    if (!session) {
      setViewMode("account");
      setNotice("Inicia sesion para crear un club");
      return;
    }

    if (session.user.primaryRole !== "CLUB_MEMBER") {
      setNotice("Para crear un club debes registrarte como cuenta de club");
      return;
    }

    if (!clubForm.name.trim()) {
      setNotice("Indica el nombre del club");
      return;
    }

    setClubLoading(true);
    setNotice("");

    try {
      if (selectedCatalogClub) {
        const membership = await requestClubMembership(
          session.accessToken,
          selectedCatalogClub.id,
          { role: "OWNER", verificationMethod: "federation_catalog" }
        );
        setSelectedCatalogClub(null);
        setManualClubMode(false);
        setClubForm(defaultClubForm);
        await refreshClubMemberships(session.accessToken);
        setSelectedClubId(membership.club.id);
        setViewMode("club");
        setNotice("Solicitud enviada. El admin validara la gestion del club.");
        return;
      }

      const createdClub = await createClub(
        session.accessToken,
        buildCreateClubPayload(clubForm)
      );
      setClubForm(defaultClubForm);
      await refreshClubMemberships(session.accessToken);
      setSelectedClubId(createdClub.id);
      setViewMode("club");
      setNotice("Club creado. Queda pendiente de verificacion admin.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo crear club");
    } finally {
      setClubLoading(false);
    }
  }

  async function handleSaveClubOpportunity() {
    if (
      !session ||
      session.user.primaryRole !== "CLUB_MEMBER" ||
      !selectedClubMembership
    ) {
      return;
    }

    if (
      !opportunityForm.title.trim() ||
      !opportunityForm.primaryPosition.trim()
    ) {
      setNotice("Completa titulo y posicion de la convocatoria");
      return;
    }

    setClubLoading(true);
    setNotice("");

    try {
      if (editingOpportunityId) {
        await updateOpportunity(
          session.accessToken,
          editingOpportunityId,
          buildUpdateOpportunityPayload(opportunityForm)
        );
      } else {
        await createOpportunity(
          session.accessToken,
          buildCreateOpportunityPayload(
            opportunityForm,
            selectedClubMembership.club.id
          )
        );
      }
      setOpportunityForm(defaultOpportunityForm);
      setEditingOpportunityId(null);
      await refreshClubWorkspace(session.accessToken, selectedClubMembership);
      setNotice(
        editingOpportunityId
          ? "Convocatoria actualizada"
          : "Convocatoria creada como borrador"
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "No se pudo crear la convocatoria"
      );
    } finally {
      setClubLoading(false);
    }
  }

  function handleEditClubOpportunity(opportunity: Opportunity) {
    setEditingOpportunityId(opportunity.id);
    setOpportunityForm(opportunityToForm(opportunity));
    setNotice("Editando convocatoria");
  }

  function handleCancelOpportunityEdit() {
    setEditingOpportunityId(null);
    setOpportunityForm(defaultOpportunityForm);
    setNotice("");
  }

  async function handleOpportunityStatusAction(
    opportunityId: string,
    action: "publish" | "pause" | "close" | "delete"
  ) {
    if (
      !session ||
      session.user.primaryRole !== "CLUB_MEMBER" ||
      !selectedClubMembership
    ) {
      return;
    }

    setClubLoading(true);
    setNotice("");

    try {
      if (action === "publish") {
        await publishOpportunity(session.accessToken, opportunityId);
        setNotice("Convocatoria publicada");
      } else if (action === "pause") {
        await pauseOpportunity(session.accessToken, opportunityId);
        setNotice("Convocatoria pausada");
      } else if (action === "delete") {
        await deleteOpportunity(session.accessToken, opportunityId);
        setNotice("Convocatoria eliminada o inactivada");
      } else {
        await closeOpportunity(session.accessToken, opportunityId);
        setNotice("Convocatoria cerrada");
      }
      await refreshClubWorkspace(session.accessToken, selectedClubMembership);
      await refreshOpportunities();
      if (action === "delete" && editingOpportunityId === opportunityId) {
        setEditingOpportunityId(null);
        setOpportunityForm(defaultOpportunityForm);
      }
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la convocatoria"
      );
    } finally {
      setClubLoading(false);
    }
  }

  async function handleClubApplicationStatus(
    applicationId: string,
    status: string
  ) {
    if (
      !session ||
      session.user.primaryRole !== "CLUB_MEMBER" ||
      !selectedClubMembership
    ) {
      return;
    }

    setClubLoading(true);
    setNotice("");

    try {
      await updateApplicationStatus(session.accessToken, applicationId, status);
      await refreshClubWorkspace(session.accessToken, selectedClubMembership);
      setNotice("Postulacion actualizada");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la postulacion"
      );
    } finally {
      setClubLoading(false);
    }
  }

  async function handleOpenApplicationConversation(applicationId: string) {
    if (!session) {
      setViewMode("account");
      setNotice("Inicia sesion para ver mensajes");
      return;
    }

    setMessagesLoading(true);
    setNotice("");

    try {
      const conversation = await getApplicationConversation(
        session.accessToken,
        applicationId
      );
      setConversations((currentConversations) =>
        upsertConversation(currentConversations, conversation)
      );
      setSelectedConversationId(conversation.id);
      const messages = await listConversationMessages(
        session.accessToken,
        conversation.id
      );
      setConversationMessages(messages);
      setMessageDraft("");
      setViewMode("messages");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "No se pudo abrir la conversacion"
      );
    } finally {
      setMessagesLoading(false);
    }
  }

  async function handleSelectConversation(conversationId: string) {
    setSelectedConversationId(conversationId);
    await refreshConversationMessages(session?.accessToken, conversationId);
  }

  async function handleSendConversationMessage() {
    if (!session || !selectedConversation) {
      return;
    }

    if (!messageDraft.trim()) {
      setNotice("Escribe un mensaje");
      return;
    }

    setMessagesLoading(true);
    setNotice("");

    try {
      const sentMessage = await sendConversationMessage(
        session.accessToken,
        selectedConversation.id,
        messageDraft
      );
      setConversationMessages((currentMessages) => [
        ...currentMessages,
        sentMessage
      ]);
      setMessageDraft("");
      await refreshConversations(
        session.accessToken,
        session.user.primaryRole,
        session.user.primaryRole === "CLUB_MEMBER" ? selectedClubId : undefined
      );
      setSelectedConversationId(selectedConversation.id);
      await refreshConversationMessages(
        session.accessToken,
        selectedConversation.id
      );
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "No se pudo enviar el mensaje"
      );
    } finally {
      setMessagesLoading(false);
    }
  }

  async function logout() {
    await clearStoredSession();
    setSession(null);
    setApplications([]);
    setClubMemberships([]);
    setClubOpportunities([]);
    setClubApplications([]);
    setClubCatalog([]);
    setClubCatalogFilters(defaultClubCatalogFilters);
    setConversations([]);
    setConversationMessages([]);
    setSelectedClubId(null);
    setSelectedCatalogClub(null);
    setSelectedConversationId(null);
    setManualClubMode(false);
    setPassword("");
    setMessageDraft("");
    setNotice("");
    setViewMode("account");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.shell} style={styles.scrollArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Comunidad de Madrid</Text>
            <Text style={styles.title}>{screenTitle}</Text>
          </View>
          <Pressable
            style={styles.iconButton}
            onPress={() => {
              void refreshOpportunities();
              void refreshApplications();
              void refreshClubMemberships();
              void refreshClubCatalog();
              void refreshConversations();
            }}
          >
            <Text style={styles.iconText}>R</Text>
          </Pressable>
        </View>

        <View style={styles.statusRow}>
          <Metric
            label={isClubSession ? "Clubes" : "Busquedas"}
            value={String(isClubSession ? clubMemberships.length : opportunities.length)}
          />
          <Metric
            label={isClubSession ? "Convocatorias" : "Postulaciones"}
            value={String(isClubSession ? clubOpportunities.length : applications.length)}
          />
          <Metric
            label="Sesion"
            value={sessionRestoring ? "Cargando" : session ? "Activa" : "No"}
          />
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        {viewMode === "search" ? (
          <SearchView
            loading={loading}
            opportunities={opportunities}
            selectedOpportunityId={selectedOpportunityId}
            onOpenOpportunity={(opportunityId) => {
              setSelectedOpportunityId(opportunityId);
              setViewMode("opportunityDetail");
            }}
          />
        ) : null}

        {viewMode === "opportunityDetail" ? (
          <OpportunityDetailView
            loading={loading}
            message={message}
            selectedOpportunity={selectedOpportunity}
            session={session}
            setMessage={setMessage}
            onApply={handleApply}
            onBack={() => setViewMode("search")}
            onLoginPress={() => setViewMode("account")}
          />
        ) : null}

        {viewMode === "applications" ? (
          <ApplicationsView
            applications={applications}
            loading={loading}
            session={session}
            onOpenConversation={handleOpenApplicationConversation}
            onLoginPress={() => setViewMode("account")}
            onRefresh={() => void refreshApplications()}
            onWithdraw={handleWithdraw}
          />
        ) : null}

        {viewMode === "messages" ? (
          <MessagesView
            conversations={conversations}
            loading={messagesLoading}
            messageDraft={messageDraft}
            messages={conversationMessages}
            selectedConversation={selectedConversation}
            selectedConversationId={selectedConversationId}
            session={session}
            setMessageDraft={setMessageDraft}
            onLoginPress={() => setViewMode("account")}
            onRefresh={() => void refreshConversations()}
            onRefreshMessages={() => void refreshConversationMessages()}
            onSelectConversation={handleSelectConversation}
            onSendMessage={handleSendConversationMessage}
          />
        ) : null}

        {viewMode === "club" ? (
          <ClubView
            clubApplications={clubApplications}
            clubCatalog={clubCatalog}
            clubCatalogFilters={clubCatalogFilters}
            clubCatalogLoading={clubCatalogLoading}
            clubForm={clubForm}
            clubLoading={clubLoading}
            clubMemberships={clubMemberships}
            clubOpportunities={clubOpportunities}
            editingOpportunityId={editingOpportunityId}
            manualClubMode={manualClubMode}
            opportunityForm={opportunityForm}
            selectedCatalogClub={selectedCatalogClub}
            selectedClubId={selectedClubId}
            selectedClubMembership={selectedClubMembership}
            session={session}
            setClubCatalogFilters={setClubCatalogFilters}
            setClubForm={setClubForm}
            setOpportunityForm={setOpportunityForm}
            onApplicationStatus={handleClubApplicationStatus}
            onCancelOpportunityEdit={handleCancelOpportunityEdit}
            onClearCatalogSelection={handleClearCatalogSelection}
            onCreateClub={handleCreateClub}
            onEditOpportunity={handleEditClubOpportunity}
            onOpenConversation={handleOpenApplicationConversation}
            onLoginPress={() => setViewMode("account")}
            onOpportunityAction={handleOpportunityStatusAction}
            onRefresh={() => {
              void refreshClubMemberships();
              void refreshClubCatalog();
              void refreshConversations();
            }}
            onSaveOpportunity={handleSaveClubOpportunity}
            onSearchClubCatalog={() => void refreshClubCatalog()}
            onSelectClub={(clubId) => {
              const membership = clubMemberships.find(
                (currentMembership) => currentMembership.club.id === clubId
              );
              setSelectedClubId(clubId);
              if (membership && session) {
                void refreshClubWorkspace(session.accessToken, membership);
                void refreshConversations(
                  session.accessToken,
                  session.user.primaryRole,
                  clubId
                );
              }
            }}
            onSelectCatalogClub={handleSelectCatalogClub}
            onUseManualClub={handleUseManualClub}
          />
        ) : null}

        {viewMode === "account" ? (
          <AccountView
            authMode={authMode}
            dateOfBirth={dateOfBirth}
            email={email}
            fullName={fullName}
            loading={loading}
            password={password}
            profileForm={profileForm}
            profileSaving={profileSaving}
            registrationRole={registrationRole}
            session={session}
            setAuthMode={setAuthMode}
            setDateOfBirth={setDateOfBirth}
            setEmail={setEmail}
            setFullName={setFullName}
            setPassword={setPassword}
            setRegistrationRole={setRegistrationRole}
            updateProfileField={updateProfileField}
            onLogin={handleLogin}
            onLogout={logout}
            onRegister={handleRegister}
            onSaveProfile={handleSaveProfile}
          />
        ) : null}

        <Text style={styles.footer}>API: {API_BASE_URL}</Text>
      </ScrollView>
      <BottomNavigation
        applicationsCount={applications.length}
        clubCount={clubMemberships.length}
        messagesCount={conversations.length}
        sessionActive={Boolean(session)}
        sessionRole={session?.user.primaryRole}
        viewMode={viewMode}
        onSelect={(nextViewMode) => {
          setViewMode(nextViewMode);
          if (nextViewMode === "applications") {
            void refreshApplications();
          }
          if (nextViewMode === "messages") {
            void refreshConversations();
          }
        }}
      />
    </SafeAreaView>
  );
}

function SearchView({
  loading,
  opportunities,
  selectedOpportunityId,
  onOpenOpportunity
}: {
  loading: boolean;
  opportunities: Opportunity[];
  selectedOpportunityId: string | null;
  onOpenOpportunity: (opportunityId: string) => void;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.panelTitle}>Busquedas activas</Text>
          <Text style={styles.sectionHint}>
            Selecciona una busqueda para ver el detalle y postular.
          </Text>
        </View>
        {loading ? <ActivityIndicator color="#157f58" /> : null}
      </View>

      {opportunities.length === 0 ? (
        <View style={styles.panel}>
          <Text style={styles.emptyText}>No hay busquedas activas.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {opportunities.map((opportunity) => {
            const active = opportunity.id === selectedOpportunityId;
            return (
              <Pressable
                key={opportunity.id}
                onPress={() => onOpenOpportunity(opportunity.id)}
                style={({ pressed }) => [
                  styles.opportunityItem,
                  active && styles.opportunityItemActive,
                  pressed && styles.pressed
                ]}
              >
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{opportunity.title}</Text>
                  <Text style={styles.badge}>
                    {formatModality(opportunity.modality)}
                  </Text>
                </View>
                <Text style={styles.itemClub}>{opportunity.club.name}</Text>
                <Text style={styles.itemMeta}>
                  {opportunity.primaryPosition} -{" "}
                  {opportunity.locationLabel ?? "Zona sin definir"}
                </Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemMeta}>
                    {formatAgeRange(opportunity)} -{" "}
                    {formatOpportunityType(opportunity.opportunityType)}
                  </Text>
                  <Text style={styles.linkText}>Ver detalle</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function OpportunityDetailView({
  loading,
  message,
  selectedOpportunity,
  session,
  setMessage,
  onApply,
  onBack,
  onLoginPress
}: {
  loading: boolean;
  message: string;
  selectedOpportunity?: Opportunity;
  session: Session | null;
  setMessage: (value: string) => void;
  onApply: () => void;
  onBack: () => void;
  onLoginPress: () => void;
}) {
  if (!selectedOpportunity) {
    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Detalle</Text>
        <Text style={styles.emptyText}>Selecciona una busqueda.</Text>
        <Pressable onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Volver a busquedas</Text>
      </Pressable>

      <View style={styles.panel}>
        <View style={styles.detail}>
          <View style={styles.itemHeader}>
            <Text style={styles.detailTitle}>{selectedOpportunity.title}</Text>
            <Text style={styles.badge}>
              {formatModality(selectedOpportunity.modality)}
            </Text>
          </View>
          <Text style={styles.detailClub}>{selectedOpportunity.club.name}</Text>
          <Text style={styles.description}>{selectedOpportunity.description}</Text>
          <View style={styles.detailGrid}>
            <Info label="Posicion" value={selectedOpportunity.primaryPosition} />
            <Info
              label="Categoria"
              value={selectedOpportunity.category ?? "Sin categoria"}
            />
            <Info label="Edad" value={formatAgeRange(selectedOpportunity)} />
            <Info
              label="Tipo"
              value={formatOpportunityType(selectedOpportunity.opportunityType)}
            />
            <Info
              label="Zona"
              value={selectedOpportunity.locationLabel ?? "Sin definir"}
            />
          </View>
          <TextInput
            multiline
            onChangeText={setMessage}
            placeholder="Mensaje para el club"
            style={[styles.input, styles.messageInput]}
            value={message}
          />
          {session ? (
            <Pressable
              disabled={loading}
              onPress={onApply}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
                loading && styles.disabled
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Enviando..." : "Postular"}
              </Text>
            </Pressable>
          ) : (
            <Pressable onPress={onLoginPress} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>
                Inicia sesion para postular
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

function ApplicationsView({
  applications,
  loading,
  session,
  onLoginPress,
  onOpenConversation,
  onRefresh,
  onWithdraw
}: {
  applications: PlayerApplication[];
  loading: boolean;
  session: Session | null;
  onLoginPress: () => void;
  onOpenConversation: (applicationId: string) => void;
  onRefresh: () => void;
  onWithdraw: (applicationId: string) => void;
}) {
  if (!session) {
    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Mis postulaciones</Text>
        <Text style={styles.emptyText}>Inicia sesion para ver tus postulaciones.</Text>
        <Pressable onPress={onLoginPress} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Ir a cuenta</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.sectionHeader}>
        <Text style={styles.panelTitle}>Mis postulaciones</Text>
        {loading ? <ActivityIndicator color="#157f58" /> : null}
      </View>
      <Pressable onPress={onRefresh} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Actualizar</Text>
      </Pressable>

      {applications.length === 0 ? (
        <Text style={styles.emptyText}>Todavia no tienes postulaciones.</Text>
      ) : (
        <View style={styles.list}>
          {applications.map((application) => (
            <View key={application.id} style={styles.applicationItem}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{application.opportunity.title}</Text>
                <Text style={styles.statusBadge}>
                  {formatApplicationStatus(application.status)}
                </Text>
              </View>
              <Text style={styles.itemClub}>{application.opportunity.club.name}</Text>
              <Text style={styles.itemMeta}>
                {application.opportunity.primaryPosition} -{" "}
                {application.opportunity.locationLabel ?? "Zona sin definir"}
              </Text>
              {application.message ? (
                <Text style={styles.description}>{application.message}</Text>
              ) : null}
              <View style={styles.actionRow}>
                <Pressable
                  onPress={() => onOpenConversation(application.id)}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Mensajes</Text>
                </Pressable>
                {application.status !== "WITHDRAWN" ? (
                  <Pressable
                    onPress={() => onWithdraw(application.id)}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>Retirar</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function MessagesView({
  conversations,
  loading,
  messageDraft,
  messages,
  selectedConversation,
  selectedConversationId,
  session,
  setMessageDraft,
  onLoginPress,
  onRefresh,
  onRefreshMessages,
  onSelectConversation,
  onSendMessage
}: {
  conversations: Conversation[];
  loading: boolean;
  messageDraft: string;
  messages: ConversationMessage[];
  selectedConversation?: Conversation;
  selectedConversationId: string | null;
  session: Session | null;
  setMessageDraft: (value: string) => void;
  onLoginPress: () => void;
  onRefresh: () => void;
  onRefreshMessages: () => void;
  onSelectConversation: (conversationId: string) => void | Promise<void>;
  onSendMessage: () => void;
}) {
  if (!session) {
    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Mensajes</Text>
        <Text style={styles.emptyText}>Inicia sesion para ver tus conversaciones.</Text>
        <Pressable onPress={onLoginPress} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Ir a cuenta</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.panel}>
        <View style={styles.sectionHeader}>
          <Text style={styles.panelTitle}>Mensajes</Text>
          {loading ? <ActivityIndicator color="#157f58" /> : null}
        </View>
        <Pressable onPress={onRefresh} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Actualizar</Text>
        </Pressable>

        {conversations.length === 0 ? (
          <Text style={styles.emptyText}>Todavia no hay conversaciones.</Text>
        ) : (
          <View style={styles.list}>
            {conversations.map((conversation) => {
              const latestMessage = conversation.messages[0];
              const active = conversation.id === selectedConversationId;

              return (
                <Pressable
                  key={conversation.id}
                  onPress={() => onSelectConversation(conversation.id)}
                  style={({ pressed }) => [
                    styles.opportunityItem,
                    active && styles.opportunityItemActive,
                    pressed && styles.pressed
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>
                      {formatConversationTitle(conversation, session)}
                    </Text>
                    <Text style={styles.statusBadge}>
                      {formatApplicationStatus(conversation.application.status)}
                    </Text>
                  </View>
                  <Text style={styles.itemMeta}>
                    {conversation.application.opportunity.title}
                  </Text>
                  <Text style={styles.description}>
                    {latestMessage
                      ? latestMessage.body
                      : "Conversacion abierta"}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {formatConversationDate(
                      conversation.lastMessageAt ?? conversation.createdAt
                    )}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {selectedConversation ? (
        <View style={styles.panel}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.formTitle}>
                {formatConversationTitle(selectedConversation, session)}
              </Text>
              <Text style={styles.sectionHint}>
                {selectedConversation.application.opportunity.title}
              </Text>
            </View>
            <Pressable onPress={onRefreshMessages} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Actualizar</Text>
            </Pressable>
          </View>

          {messages.length === 0 ? (
            <Text style={styles.emptyText}>No hay mensajes todavia.</Text>
          ) : (
            <View style={styles.messageList}>
              {messages.map((conversationMessage) => {
                const ownMessage =
                  conversationMessage.senderUserId === session.user.id;

                return (
                  <View
                    key={conversationMessage.id}
                    style={[
                      styles.messageBubble,
                      ownMessage && styles.messageBubbleOwn
                    ]}
                  >
                    <Text style={styles.messageAuthor}>
                      {ownMessage
                        ? "Tu"
                        : conversationMessage.senderUser.fullName}
                    </Text>
                    <Text style={styles.messageBody}>
                      {conversationMessage.body}
                    </Text>
                    <Text style={styles.messageDate}>
                      {formatConversationDate(conversationMessage.createdAt)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.form}>
            <TextInput
              multiline
              onChangeText={setMessageDraft}
              placeholder="Escribe un mensaje"
              style={[styles.input, styles.messageInput]}
              value={messageDraft}
            />
            <Pressable
              disabled={loading}
              onPress={onSendMessage}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
                loading && styles.disabled
              ]}
            >
              <Text style={styles.primaryButtonText}>Enviar mensaje</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function ClubView({
  clubApplications,
  clubCatalog,
  clubCatalogFilters,
  clubCatalogLoading,
  clubForm,
  clubLoading,
  clubMemberships,
  clubOpportunities,
  editingOpportunityId,
  manualClubMode,
  opportunityForm,
  selectedCatalogClub,
  selectedClubId,
  selectedClubMembership,
  session,
  setClubCatalogFilters,
  setClubForm,
  setOpportunityForm,
  onApplicationStatus,
  onCancelOpportunityEdit,
  onClearCatalogSelection,
  onCreateClub,
  onEditOpportunity,
  onLoginPress,
  onOpenConversation,
  onOpportunityAction,
  onRefresh,
  onSaveOpportunity,
  onSearchClubCatalog,
  onSelectClub,
  onSelectCatalogClub,
  onUseManualClub
}: {
  clubApplications: ClubApplication[];
  clubCatalog: ClubCatalogItem[];
  clubCatalogFilters: ClubCatalogFilterForm;
  clubCatalogLoading: boolean;
  clubForm: ClubForm;
  clubLoading: boolean;
  clubMemberships: ClubMembership[];
  clubOpportunities: Opportunity[];
  editingOpportunityId: string | null;
  manualClubMode: boolean;
  opportunityForm: OpportunityForm;
  selectedCatalogClub: ClubCatalogItem | null;
  selectedClubId: string | null;
  selectedClubMembership?: ClubMembership;
  session: Session | null;
  setClubCatalogFilters: (
    value:
      | ClubCatalogFilterForm
      | ((current: ClubCatalogFilterForm) => ClubCatalogFilterForm)
  ) => void;
  setClubForm: (value: ClubForm | ((current: ClubForm) => ClubForm)) => void;
  setOpportunityForm: (
    value: OpportunityForm | ((current: OpportunityForm) => OpportunityForm)
  ) => void;
  onApplicationStatus: (applicationId: string, status: string) => void;
  onCancelOpportunityEdit: () => void;
  onClearCatalogSelection: () => void;
  onCreateClub: () => void;
  onEditOpportunity: (opportunity: Opportunity) => void;
  onLoginPress: () => void;
  onOpenConversation: (applicationId: string) => void;
  onOpportunityAction: (
    opportunityId: string,
    action: "publish" | "pause" | "close" | "delete"
  ) => void;
  onRefresh: () => void;
  onSaveOpportunity: () => void;
  onSearchClubCatalog: () => void;
  onSelectClub: (clubId: string) => void;
  onSelectCatalogClub: (club: ClubCatalogItem) => void;
  onUseManualClub: () => void;
}) {
  function updateClubForm(field: keyof ClubForm, value: string) {
    setClubForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  }

  function updateCatalogFilter(field: keyof ClubCatalogFilterForm, value: string) {
    setClubCatalogFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value
    }));
  }

  function updateOpportunityForm(field: keyof OpportunityForm, value: string) {
    setOpportunityForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  }

  if (!session) {
    return (
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Portal club</Text>
        <Text style={styles.emptyText}>
          Inicia sesion para crear un club y gestionar convocatorias.
        </Text>
        <Pressable onPress={onLoginPress} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Ir a cuenta</Text>
        </Pressable>
      </View>
    );
  }

  const verifiedClub = selectedClubMembership
    ? isVerifiedClubMembership(selectedClubMembership)
    : false;
  const catalogClubSelected = Boolean(selectedCatalogClub);
  const showCreateClubForm = manualClubMode || catalogClubSelected;

  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.panelTitle}>Portal club</Text>
          <Text style={styles.sectionHint}>
            Administra convocatorias y revisa candidatos inscritos.
          </Text>
        </View>
        {clubLoading ? <ActivityIndicator color="#157f58" /> : null}
      </View>

      <View style={styles.panel}>
        <View style={styles.sectionHeader}>
          <Text style={styles.formTitle}>Mis clubes</Text>
          <Pressable onPress={onRefresh} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Actualizar</Text>
          </Pressable>
        </View>
        {clubMemberships.length === 0 ? (
          <Text style={styles.emptyText}>Todavia no tienes clubes.</Text>
        ) : (
          <View style={styles.list}>
            {clubMemberships.map((membership) => {
              const active = membership.club.id === selectedClubId;
              return (
                <Pressable
                  key={membership.id}
                  onPress={() => onSelectClub(membership.club.id)}
                  style={({ pressed }) => [
                    styles.opportunityItem,
                    active && styles.opportunityItemActive,
                    pressed && styles.pressed
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{membership.club.name}</Text>
                    <Text style={styles.statusBadge}>
                      {formatVerificationStatus(
                        membership.club.verificationStatus
                      )}
                    </Text>
                  </View>
                  <Text style={styles.itemMeta}>
                    {membership.club.city ?? "Sin ciudad"} -{" "}
                    {membership.role}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {clubMemberships.length === 0 ? (
        <>
          <View style={styles.panel}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.formTitle}>Buscar club</Text>
                <Text style={styles.sectionHint}>
                  Catalogo federativo
                </Text>
              </View>
              {clubCatalogLoading ? <ActivityIndicator color="#157f58" /> : null}
            </View>
            <View style={styles.form}>
              <TextInput
                onChangeText={(value) => updateCatalogFilter("search", value)}
                placeholder="Nombre, codigo o localidad"
                style={styles.input}
                value={clubCatalogFilters.search}
              />
              <View style={styles.inlineFields}>
                <TextInput
                  onChangeText={(value) =>
                    updateCatalogFilter("federation", value)
                  }
                  placeholder="Federacion"
                  style={[styles.input, styles.inlineInput]}
                  value={clubCatalogFilters.federation}
                />
                <TextInput
                  onChangeText={(value) =>
                    updateCatalogFilter("category", value)
                  }
                  placeholder="Categoria"
                  style={[styles.input, styles.inlineInput]}
                  value={clubCatalogFilters.category}
                />
              </View>
              <TextInput
                onChangeText={(value) => updateCatalogFilter("level", value)}
                placeholder="Nivel"
                style={styles.input}
                value={clubCatalogFilters.level}
              />
              <View style={styles.actionRow}>
                <Pressable
                  disabled={clubCatalogLoading}
                  onPress={onSearchClubCatalog}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressed,
                    clubCatalogLoading && styles.disabled
                  ]}
                >
                  <Text style={styles.primaryButtonText}>Buscar</Text>
                </Pressable>
                <Pressable
                  disabled={clubLoading}
                  onPress={onUseManualClub}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.pressed,
                    clubLoading && styles.disabled
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>
                    Crear manualmente
                  </Text>
                </Pressable>
              </View>
            </View>

            {clubCatalog.length > 0 ? (
              <View style={styles.list}>
                {clubCatalog.map((club) => {
                  const active = club.id === selectedCatalogClub?.id;
                  return (
                    <Pressable
                      key={club.id}
                      onPress={() => onSelectCatalogClub(club)}
                      style={({ pressed }) => [
                        styles.opportunityItem,
                        active && styles.opportunityItemActive,
                        pressed && styles.pressed
                      ]}
                    >
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle}>{club.name}</Text>
                        <Text style={styles.badge}>
                          {club.federationSource ?? "Catalogo"}
                        </Text>
                      </View>
                      <Text style={styles.itemMeta}>
                        {club.city ?? "Sin localidad"} -{" "}
                        {club.province ?? "Sin provincia"}
                      </Text>
                      {club.teams.length > 0 ? (
                        <Text style={styles.itemMeta}>
                          {formatCatalogTeams(club)}
                        </Text>
                      ) : null}
                      <Text style={styles.linkText}>
                        {active ? "Seleccionado" : "Usar este club"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          {showCreateClubForm ? (
            <View style={styles.panel}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.formTitle}>
                    {catalogClubSelected ? "Datos del club" : "Crear club"}
                  </Text>
                  {catalogClubSelected ? (
                    <Text style={styles.sectionHint}>
                      Origen: catalogo federativo
                    </Text>
                  ) : null}
                </View>
                {catalogClubSelected ? (
                  <Pressable
                    disabled={clubLoading}
                    onPress={onClearCatalogSelection}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>Elegir otro</Text>
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.form}>
                <TextInput
                  editable={!catalogClubSelected}
                  onChangeText={(value) => updateClubForm("name", value)}
                  placeholder="Nombre del club"
                  style={[
                    styles.input,
                    catalogClubSelected && styles.readOnlyInput
                  ]}
                  value={clubForm.name}
                />
                <View style={styles.inlineFields}>
                  <TextInput
                    editable={!catalogClubSelected}
                    onChangeText={(value) => updateClubForm("city", value)}
                    placeholder="Ciudad"
                    style={[
                      styles.input,
                      styles.inlineInput,
                      catalogClubSelected && styles.readOnlyInput
                    ]}
                    value={clubForm.city}
                  />
                  <TextInput
                    editable={!catalogClubSelected}
                    onChangeText={(value) => updateClubForm("province", value)}
                    placeholder="Provincia"
                    style={[
                      styles.input,
                      styles.inlineInput,
                      catalogClubSelected && styles.readOnlyInput
                    ]}
                    value={clubForm.province}
                  />
                </View>
                <TextInput
                  editable={!catalogClubSelected}
                  onChangeText={(value) =>
                    updateClubForm("federationRegion", value)
                  }
                  placeholder="Federacion territorial"
                  style={[
                    styles.input,
                    catalogClubSelected && styles.readOnlyInput
                  ]}
                  value={clubForm.federationRegion}
                />
                <TextInput
                  autoCapitalize="none"
                  editable={!catalogClubSelected}
                  inputMode="email"
                  onChangeText={(value) => updateClubForm("contactEmail", value)}
                  placeholder="Email de contacto"
                  style={[
                    styles.input,
                    catalogClubSelected && styles.readOnlyInput
                  ]}
                  value={clubForm.contactEmail}
                />
                <TextInput
                  autoCapitalize="none"
                  editable={!catalogClubSelected}
                  onChangeText={(value) => updateClubForm("website", value)}
                  placeholder="Web del club"
                  style={[
                    styles.input,
                    catalogClubSelected && styles.readOnlyInput
                  ]}
                  value={clubForm.website}
                />
                <Pressable
                  disabled={clubLoading}
                  onPress={onCreateClub}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressed,
                    clubLoading && styles.disabled
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {catalogClubSelected
                      ? "Solicitar gestion del club"
                      : "Crear club"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </>
      ) : null}

      {selectedClubMembership ? (
        <>
          <View style={styles.panel}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.formTitle}>
                  {selectedClubMembership.club.name}
                </Text>
                <Text style={styles.sessionText}>
                  {formatVerificationStatus(
                    selectedClubMembership.club.verificationStatus
                  )}
                </Text>
              </View>
              <Text style={styles.statusBadge}>
                {selectedClubMembership.role}
              </Text>
            </View>
            {!verifiedClub ? (
              <Text style={styles.emptyText}>
                Puedes crear borradores. Para publicar y gestionar candidatos,
                el admin debe aprobar el club.
              </Text>
            ) : null}
          </View>

          <View style={styles.panel}>
            <Text style={styles.formTitle}>
              {editingOpportunityId
                ? "Editar convocatoria"
                : "Nueva convocatoria"}
            </Text>
            <View style={styles.form}>
              <TextInput
                onChangeText={(value) => updateOpportunityForm("title", value)}
                placeholder="Titulo"
                style={styles.input}
                value={opportunityForm.title}
              />
              <TextInput
                multiline
                onChangeText={(value) =>
                  updateOpportunityForm("description", value)
                }
                placeholder="Descripcion"
                style={[styles.input, styles.messageInput]}
                value={opportunityForm.description}
              />
              <View style={styles.inlineFields}>
                <TextInput
                  onChangeText={(value) =>
                    updateOpportunityForm("primaryPosition", value)
                  }
                  placeholder="Posicion"
                  style={[styles.input, styles.inlineInput]}
                  value={opportunityForm.primaryPosition}
                />
                <TextInput
                  onChangeText={(value) =>
                    updateOpportunityForm("category", value)
                  }
                  placeholder="Categoria"
                  style={[styles.input, styles.inlineInput]}
                  value={opportunityForm.category}
                />
              </View>
              <Text style={styles.fieldLabel}>Modalidad</Text>
              <View style={styles.segmentedCompact}>
                <SegmentButton
                  active={opportunityForm.modality === "FOOTBALL_11"}
                  label="F11"
                  onPress={() =>
                    updateOpportunityForm("modality", "FOOTBALL_11")
                  }
                />
                <SegmentButton
                  active={opportunityForm.modality === "FOOTBALL_7"}
                  label="F7"
                  onPress={() =>
                    updateOpportunityForm("modality", "FOOTBALL_7")
                  }
                />
                <SegmentButton
                  active={opportunityForm.modality === "FUTSAL"}
                  label="Futsal"
                  onPress={() => updateOpportunityForm("modality", "FUTSAL")}
                />
              </View>
              <View style={styles.inlineFields}>
                <TextInput
                  inputMode="numeric"
                  onChangeText={(value) => updateOpportunityForm("ageMin", value)}
                  placeholder="Edad min."
                  style={[styles.input, styles.inlineInput]}
                  value={opportunityForm.ageMin}
                />
                <TextInput
                  inputMode="numeric"
                  onChangeText={(value) => updateOpportunityForm("ageMax", value)}
                  placeholder="Edad max."
                  style={[styles.input, styles.inlineInput]}
                  value={opportunityForm.ageMax}
                />
              </View>
              <TextInput
                onChangeText={(value) =>
                  updateOpportunityForm("locationLabel", value)
                }
                placeholder="Ubicacion"
                style={styles.input}
                value={opportunityForm.locationLabel}
              />
              <View style={styles.inlineFields}>
                <TextInput
                  onChangeText={(value) => updateOpportunityForm("level", value)}
                  placeholder="Nivel"
                  style={[styles.input, styles.inlineInput]}
                  value={opportunityForm.level}
                />
                <TextInput
                  onChangeText={(value) =>
                    updateOpportunityForm("requirements", value)
                  }
                  placeholder="Requisitos"
                  style={[styles.input, styles.inlineInput]}
                  value={opportunityForm.requirements}
                />
              </View>
              <Pressable
                disabled={clubLoading}
                onPress={onSaveOpportunity}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  clubLoading && styles.disabled
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {editingOpportunityId ? "Guardar cambios" : "Crear borrador"}
                </Text>
              </Pressable>
              {editingOpportunityId ? (
                <Pressable
                  disabled={clubLoading}
                  onPress={onCancelOpportunityEdit}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.pressed,
                    clubLoading && styles.disabled
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>Cancelar edicion</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.formTitle}>Convocatorias</Text>
            {clubOpportunities.length === 0 ? (
              <Text style={styles.emptyText}>No hay convocatorias creadas.</Text>
            ) : (
              <View style={styles.list}>
                {clubOpportunities.map((opportunity) => (
                  <View key={opportunity.id} style={styles.applicationItem}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{opportunity.title}</Text>
                      <Text style={styles.statusBadge}>
                        {formatOpportunityStatus(opportunity.status)}
                      </Text>
                    </View>
                    <Text style={styles.itemMeta}>
                      {opportunity.primaryPosition} -{" "}
                      {opportunity.locationLabel ?? "Zona sin definir"}
                    </Text>
                    <Text style={styles.itemMeta}>
                      Edad: {formatAgeRange(opportunity)}
                      {opportunity.requirements
                        ? ` - Requisitos: ${opportunity.requirements}`
                        : ""}
                    </Text>
                    <View style={styles.actionRow}>
                      {opportunity.status !== "CLOSED" ? (
                        <Pressable
                          onPress={() => onEditOpportunity(opportunity)}
                          style={styles.secondaryButton}
                        >
                          <Text style={styles.secondaryButtonText}>Editar</Text>
                        </Pressable>
                      ) : null}
                      {opportunity.status !== "ACTIVE" ? (
                        <Pressable
                          disabled={!verifiedClub}
                          onPress={() =>
                            onOpportunityAction(opportunity.id, "publish")
                          }
                          style={[
                            styles.secondaryButton,
                            !verifiedClub && styles.disabled
                          ]}
                        >
                          <Text style={styles.secondaryButtonText}>Publicar</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() =>
                            onOpportunityAction(opportunity.id, "pause")
                          }
                          style={styles.secondaryButton}
                        >
                          <Text style={styles.secondaryButtonText}>Pausar</Text>
                        </Pressable>
                      )}
                      {opportunity.status !== "CLOSED" ? (
                        <Pressable
                          onPress={() =>
                            onOpportunityAction(opportunity.id, "close")
                          }
                          style={styles.secondaryButton}
                        >
                          <Text style={styles.secondaryButtonText}>Cerrar</Text>
                        </Pressable>
                      ) : null}
                      {opportunity.status !== "CLOSED" ? (
                        <Pressable
                          onPress={() =>
                            onOpportunityAction(opportunity.id, "delete")
                          }
                          style={[styles.secondaryButton, styles.dangerButton]}
                        >
                          <Text
                            style={[
                              styles.secondaryButtonText,
                              styles.dangerButtonText
                            ]}
                          >
                            {opportunity.status === "DRAFT"
                              ? "Eliminar"
                              : "Inactivar"}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.panel}>
            <Text style={styles.formTitle}>Postulaciones recibidas</Text>
            {!verifiedClub ? (
              <Text style={styles.emptyText}>
                Disponible cuando el club este verificado.
              </Text>
            ) : clubApplications.length === 0 ? (
              <Text style={styles.emptyText}>No hay postulaciones recibidas.</Text>
            ) : (
              <View style={styles.list}>
                {clubApplications.map((application) => (
                  <View key={application.id} style={styles.applicationItem}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>
                        {application.playerProfile.displayName ??
                          application.playerProfile.user.fullName}
                      </Text>
                      <Text style={styles.statusBadge}>
                        {formatApplicationStatus(application.status)}
                      </Text>
                    </View>
                    <Text style={styles.itemClub}>
                      {application.opportunity.title}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {application.playerProfile.primaryPosition ??
                        "Posicion sin definir"}{" "}
                      - {application.playerProfile.locationLabel ?? "Sin zona"}
                    </Text>
                    {application.message ? (
                      <Text style={styles.description}>
                        {application.message}
                      </Text>
                    ) : null}
                    <View style={styles.actionRow}>
                      <Pressable
                        onPress={() => onOpenConversation(application.id)}
                        style={styles.secondaryButton}
                      >
                        <Text style={styles.secondaryButtonText}>Mensajes</Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          onApplicationStatus(application.id, "VIEWED")
                        }
                        style={styles.secondaryButton}
                      >
                        <Text style={styles.secondaryButtonText}>Vista</Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          onApplicationStatus(application.id, "SHORTLISTED")
                        }
                        style={styles.secondaryButton}
                      >
                        <Text style={styles.secondaryButtonText}>Preselecc.</Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          onApplicationStatus(application.id, "CONTACTED")
                        }
                        style={styles.secondaryButton}
                      >
                        <Text style={styles.secondaryButtonText}>Contactado</Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          onApplicationStatus(application.id, "REJECTED")
                        }
                        style={styles.secondaryButton}
                      >
                        <Text style={styles.secondaryButtonText}>Descartar</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </>
      ) : null}
    </View>
  );
}

function AccountView({
  authMode,
  dateOfBirth,
  email,
  fullName,
  loading,
  password,
  profileForm,
  profileSaving,
  registrationRole,
  session,
  setAuthMode,
  setDateOfBirth,
  setEmail,
  setFullName,
  setPassword,
  setRegistrationRole,
  updateProfileField,
  onLogin,
  onLogout,
  onRegister,
  onSaveProfile
}: {
  authMode: AuthMode;
  dateOfBirth: string;
  email: string;
  fullName: string;
  loading: boolean;
  password: string;
  profileForm: ProfileForm;
  profileSaving: boolean;
  registrationRole: RegistrationRole;
  session: Session | null;
  setAuthMode: (value: AuthMode) => void;
  setDateOfBirth: (value: string) => void;
  setEmail: (value: string) => void;
  setFullName: (value: string) => void;
  setPassword: (value: string) => void;
  setRegistrationRole: (value: RegistrationRole) => void;
  updateProfileField: (field: keyof ProfileForm, value: string) => void;
  onLogin: () => void;
  onLogout: () => void | Promise<void>;
  onRegister: () => void;
  onSaveProfile: () => void;
}) {
  if (session) {
    if (session.user.primaryRole !== "PLAYER") {
      return (
        <View style={styles.panel}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.panelTitle}>Cuenta club</Text>
              <Text style={styles.sessionText}>{session.user.email}</Text>
            </View>
            <Pressable
              onPress={() => void onLogout()}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Cerrar sesion</Text>
            </Pressable>
          </View>

          <View style={styles.profileSummary}>
            <Info label="Responsable" value={session.user.fullName} />
            <Info label="Tipo de cuenta" value="Club" />
          </View>

          <Text style={styles.emptyText}>
            Gestiona tus clubes, convocatorias y candidatos desde la seccion
            Club.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.panel}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.panelTitle}>Cuenta jugador</Text>
            <Text style={styles.sessionText}>{session.user.email}</Text>
          </View>
          <Pressable onPress={() => void onLogout()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Cerrar sesion</Text>
          </Pressable>
        </View>

        <View style={styles.profileSummary}>
          <Info label="Nombre legal" value={session.user.fullName} />
          <Info label="Rol" value={session.user.primaryRole} />
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Perfil deportivo</Text>
          <TextInput
            onChangeText={(value) => updateProfileField("displayName", value)}
            placeholder="Nombre visible"
            style={styles.input}
            value={profileForm.displayName}
          />
          <TextInput
            onChangeText={(value) =>
              updateProfileField("primaryPosition", value)
            }
            placeholder="Posicion principal"
            style={styles.input}
            value={profileForm.primaryPosition}
          />
          <Text style={styles.fieldLabel}>Modalidad</Text>
          <View style={styles.segmentedCompact}>
            <SegmentButton
              active={profileForm.modality === "FOOTBALL_11"}
              label="F11"
              onPress={() => updateProfileField("modality", "FOOTBALL_11")}
            />
            <SegmentButton
              active={profileForm.modality === "FOOTBALL_7"}
              label="F7"
              onPress={() => updateProfileField("modality", "FOOTBALL_7")}
            />
            <SegmentButton
              active={profileForm.modality === "FUTSAL"}
              label="Futsal"
              onPress={() => updateProfileField("modality", "FUTSAL")}
            />
          </View>
          <TextInput
            onChangeText={(value) =>
              updateProfileField("availabilityStatus", value)
            }
            placeholder="Disponibilidad"
            style={styles.input}
            value={profileForm.availabilityStatus}
          />
          <TextInput
            onChangeText={(value) => updateProfileField("locationLabel", value)}
            placeholder="Ubicacion"
            style={styles.input}
            value={profileForm.locationLabel}
          />
          <View style={styles.inlineFields}>
            <TextInput
              inputMode="numeric"
              onChangeText={(value) =>
                updateProfileField("searchRadiusKm", value)
              }
              placeholder="Radio km"
              style={[styles.input, styles.inlineInput]}
              value={profileForm.searchRadiusKm}
            />
            <TextInput
              onChangeText={(value) => updateProfileField("category", value)}
              placeholder="Categoria"
              style={[styles.input, styles.inlineInput]}
              value={profileForm.category}
            />
          </View>
          <TextInput
            onChangeText={(value) => updateProfileField("dominantFoot", value)}
            placeholder="Pierna dominante"
            style={styles.input}
            value={profileForm.dominantFoot}
          />
          <TextInput
            multiline
            onChangeText={(value) => updateProfileField("bio", value)}
            placeholder="Bio deportiva"
            style={[styles.input, styles.bioInput]}
            value={profileForm.bio}
          />
          <Pressable
            disabled={profileSaving}
            onPress={onSaveProfile}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              profileSaving && styles.disabled
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {profileSaving ? "Guardando..." : "Guardar perfil"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.sectionHeader}>
        <Text style={styles.panelTitle}>
          {authMode === "login"
            ? "Acceso"
            : registrationRole === "PLAYER"
              ? "Registro jugador"
              : "Registro club"}
        </Text>
      </View>
      <View style={styles.segmentedCompact}>
        <SegmentButton
          active={authMode === "login"}
          label="Entrar"
          onPress={() => setAuthMode("login")}
        />
        <SegmentButton
          active={authMode === "register"}
          label="Registro"
          onPress={() => setAuthMode("register")}
        />
      </View>
      <View style={styles.form}>
        {authMode === "register" ? (
          <>
            <Text style={styles.fieldLabel}>Tipo de cuenta</Text>
            <View style={styles.segmentedCompact}>
              <SegmentButton
                active={registrationRole === "PLAYER"}
                label="Jugador"
                onPress={() => {
                  setRegistrationRole("PLAYER");
                  if (fullName === "Responsable Club") {
                    setFullName("Jugador Candidato");
                  }
                }}
              />
              <SegmentButton
                active={registrationRole === "CLUB_MEMBER"}
                label="Club"
                onPress={() => {
                  setRegistrationRole("CLUB_MEMBER");
                  if (fullName === "Jugador Candidato") {
                    setFullName("Responsable Club");
                  }
                }}
              />
            </View>
            <TextInput
              onChangeText={setFullName}
              placeholder={
                registrationRole === "PLAYER"
                  ? "Nombre completo"
                  : "Nombre del responsable"
              }
              style={styles.input}
              value={fullName}
            />
            <TextInput
              onChangeText={setDateOfBirth}
              placeholder="Fecha nacimiento YYYY-MM-DD"
              style={styles.input}
              value={dateOfBirth}
            />
          </>
        ) : null}
        <TextInput
          autoCapitalize="none"
          inputMode="email"
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="Contrasena"
          secureTextEntry
          style={styles.input}
          value={password}
        />
        <Pressable
          disabled={loading}
          onPress={authMode === "login" ? onLogin : onRegister}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
            loading && styles.disabled
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {loading
              ? "Procesando..."
              : authMode === "login"
                ? "Entrar"
                : "Crear cuenta"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function BottomNavigation({
  applicationsCount,
  clubCount,
  messagesCount,
  sessionActive,
  sessionRole,
  viewMode,
  onSelect
}: {
  applicationsCount: number;
  clubCount: number;
  messagesCount: number;
  sessionActive: boolean;
  sessionRole?: string;
  viewMode: ViewMode;
  onSelect: (
    nextViewMode: "search" | "applications" | "messages" | "club" | "account"
  ) => void;
}) {
  const showPlayerNavigation = !sessionRole || sessionRole === "PLAYER";
  const showClubNavigation = sessionRole === "CLUB_MEMBER";

  return (
    <View style={styles.bottomNavigation}>
      {showPlayerNavigation ? (
        <>
          <BottomNavigationButton
            active={viewMode === "search" || viewMode === "opportunityDetail"}
            label="Buscar"
            meta="Clubes"
            onPress={() => onSelect("search")}
          />
          {sessionRole === "PLAYER" ? (
            <BottomNavigationButton
              active={viewMode === "applications"}
              label="Postul."
              meta={String(applicationsCount)}
              onPress={() => onSelect("applications")}
            />
          ) : null}
        </>
      ) : null}
      {showClubNavigation ? (
        <BottomNavigationButton
          active={viewMode === "club"}
          label="Club"
          meta={String(clubCount)}
          onPress={() => onSelect("club")}
        />
      ) : null}
      {sessionRole ? (
        <BottomNavigationButton
          active={viewMode === "messages"}
          label="Mensajes"
          meta={String(messagesCount)}
          onPress={() => onSelect("messages")}
        />
      ) : null}
      <BottomNavigationButton
        active={viewMode === "account"}
        label="Cuenta"
        meta={sessionActive ? "Activa" : "Entrar"}
        onPress={() => onSelect("account")}
      />
    </View>
  );
}

function BottomNavigationButton({
  active,
  label,
  meta,
  onPress
}: {
  active: boolean;
  label: string;
  meta: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.bottomNavigationButton,
        active && styles.bottomNavigationButtonActive,
        pressed && styles.pressed
      ]}
    >
      <Text
        style={[
          styles.bottomNavigationLabel,
          active && styles.bottomNavigationLabelActive
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.bottomNavigationMeta,
          active && styles.bottomNavigationMetaActive
        ]}
      >
        {meta}
      </Text>
    </Pressable>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function SegmentButton({
  active,
  label,
  onPress
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.segmentButton,
        active && styles.segmentButtonActive,
        pressed && styles.pressed
      ]}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function catalogClubToForm(club: ClubCatalogItem): ClubForm {
  return {
    name: club.name,
    city: club.city ?? "",
    province: club.province ?? "",
    federationRegion: club.federationRegion ?? club.federationSource ?? "",
    contactEmail: club.contactEmail ?? club.correspondenceEmail ?? "",
    website: club.website ?? ""
  };
}

function buildCreateClubPayload(clubForm: ClubForm): CreateClubPayload {
  return {
    name: clubForm.name.trim(),
    city: cleanString(clubForm.city),
    province: cleanString(clubForm.province),
    federationRegion: cleanString(clubForm.federationRegion),
    contactEmail: cleanString(clubForm.contactEmail),
    website: cleanString(clubForm.website)
  };
}

function formatCatalogTeams(club: ClubCatalogItem) {
  const teams = club.teams
    .map((team) => team.category ?? team.name)
    .filter((value, index, values) => values.indexOf(value) === index)
    .slice(0, 3);

  if (teams.length === 0) {
    return "Sin equipos asociados";
  }

  return `Equipos: ${teams.join(", ")}`;
}

function buildCreateOpportunityPayload(
  opportunityForm: OpportunityForm,
  clubId: string
): CreateOpportunityPayload {
  return {
    clubId,
    title: opportunityForm.title.trim(),
    description: opportunityForm.description.trim(),
    category: cleanString(opportunityForm.category),
    gender: cleanString(opportunityForm.gender),
    modality: opportunityForm.modality,
    primaryPosition: opportunityForm.primaryPosition.trim(),
    ageMin: parseOpportunityAge(opportunityForm.ageMin),
    ageMax: parseOpportunityAge(opportunityForm.ageMax),
    locationLabel: cleanString(opportunityForm.locationLabel),
    level: cleanString(opportunityForm.level),
    opportunityType: opportunityForm.opportunityType,
    requirements: cleanString(opportunityForm.requirements)
  };
}

function buildUpdateOpportunityPayload(
  opportunityForm: OpportunityForm
): UpdateOpportunityPayload {
  return {
    title: opportunityForm.title.trim(),
    description: opportunityForm.description.trim(),
    category: cleanString(opportunityForm.category),
    gender: cleanString(opportunityForm.gender),
    modality: opportunityForm.modality,
    primaryPosition: opportunityForm.primaryPosition.trim(),
    ageMin: parseOpportunityAge(opportunityForm.ageMin, true),
    ageMax: parseOpportunityAge(opportunityForm.ageMax, true),
    locationLabel: cleanString(opportunityForm.locationLabel),
    level: cleanString(opportunityForm.level),
    opportunityType: opportunityForm.opportunityType,
    requirements: cleanString(opportunityForm.requirements)
  };
}

function opportunityToForm(opportunity: Opportunity): OpportunityForm {
  return {
    title: opportunity.title,
    description: opportunity.description,
    category: opportunity.category ?? "",
    gender: opportunity.gender ?? defaultOpportunityForm.gender,
    modality: opportunity.modality,
    primaryPosition: opportunity.primaryPosition,
    ageMin: opportunity.ageMin ? String(opportunity.ageMin) : "",
    ageMax: opportunity.ageMax ? String(opportunity.ageMax) : "",
    locationLabel: opportunity.locationLabel ?? "",
    level: opportunity.level ?? "",
    opportunityType: opportunity.opportunityType,
    requirements: opportunity.requirements ?? ""
  };
}

function parseOpportunityAge(value: string): number | undefined;
function parseOpportunityAge(value: string, emptyAsNull: true): number | null;
function parseOpportunityAge(value: string, emptyAsNull = false) {
  const age = Number.parseInt(value, 10);
  if (Number.isFinite(age)) {
    return age;
  }

  return emptyAsNull ? null : undefined;
}

function upsertConversation(
  conversations: Conversation[],
  conversation: Conversation
) {
  const exists = conversations.some(
    (currentConversation) => currentConversation.id === conversation.id
  );

  if (exists) {
    return conversations.map((currentConversation) =>
      currentConversation.id === conversation.id
        ? conversation
        : currentConversation
    );
  }

  return [conversation, ...conversations];
}

function formatConversationTitle(
  conversation: Conversation,
  session: Session
) {
  if (session.user.primaryRole === "PLAYER") {
    return conversation.club.name;
  }

  return (
    conversation.playerProfile.displayName ??
    conversation.playerProfile.user.fullName
  );
}

function formatConversationDate(value: string) {
  return new Date(value).toLocaleString("es-ES", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit"
  });
}

function buildProfilePayload(
  profileForm: ProfileForm,
  fallbackDisplayName: string
): PlayerProfilePayload {
  const radiusKm = Number.parseInt(profileForm.searchRadiusKm, 10);
  const safeRadiusKm = Number.isFinite(radiusKm)
    ? Math.min(Math.max(radiusKm, 1), 200)
    : Number(defaultProfileForm.searchRadiusKm);

  return {
    displayName:
      cleanString(profileForm.displayName) ||
      fallbackDisplayName ||
      defaultProfileForm.displayName,
    primaryPosition:
      cleanString(profileForm.primaryPosition) ??
      defaultProfileForm.primaryPosition,
    modality: profileForm.modality || defaultProfileForm.modality,
    availabilityStatus:
      cleanString(profileForm.availabilityStatus) ??
      defaultProfileForm.availabilityStatus,
    locationLabel:
      cleanString(profileForm.locationLabel) ?? defaultProfileForm.locationLabel,
    searchRadiusKm: safeRadiusKm,
    category: cleanString(profileForm.category),
    dominantFoot: cleanString(profileForm.dominantFoot),
    bio: cleanString(profileForm.bio),
    visibilityLevel: "VERIFIED_CLUBS_ONLY"
  };
}

function cleanString(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function getScreenTitle(viewMode: ViewMode) {
  const titles: Record<ViewMode, string> = {
    account: "Cuenta",
    applications: "Postulaciones",
    club: "Club",
    messages: "Mensajes",
    opportunityDetail: "Detalle",
    search: "Buscador Futbol"
  };

  return titles[viewMode];
}

function isVerifiedClubMembership(membership: ClubMembership) {
  return (
    membership.club.verificationStatus === "VERIFIED" &&
    membership.verificationStatus === "VERIFIED"
  );
}

function formatVerificationStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    REJECTED: "Rechazado",
    REVOKED: "Revocado",
    UNVERIFIED: "Sin verificar",
    VERIFIED: "Verificado"
  };

  return labels[status] ?? formatFromCode(status);
}

function formatOpportunityStatus(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Activa",
    CLOSED: "Cerrada",
    DRAFT: "Borrador",
    PAUSED: "Pausada",
    PENDING_REVIEW: "En revision",
    REJECTED: "Rechazada"
  };

  return labels[status] ?? formatFromCode(status);
}

function formatModality(modality: string) {
  return modality.replace("FOOTBALL_", "F").replace("_", " ");
}

function formatOpportunityType(type: string) {
  return formatFromCode(type);
}

function formatFromCode(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function formatApplicationStatus(status: string) {
  const labels: Record<string, string> = {
    ACCEPTED: "Aceptada",
    CONTACTED: "Contactado",
    REJECTED: "Descartada",
    SHORTLISTED: "Preseleccionada",
    SUBMITTED: "Enviada",
    TRIAL_SCHEDULED: "Prueba agendada",
    VIEWED: "Vista",
    WITHDRAWN: "Retirada"
  };

  if (labels[status]) {
    return labels[status];
  }

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function formatAgeRange(opportunity: Opportunity) {
  if (opportunity.ageMin && opportunity.ageMax) {
    return `${opportunity.ageMin}-${opportunity.ageMax}`;
  }

  if (opportunity.ageMin) {
    return `Desde ${opportunity.ageMin}`;
  }

  if (opportunity.ageMax) {
    return `Hasta ${opportunity.ageMax}`;
  }

  return "Sin rango";
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#f4f7f6",
    flex: 1
  },
  scrollArea: {
    flex: 1
  },
  shell: {
    gap: 14,
    marginHorizontal: "auto",
    maxWidth: 1040,
    padding: 18,
    paddingBottom: 28,
    width: "100%"
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  eyebrow: {
    color: "#0f5e42",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
    color: "#16201d",
    fontSize: 30,
    fontWeight: "900"
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d8e0dd",
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  iconText: {
    color: "#16201d",
    fontSize: 16,
    fontWeight: "800"
  },
  statusRow: {
    flexDirection: "row",
    gap: 10
  },
  metric: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e0dd",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 14
  },
  metricLabel: {
    color: "#64726e",
    fontSize: 12,
    fontWeight: "700"
  },
  metricValue: {
    color: "#16201d",
    fontSize: 22,
    fontWeight: "900"
  },
  segmented: {
    backgroundColor: "#e7efec",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    padding: 5
  },
  segmentedCompact: {
    backgroundColor: "#eef4f2",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    padding: 5
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 7,
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  segmentButtonActive: {
    backgroundColor: "#ffffff"
  },
  segmentText: {
    color: "#64726e",
    fontSize: 13,
    fontWeight: "800"
  },
  segmentTextActive: {
    color: "#16201d"
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e0dd",
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16
  },
  panelTitle: {
    color: "#16201d",
    fontSize: 18,
    fontWeight: "900"
  },
  profileSummary: {
    gap: 8
  },
  form: {
    gap: 10
  },
  formTitle: {
    color: "#16201d",
    fontSize: 15,
    fontWeight: "900"
  },
  fieldLabel: {
    color: "#64726e",
    fontSize: 12,
    fontWeight: "800"
  },
  inlineFields: {
    alignItems: "stretch",
    flexDirection: "row",
    gap: 10
  },
  inlineInput: {
    flex: 1
  },
  input: {
    backgroundColor: "#fbfdfc",
    borderColor: "#d8e0dd",
    borderRadius: 8,
    borderWidth: 1,
    color: "#16201d",
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  readOnlyInput: {
    backgroundColor: "#eef4f2",
    color: "#46534f"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#157f58",
    borderRadius: 8,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "900"
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#eef4f2",
    borderRadius: 8,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  secondaryButtonText: {
    color: "#16201d",
    fontWeight: "800"
  },
  dangerButton: {
    backgroundColor: "#fff0f0"
  },
  dangerButtonText: {
    color: "#a23a34"
  },
  sessionText: {
    color: "#64726e"
  },
  notice: {
    backgroundColor: "#eef4f2",
    borderColor: "#d8e0dd",
    borderRadius: 8,
    borderWidth: 1,
    color: "#16201d",
    padding: 12
  },
  screen: {
    gap: 12
  },
  contentGrid: {
    gap: 14
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  sectionHint: {
    color: "#64726e",
    fontSize: 13,
    marginTop: 3
  },
  list: {
    gap: 10
  },
  opportunityItem: {
    backgroundColor: "#fbfdfc",
    borderColor: "#d8e0dd",
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12
  },
  opportunityItemActive: {
    borderColor: "#157f58"
  },
  applicationItem: {
    backgroundColor: "#fbfdfc",
    borderColor: "#d8e0dd",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12
  },
  itemHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between"
  },
  itemTitle: {
    color: "#16201d",
    flex: 1,
    fontSize: 15,
    fontWeight: "900"
  },
  itemClub: {
    color: "#0f5e42",
    fontWeight: "800"
  },
  itemMeta: {
    color: "#64726e",
    fontSize: 13
  },
  itemFooter: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginTop: 2
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  messageList: {
    gap: 10
  },
  messageBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f4",
    borderRadius: 8,
    gap: 4,
    maxWidth: "88%",
    padding: 10
  },
  messageBubbleOwn: {
    alignSelf: "flex-end",
    backgroundColor: "#def0e9"
  },
  messageAuthor: {
    color: "#0f5e42",
    fontSize: 12,
    fontWeight: "900"
  },
  messageBody: {
    color: "#16201d",
    lineHeight: 20
  },
  messageDate: {
    color: "#64726e",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right"
  },
  linkText: {
    color: "#157f58",
    fontSize: 13,
    fontWeight: "900"
  },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#d8e0dd",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  backButtonText: {
    color: "#16201d",
    fontWeight: "800"
  },
  badge: {
    backgroundColor: "#eaf4ff",
    borderRadius: 999,
    color: "#2357a4",
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  statusBadge: {
    backgroundColor: "#fff8e6",
    borderRadius: 999,
    color: "#9a6700",
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  detail: {
    gap: 12
  },
  detailTitle: {
    color: "#16201d",
    fontSize: 20,
    fontWeight: "900"
  },
  detailClub: {
    color: "#0f5e42",
    fontWeight: "800"
  },
  description: {
    color: "#46534f",
    lineHeight: 20
  },
  detailGrid: {
    gap: 8
  },
  infoBox: {
    backgroundColor: "#f8fbfa",
    borderColor: "#d8e0dd",
    borderRadius: 8,
    borderWidth: 1,
    padding: 10
  },
  infoLabel: {
    color: "#64726e",
    fontSize: 12,
    fontWeight: "800"
  },
  infoValue: {
    color: "#16201d",
    fontWeight: "900",
    marginTop: 4
  },
  messageInput: {
    minHeight: 88,
    textAlignVertical: "top"
  },
  bioInput: {
    minHeight: 96,
    textAlignVertical: "top"
  },
  emptyText: {
    color: "#64726e",
    paddingVertical: 10
  },
  footer: {
    color: "#64726e",
    fontSize: 12,
    textAlign: "center"
  },
  bottomNavigation: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e0dd",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  bottomNavigationButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    gap: 2,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  bottomNavigationButtonActive: {
    backgroundColor: "#e7efec"
  },
  bottomNavigationLabel: {
    color: "#64726e",
    fontSize: 12,
    fontWeight: "900"
  },
  bottomNavigationLabelActive: {
    color: "#16201d"
  },
  bottomNavigationMeta: {
    color: "#64726e",
    fontSize: 11,
    fontWeight: "700"
  },
  bottomNavigationMetaActive: {
    color: "#0f5e42"
  },
  pressed: {
    opacity: 0.75
  },
  disabled: {
    opacity: 0.55
  }
});
