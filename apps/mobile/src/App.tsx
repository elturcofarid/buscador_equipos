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
  ClubMembership,
  CreateClubPayload,
  CreateOpportunityPayload,
  Opportunity,
  PlayerApplication,
  PlayerProfile,
  PlayerProfilePayload,
  Session,
  applyToOpportunity,
  closeOpportunity,
  createClub,
  createOpportunity,
  getCurrentSession,
  getPlayerProfile,
  listClubApplications,
  listClubOpportunities,
  listMyClubMemberships,
  listMyApplications,
  listOpportunities,
  login,
  pauseOpportunity,
  publishOpportunity,
  registerPlayer,
  savePlayerProfile,
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
  | "club"
  | "account";
type AuthMode = "login" | "register";
type ClubForm = {
  name: string;
  city: string;
  province: string;
  federationRegion: string;
  contactEmail: string;
  website: string;
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
  const [fullName, setFullName] = useState("Jugador Candidato");
  const [dateOfBirth, setDateOfBirth] = useState("1999-01-01");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [profileForm, setProfileForm] =
    useState<ProfileForm>(defaultProfileForm);
  const [clubForm, setClubForm] = useState<ClubForm>(defaultClubForm);
  const [opportunityForm, setOpportunityForm] =
    useState<OpportunityForm>(defaultOpportunityForm);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<PlayerApplication[]>([]);
  const [clubMemberships, setClubMemberships] = useState<ClubMembership[]>([]);
  const [clubOpportunities, setClubOpportunities] = useState<Opportunity[]>([]);
  const [clubApplications, setClubApplications] = useState<ClubApplication[]>(
    []
  );
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<
    string | null
  >(null);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [message, setMessage] = useState(
    "Estoy disponible para una prueba esta semana."
  );
  const [loading, setLoading] = useState(false);
  const [clubLoading, setClubLoading] = useState(false);
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

  async function refreshApplications(authToken = session?.accessToken) {
    if (!authToken) {
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

  async function refreshClubMemberships(authToken = session?.accessToken) {
    if (!authToken) {
      setClubMemberships([]);
      setClubOpportunities([]);
      setClubApplications([]);
      setSelectedClubId(null);
      return;
    }

    if (!clubForm.name.trim()) {
      setNotice("Indica el nombre del club");
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

  async function refreshClubWorkspace(
    authToken = session?.accessToken,
    membership = selectedClubMembership
  ) {
    if (!authToken || !membership) {
      setClubOpportunities([]);
      setClubApplications([]);
      return;
    }

    if (!opportunityForm.title.trim() || !opportunityForm.primaryPosition.trim()) {
      setNotice("Completa titulo y posicion de la convocatoria");
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
    await ensurePlayerProfile(nextSession);
    await refreshApplications(nextSession.accessToken);
    await refreshClubMemberships(nextSession.accessToken);
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

  async function handleLogin() {
    setLoading(true);
    setNotice("");

    try {
      const nextSession = await login(email.trim(), password);
      await activateSession(nextSession, "Sesion iniciada");
      setViewMode("search");
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
        password
      });
      await activateSession(nextSession, "Cuenta creada y sesion guardada");
      setViewMode("search");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
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
    if (!session) {
      return;
    }

    setLoading(true);
    setNotice("");

    try {
      await withdrawApplication(session.accessToken, applicationId);
      await refreshApplications(session.accessToken);
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
    if (!session) {
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

    setClubLoading(true);
    setNotice("");

    try {
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

  async function handleCreateClubOpportunity() {
    if (!session || !selectedClubMembership) {
      return;
    }

    setClubLoading(true);
    setNotice("");

    try {
      await createOpportunity(
        session.accessToken,
        buildCreateOpportunityPayload(
          opportunityForm,
          selectedClubMembership.club.id
        )
      );
      setOpportunityForm(defaultOpportunityForm);
      await refreshClubWorkspace(session.accessToken, selectedClubMembership);
      setNotice("Convocatoria creada como borrador");
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

  async function handleOpportunityStatusAction(
    opportunityId: string,
    action: "publish" | "pause" | "close"
  ) {
    if (!session || !selectedClubMembership) {
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
      } else {
        await closeOpportunity(session.accessToken, opportunityId);
        setNotice("Convocatoria cerrada");
      }
      await refreshClubWorkspace(session.accessToken, selectedClubMembership);
      await refreshOpportunities();
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
    if (!session || !selectedClubMembership) {
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

  async function logout() {
    await clearStoredSession();
    setSession(null);
    setApplications([]);
    setClubMemberships([]);
    setClubOpportunities([]);
    setClubApplications([]);
    setSelectedClubId(null);
    setPassword("");
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
            }}
          >
            <Text style={styles.iconText}>R</Text>
          </Pressable>
        </View>

        <View style={styles.statusRow}>
          <Metric label="Busquedas" value={String(opportunities.length)} />
          <Metric label="Postulaciones" value={String(applications.length)} />
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
            onLoginPress={() => setViewMode("account")}
            onRefresh={() => void refreshApplications()}
            onWithdraw={handleWithdraw}
          />
        ) : null}

        {viewMode === "club" ? (
          <ClubView
            clubApplications={clubApplications}
            clubForm={clubForm}
            clubLoading={clubLoading}
            clubMemberships={clubMemberships}
            clubOpportunities={clubOpportunities}
            opportunityForm={opportunityForm}
            selectedClubId={selectedClubId}
            selectedClubMembership={selectedClubMembership}
            session={session}
            setClubForm={setClubForm}
            setOpportunityForm={setOpportunityForm}
            onApplicationStatus={handleClubApplicationStatus}
            onCreateClub={handleCreateClub}
            onCreateOpportunity={handleCreateClubOpportunity}
            onLoginPress={() => setViewMode("account")}
            onOpportunityAction={handleOpportunityStatusAction}
            onRefresh={() => void refreshClubMemberships()}
            onSelectClub={(clubId) => {
              const membership = clubMemberships.find(
                (currentMembership) => currentMembership.club.id === clubId
              );
              setSelectedClubId(clubId);
              if (membership && session) {
                void refreshClubWorkspace(session.accessToken, membership);
              }
            }}
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
            session={session}
            setAuthMode={setAuthMode}
            setDateOfBirth={setDateOfBirth}
            setEmail={setEmail}
            setFullName={setFullName}
            setPassword={setPassword}
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
        sessionActive={Boolean(session)}
        viewMode={viewMode}
        onSelect={(nextViewMode) => {
          setViewMode(nextViewMode);
          if (nextViewMode === "applications") {
            void refreshApplications();
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
  onRefresh,
  onWithdraw
}: {
  applications: PlayerApplication[];
  loading: boolean;
  session: Session | null;
  onLoginPress: () => void;
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
              {application.status !== "WITHDRAWN" ? (
                <Pressable
                  onPress={() => onWithdraw(application.id)}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Retirar</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function ClubView({
  clubApplications,
  clubForm,
  clubLoading,
  clubMemberships,
  clubOpportunities,
  opportunityForm,
  selectedClubId,
  selectedClubMembership,
  session,
  setClubForm,
  setOpportunityForm,
  onApplicationStatus,
  onCreateClub,
  onCreateOpportunity,
  onLoginPress,
  onOpportunityAction,
  onRefresh,
  onSelectClub
}: {
  clubApplications: ClubApplication[];
  clubForm: ClubForm;
  clubLoading: boolean;
  clubMemberships: ClubMembership[];
  clubOpportunities: Opportunity[];
  opportunityForm: OpportunityForm;
  selectedClubId: string | null;
  selectedClubMembership?: ClubMembership;
  session: Session | null;
  setClubForm: (value: ClubForm | ((current: ClubForm) => ClubForm)) => void;
  setOpportunityForm: (
    value: OpportunityForm | ((current: OpportunityForm) => OpportunityForm)
  ) => void;
  onApplicationStatus: (applicationId: string, status: string) => void;
  onCreateClub: () => void;
  onCreateOpportunity: () => void;
  onLoginPress: () => void;
  onOpportunityAction: (
    opportunityId: string,
    action: "publish" | "pause" | "close"
  ) => void;
  onRefresh: () => void;
  onSelectClub: (clubId: string) => void;
}) {
  function updateClubForm(field: keyof ClubForm, value: string) {
    setClubForm((currentForm) => ({
      ...currentForm,
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

  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.panelTitle}>Portal club</Text>
          <Text style={styles.sectionHint}>
            Crea clubes, prepara convocatorias y revisa candidatos.
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

      <View style={styles.panel}>
        <Text style={styles.formTitle}>Crear club</Text>
        <View style={styles.form}>
          <TextInput
            onChangeText={(value) => updateClubForm("name", value)}
            placeholder="Nombre del club"
            style={styles.input}
            value={clubForm.name}
          />
          <View style={styles.inlineFields}>
            <TextInput
              onChangeText={(value) => updateClubForm("city", value)}
              placeholder="Ciudad"
              style={[styles.input, styles.inlineInput]}
              value={clubForm.city}
            />
            <TextInput
              onChangeText={(value) => updateClubForm("province", value)}
              placeholder="Provincia"
              style={[styles.input, styles.inlineInput]}
              value={clubForm.province}
            />
          </View>
          <TextInput
            onChangeText={(value) => updateClubForm("federationRegion", value)}
            placeholder="Federacion territorial"
            style={styles.input}
            value={clubForm.federationRegion}
          />
          <TextInput
            autoCapitalize="none"
            inputMode="email"
            onChangeText={(value) => updateClubForm("contactEmail", value)}
            placeholder="Email de contacto"
            style={styles.input}
            value={clubForm.contactEmail}
          />
          <TextInput
            autoCapitalize="none"
            onChangeText={(value) => updateClubForm("website", value)}
            placeholder="Web del club"
            style={styles.input}
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
            <Text style={styles.primaryButtonText}>Crear club</Text>
          </Pressable>
        </View>
      </View>

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
            <Text style={styles.formTitle}>Nueva convocatoria</Text>
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
                onPress={onCreateOpportunity}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  clubLoading && styles.disabled
                ]}
              >
                <Text style={styles.primaryButtonText}>Crear borrador</Text>
              </Pressable>
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
                    <View style={styles.actionRow}>
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
  session,
  setAuthMode,
  setDateOfBirth,
  setEmail,
  setFullName,
  setPassword,
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
  session: Session | null;
  setAuthMode: (value: AuthMode) => void;
  setDateOfBirth: (value: string) => void;
  setEmail: (value: string) => void;
  setFullName: (value: string) => void;
  setPassword: (value: string) => void;
  updateProfileField: (field: keyof ProfileForm, value: string) => void;
  onLogin: () => void;
  onLogout: () => void | Promise<void>;
  onRegister: () => void;
  onSaveProfile: () => void;
}) {
  if (session) {
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
          {authMode === "login" ? "Acceso jugador" : "Registro jugador"}
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
            <TextInput
              onChangeText={setFullName}
              placeholder="Nombre completo"
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
  sessionActive,
  viewMode,
  onSelect
}: {
  applicationsCount: number;
  clubCount: number;
  sessionActive: boolean;
  viewMode: ViewMode;
  onSelect: (nextViewMode: "search" | "applications" | "club" | "account") => void;
}) {
  return (
    <View style={styles.bottomNavigation}>
      <BottomNavigationButton
        active={viewMode === "search" || viewMode === "opportunityDetail"}
        label="Buscar"
        meta="Clubes"
        onPress={() => onSelect("search")}
      />
      <BottomNavigationButton
        active={viewMode === "applications"}
        label="Postul."
        meta={String(applicationsCount)}
        onPress={() => onSelect("applications")}
      />
      <BottomNavigationButton
        active={viewMode === "club"}
        label="Club"
        meta={String(clubCount)}
        onPress={() => onSelect("club")}
      />
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

function buildCreateOpportunityPayload(
  opportunityForm: OpportunityForm,
  clubId: string
): CreateOpportunityPayload {
  const ageMin = Number.parseInt(opportunityForm.ageMin, 10);
  const ageMax = Number.parseInt(opportunityForm.ageMax, 10);

  return {
    clubId,
    title: opportunityForm.title.trim(),
    description: opportunityForm.description.trim(),
    category: cleanString(opportunityForm.category),
    gender: cleanString(opportunityForm.gender),
    modality: opportunityForm.modality,
    primaryPosition: opportunityForm.primaryPosition.trim(),
    ageMin: Number.isFinite(ageMin) ? ageMin : undefined,
    ageMax: Number.isFinite(ageMax) ? ageMax : undefined,
    locationLabel: cleanString(opportunityForm.locationLabel),
    level: cleanString(opportunityForm.level),
    opportunityType: opportunityForm.opportunityType,
    requirements: cleanString(opportunityForm.requirements)
  };
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
