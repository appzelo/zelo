export type Consent = {
    patientId: string,
    /** Data e hora do aceite em ISO 8601. */
    acceptedAt: string,
}

// Fica em memória durante a sessão até a integração com o backend.
// O aceite vale por paciente, não por agendamento.
const CONSENTS = new Map<string, Consent>()

export async function getConsent(patientId: string): Promise<Consent | null> {
    return CONSENTS.get(patientId) ?? null
}

/**
 * Registra o aceite do paciente. Se já houver, mantém o primeiro.
 */
export async function acceptConsent(patientId: string): Promise<Consent> {
    const existing = CONSENTS.get(patientId)

    if (existing) {
        return existing
    }

    const consent: Consent = {
        patientId,
        acceptedAt: new Date().toISOString(),
    }

    CONSENTS.set(patientId, consent)

    return consent
}
