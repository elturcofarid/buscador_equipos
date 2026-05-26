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
  Opportunity,
  Session,
  applyToOpportunity,
  listOpportunities,
  login,
  savePlayerProfile
} from "./api";

const defaultProfile = {
  displayName: "Jugador Candidato",
  primaryPosition: "Portero",
  modality: "FOOTBALL_11",
  availabilityStatus: "Disponible",
  locationLabel: "Madrid",
  searchRadiusKm: 30
};

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<
    string | null
  >(null);
  const [message, setMessage] = useState(
    "Estoy disponible para una prueba esta semana."
  );
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedOpportunity = useMemo(
    () =>
      opportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ??
      opportunities[0],
    [opportunities, selectedOpportunityId]
  );

  useEffect(() => {
    void refreshOpportunities();
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

  async function handleLogin() {
    setLoading(true);
    setNotice("");

    try {
      const nextSession = await login(email.trim(), password);
      setSession(nextSession);
      await savePlayerProfile(nextSession.accessToken, defaultProfile);
      setNotice("Sesion iniciada y perfil base listo");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo entrar");
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    if (!session || !selectedOpportunity) {
      setNotice("Inicia sesion para postular");
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.shell}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Comunidad de Madrid</Text>
            <Text style={styles.title}>Buscador Futbol</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={refreshOpportunities}>
            <Text style={styles.iconText}>R</Text>
          </Pressable>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Busquedas</Text>
            <Text style={styles.metricValue}>{opportunities.length}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Sesion</Text>
            <Text style={styles.metricValue}>{session ? "Activa" : "No"}</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>
            {session ? session.user.fullName : "Acceso jugador"}
          </Text>
          {!session ? (
            <View style={styles.form}>
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
                onPress={handleLogin}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  loading && styles.disabled
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Entrando..." : "Entrar"}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.sessionBox}>
              <Text style={styles.sessionText}>{session.user.email}</Text>
              <Pressable
                onPress={() => {
                  setSession(null);
                  setNotice("");
                }}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Cerrar sesion</Text>
              </Pressable>
            </View>
          )}
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <View style={styles.contentGrid}>
          <View style={styles.panel}>
            <View style={styles.sectionHeader}>
              <Text style={styles.panelTitle}>Busquedas activas</Text>
              {loading ? <ActivityIndicator color="#157f58" /> : null}
            </View>

            {opportunities.length === 0 ? (
              <Text style={styles.emptyText}>No hay busquedas activas.</Text>
            ) : (
              <View style={styles.list}>
                {opportunities.map((opportunity) => {
                  const active = opportunity.id === selectedOpportunity?.id;
                  return (
                    <Pressable
                      key={opportunity.id}
                      onPress={() => setSelectedOpportunityId(opportunity.id)}
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
                        {opportunity.primaryPosition} ·{" "}
                        {opportunity.locationLabel ?? "Zona sin definir"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Detalle</Text>
            {selectedOpportunity ? (
              <View style={styles.detail}>
                <Text style={styles.detailTitle}>{selectedOpportunity.title}</Text>
                <Text style={styles.detailClub}>
                  {selectedOpportunity.club.name}
                </Text>
                <Text style={styles.description}>
                  {selectedOpportunity.description}
                </Text>
                <View style={styles.detailGrid}>
                  <Info label="Posicion" value={selectedOpportunity.primaryPosition} />
                  <Info
                    label="Categoria"
                    value={selectedOpportunity.category ?? "Sin categoria"}
                  />
                  <Info
                    label="Edad"
                    value={formatAgeRange(selectedOpportunity)}
                  />
                  <Info
                    label="Tipo"
                    value={formatOpportunityType(
                      selectedOpportunity.opportunityType
                    )}
                  />
                </View>
                <TextInput
                  multiline
                  onChangeText={setMessage}
                  placeholder="Mensaje para el club"
                  style={[styles.input, styles.messageInput]}
                  value={message}
                />
                <Pressable
                  disabled={loading || !session}
                  onPress={handleApply}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressed,
                    (!session || loading) && styles.disabled
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {session ? "Postular" : "Inicia sesion para postular"}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.emptyText}>Selecciona una busqueda.</Text>
            )}
          </View>
        </View>

        <Text style={styles.footer}>API: {API_BASE_URL}</Text>
      </ScrollView>
    </SafeAreaView>
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

function formatModality(modality: string) {
  return modality.replace("FOOTBALL_", "F").replace("_", " ");
}

function formatOpportunityType(type: string) {
  return type
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
  shell: {
    gap: 14,
    marginHorizontal: "auto",
    maxWidth: 1040,
    padding: 18,
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
    fontSize: 24,
    fontWeight: "900"
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
  form: {
    gap: 10
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
  sessionBox: {
    gap: 10
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
  contentGrid: {
    gap: 14
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
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
  emptyText: {
    color: "#64726e",
    paddingVertical: 10
  },
  footer: {
    color: "#64726e",
    fontSize: 12,
    textAlign: "center"
  },
  pressed: {
    opacity: 0.75
  },
  disabled: {
    opacity: 0.55
  }
});
