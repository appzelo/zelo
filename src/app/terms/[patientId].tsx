import { useEffect, useState } from "react"
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "../../utils/constants/colors"
import { formatTimestamp } from "../../utils/format"
import { Patient, getPatient } from "../../services/patient"
import { Consent, getConsent } from "../../services/consent"
import BackHeader from "../../components/BackHeader"

const SECTIONS = [
    {
        title: "1. Objeto",
        body: "Este termo autoriza a realização de atendimento domiciliar por profissional cadastrado na plataforma Zelo, no endereço informado pelo paciente ou responsável, na data e no horário confirmados no aplicativo.",
    },
    {
        title: "2. Acesso ao domicílio",
        body: "O paciente, ou seu responsável legal, autoriza a entrada do profissional no imóvel no horário agendado e se compromete a manter um acompanhante maior de idade durante todo o atendimento.",
    },
    {
        title: "3. Escopo do atendimento",
        body: "O profissional executará apenas procedimentos compatíveis com sua formação e registro no conselho de classe. Situações de urgência ou emergência serão encaminhadas ao serviço de saúde adequado.",
    },
    {
        title: "4. Dados pessoais e privacidade",
        body: "Os dados de saúde e de localização são usados exclusivamente para viabilizar o atendimento e o deslocamento do profissional, conforme a Lei Geral de Proteção de Dados (LGPD). A exclusão pode ser solicitada a qualquer momento.",
    },
    {
        title: "5. Cancelamento e remarcação",
        body: "Cancelamentos com menos de 4 horas de antecedência podem gerar cobrança da taxa de deslocamento. Remarcações podem ser feitas pelo aplicativo, respeitando a disponibilidade do profissional.",
    },
    {
        title: "6. Declaração",
        body: "Declaro que li e compreendi as condições acima, que concordo com elas e que as informações de saúde fornecidas são verdadeiras.",
    },
]

export default function ConsentTerm() {
    const { patientId } = useLocalSearchParams<{ patientId: string }>()
    const insets = useSafeAreaInsets()

    const [patient, setPatient] = useState<Patient | null>(null)
    const [consent, setConsent] = useState<Consent | null>(null)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        let active = true

        Promise.all([getPatient(), getConsent(patientId)]).then(([currentPatient, found]) => {
            if (!active) {
                return
            }

            setPatient(currentPatient)
            setConsent(found)
            setLoaded(true)
        })

        return () => {
            active = false
        }
    }, [patientId])

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BackHeader text="Termo de Consentimento" />
            </View>

            {!loaded && (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.blue1} />
                </View>
            )}

            {loaded && !patient && (
                <View style={styles.centered}>
                    <Text style={styles.empty}>Paciente não encontrado.</Text>
                </View>
            )}

            {patient && (
                <ScrollView
                    contentContainerStyle={[
                        styles.scroll,
                        { paddingBottom: Math.max(insets.bottom, 12) + 20 },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.intro}>
                        <Text style={styles.title}>
                            Termo de Consentimento para Atendimento Domiciliar
                        </Text>
                        <Text style={styles.patient}>{`Paciente: ${patient.fullName}`}</Text>
                        <Text style={styles.hint}>
                            Leia com atenção. O aceite vale para este e para os próximos
                            atendimentos.
                        </Text>
                    </View>

                    <View style={styles.sections}>
                        {SECTIONS.map((section) => (
                            <View key={section.title} style={styles.section}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <Text style={styles.sectionBody}>{section.body}</Text>
                            </View>
                        ))}
                    </View>

                    {consent ? (
                        <View style={styles.acceptedCard}>
                            <View style={styles.acceptedCheck}>
                                <Text style={styles.checkMark}>✓</Text>
                            </View>

                            <View style={styles.acceptedText}>
                                <Text style={styles.acceptedLabel}>Termo aceito</Text>
                                <Text style={styles.acceptedAt}>
                                    {formatTimestamp(consent.acceptedAt)}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.pendingNote}>
                            O aceite é registrado ao enviar a solicitação de atendimento.
                        </Text>
                    )}
                </ScrollView>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white1,
        flex: 1,
        width: "100%",
    },

    header: {
        paddingHorizontal: 28,
    },

    scroll: {
        gap: 18,
        paddingHorizontal: 28,
    },

    centered: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 28,
    },

    empty: {
        color: colors.gray2,
        fontSize: 14,
        textAlign: "center",
    },

    intro: {
        gap: 6,
    },

    title: {
        color: colors.blue1,
        fontSize: 19,
        fontWeight: "bold",
        lineHeight: 25,
    },

    patient: {
        color: colors.dark1,
        fontSize: 13,
        fontWeight: "bold",
    },

    hint: {
        color: colors.gray2,
        fontSize: 12,
        lineHeight: 17,
    },

    sections: {
        backgroundColor: colors.white2,
        borderColor: colors.gray1,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 14,
        padding: 16,
    },

    section: {
        gap: 4,
    },

    sectionTitle: {
        color: colors.green1,
        fontSize: 12.5,
        fontWeight: "bold",
    },

    sectionBody: {
        color: colors.gray2,
        fontSize: 12.5,
        lineHeight: 18,
    },

    acceptedCard: {
        alignItems: "center",
        backgroundColor: colors.green3,
        borderColor: colors.green1,
        borderRadius: 12,
        borderWidth: 1.5,
        flexDirection: "row",
        gap: 12,
        padding: 14,
    },

    acceptedCheck: {
        alignItems: "center",
        backgroundColor: colors.green1,
        borderRadius: 16,
        height: 32,
        justifyContent: "center",
        width: 32,
    },

    checkMark: {
        color: colors.white2,
        fontSize: 15,
        fontWeight: "bold",
    },

    acceptedText: {
        flex: 1,
        gap: 2,
    },

    acceptedLabel: {
        color: colors.green1,
        fontSize: 10.5,
        fontWeight: "bold",
        letterSpacing: 0.6,
        textTransform: "uppercase",
    },

    acceptedAt: {
        color: colors.dark1,
        fontSize: 13,
        fontWeight: "bold",
    },

    pendingNote: {
        color: colors.gray2,
        fontSize: 12,
        lineHeight: 17,
        textAlign: "center",
    },
})
