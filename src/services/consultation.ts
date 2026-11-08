import { Booking, PaymentStatus, getBooking, updateBookingStatus } from "./bookings"
import { isTodayKey } from "../utils/format"

/**
 * Camada de consulta do atendimento: token de início e pagamento.
 *
 * O token é gerado no dia do atendimento e só deve ser exposto ao paciente.
 * No backend real o profissional recebe apenas o resultado da verificação.
 */
export type Consultation = {
    bookingId: string,
    token: string,
    startedAt: string | null,
    endedAt: string | null,
    paymentStatus: PaymentStatus,
}

type ConsultationRecord = Consultation

const CONSULTATIONS = new Map<string, ConsultationRecord>()

/** Token fixo do atendimento de demonstração. */
const DEMO_TOKENS: Record<string, string> = {
    "booking-demo": "4821",
}

function generateToken() {
    return String(Math.floor(1000 + Math.random() * 9000))
}

function getRecord(booking: Booking): ConsultationRecord {
    const existing = CONSULTATIONS.get(booking.id)

    if (existing) {
        return existing
    }

    const record: ConsultationRecord = {
        bookingId: booking.id,
        token: DEMO_TOKENS[booking.id] ?? generateToken(),
        startedAt: null,
        endedAt: null,
        paymentStatus: booking.paymentStatus ?? "pending",
    }

    CONSULTATIONS.set(booking.id, record)

    return record
}

/**
 * Token do atendimento. Só existe a partir do dia marcado, para o paciente
 * não conseguir iniciar a consulta antes da hora.
 */
export async function getPatientToken(bookingId: string): Promise<string | null> {
    const booking = await getBooking(bookingId)

    if (!booking || !isTodayKey(booking.date)) {
        return null
    }

    return getRecord(booking).token
}

/**
 * Confere o token digitado pelo profissional. O token nunca é devolvido
 * por esta função: o profissional só vê válido ou inválido.
 */
export async function verifyToken(bookingId: string, token: string): Promise<boolean> {
    const booking = await getBooking(bookingId)

    if (!booking || !isTodayKey(booking.date)) {
        return false
    }

    return getRecord(booking).token === token.trim()
}

export type StartResult =
    | { ok: true, consultation: Consultation }
    | { ok: false, reason: "not-found" | "not-today" | "not-accepted" | "invalid-token" }

/**
 * Inicia o atendimento: precisa estar aceito, ser hoje e o token precisa
 * bater. Depois disso o paciente libera o pagamento.
 */
export async function startConsultation(
    bookingId: string,
    token: string,
): Promise<StartResult> {
    const booking = await getBooking(bookingId)

    if (!booking) {
        return { ok: false, reason: "not-found" }
    }

    if (!isTodayKey(booking.date)) {
        return { ok: false, reason: "not-today" }
    }

    if (booking.status !== "accepted") {
        return { ok: false, reason: "not-accepted" }
    }

    if (!(await verifyToken(bookingId, token))) {
        return { ok: false, reason: "invalid-token" }
    }

    const record = getRecord(booking)

    record.startedAt = new Date().toISOString()

    await updateBookingStatus(bookingId, "in_progress")

    return { ok: true, consultation: { ...record } }
}

export type EndResult =
    | { ok: true, consultation: Consultation }
    | { ok: false, reason: "not-found" | "not-in-progress" }

/** Encerra o atendimento. O pagamento não bloqueia o encerramento. */
export async function endConsultation(bookingId: string): Promise<EndResult> {
    const booking = await getBooking(bookingId)

    if (!booking) {
        return { ok: false, reason: "not-found" }
    }

    if (booking.status !== "in_progress") {
        return { ok: false, reason: "not-in-progress" }
    }

    const record = getRecord(booking)

    record.endedAt = new Date().toISOString()

    await updateBookingStatus(bookingId, "completed")

    return { ok: true, consultation: { ...record } }
}

/** Marca o pagamento como recebido (mock do PIX, sem gateway). */
export async function markConsultationPaid(bookingId: string): Promise<Consultation | null> {
    const booking = await getBooking(bookingId)

    if (!booking) {
        return null
    }

    const record = getRecord(booking)

    record.paymentStatus = "paid"

    return { ...record }
}

export async function getConsultation(bookingId: string): Promise<Consultation | null> {
    const booking = await getBooking(bookingId)

    if (!booking) {
        return null
    }

    return { ...getRecord(booking) }
}
