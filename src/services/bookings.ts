import { Specialist, getSpecialist } from "./specialists"
import { dateKey } from "../utils/format"

export type BookingStatus = "pending" | "accepted" | "rejected"

export type Booking = {
    id: string,
    specialistId: string,
    patientId: string,
    /** Dia no formato "AAAA-MM-DD". */
    date: string,
    /** Horário no formato "HH:MM". */
    time: string,
    needs: string,
    price: number,
    travelFee: number,
    total: number,
    status: BookingStatus,
}

export type CreateBookingInput = {
    specialistId: string,
    patientId: string,
    date: string,
    time: string,
    needs: string,
}

export type BookingTotals = {
    price: number,
    travelFee: number,
    total: number,
}

export const TRAVEL_FEE_PER_KM = 5

function daysFromNow(days: number) {
    const date = new Date()

    // Meio-dia evita viradas de dia por causa de fuso horário / horário de verão.
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() + days)

    return dateKey(date)
}

// Fica em memória durante a sessão até a integração com o backend.
const BOOKINGS: Booking[] = [
    {
        id: "booking-demo",
        specialistId: "1",
        patientId: "1",
        date: daysFromNow(0),
        time: "10:30",
        needs: "Auxílio para locomoção (andador). Sequelas leves de AVC, foco em fisioterapia motora.",
        // Espelha calculateTotals() do Dr. Marcos Silva (R$ 150 + R$ 12 de deslocamento).
        price: 150,
        travelFee: 12,
        total: 162,
        status: "accepted",
    },
    {
        id: "booking-demo-pending",
        specialistId: "2",
        patientId: "1",
        date: daysFromNow(1),
        time: "14:00",
        needs: "Acompanhamento de pressão arterial e curativo simples.",
        // Espelha calculateTotals() da Dra. Clara Silveira (R$ 150 + R$ 9 de deslocamento).
        price: 150,
        travelFee: 9,
        total: 159,
        status: "pending",
    },
]

export function calculateTotals(specialist: Specialist): BookingTotals {
    const travelFee = Math.round(specialist.distanceKm * TRAVEL_FEE_PER_KM)

    return {
        price: specialist.pricePerHour,
        travelFee,
        total: specialist.pricePerHour + travelFee,
    }
}

export type BookingConflict = "patient-day" | "slot-taken"

/**
 * Conflito que impede o agendamento. O backend devolve os mesmos códigos
 * (HTTP 409) quando a integração existir.
 */
export class BookingConflictError extends Error {
    code: BookingConflict

    constructor(code: BookingConflict) {
        super(
            code === "patient-day"
                ? "Paciente já tem atendimento neste dia"
                : "Horário já ocupado",
        )

        this.name = "BookingConflictError"
        this.code = code
    }
}

/** Situações que ainda ocupam a agenda. Recusado libera o horário. */
const ACTIVE_STATUSES: BookingStatus[] = ["pending", "accepted"]

type ConflictInput = {
    patientId: string,
    specialistId: string,
    date: string,
    time: string,
}

/**
 * Checa as duas regras da agenda: um atendimento por paciente ao dia e um
 * paciente por horário do profissional. O dia vem antes para a mensagem
 * mostrar a regra mais ampla quando as duas falham.
 */
export function findConflict(input: ConflictInput): BookingConflict | null {
    const active = BOOKINGS.filter((booking) => ACTIVE_STATUSES.includes(booking.status))

    const sameDay = active.some(
        (booking) => booking.patientId === input.patientId && booking.date === input.date,
    )

    if (sameDay) {
        return "patient-day"
    }

    const sameSlot = active.some(
        (booking) =>
            booking.specialistId === input.specialistId
            && booking.date === input.date
            && booking.time === input.time,
    )

    return sameSlot ? "slot-taken" : null
}

/**
 * Confere o código sem depender de instanceof, que quebra quando o erro
 * atravessa o transpilador.
 */
export function isBookingConflict(error: unknown): error is BookingConflictError {
    const code = (error as BookingConflictError | null)?.code

    return code === "patient-day" || code === "slot-taken"
}

/** Horários já ocupados do profissional naquele dia. */
export async function getBookedTimes(specialistId: string, date: string): Promise<string[]> {
    return BOOKINGS
        .filter(
            (booking) =>
                booking.specialistId === specialistId
                && booking.date === date
                && ACTIVE_STATUSES.includes(booking.status),
        )
        .map((booking) => booking.time)
}

/** Atendimento ativo do paciente naquele dia, se houver. */
export async function getPatientDayBooking(
    patientId: string,
    date: string,
): Promise<Booking | null> {
    const booking = BOOKINGS.find(
        (item) =>
            item.patientId === patientId
            && item.date === date
            && ACTIVE_STATUSES.includes(item.status),
    )

    return booking ? { ...booking } : null
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
    const specialist = await getSpecialist(input.specialistId)

    if (!specialist) {
        throw new Error("Especialista não encontrado")
    }

    const conflict = findConflict(input)

    if (conflict) {
        throw new BookingConflictError(conflict)
    }

    const booking: Booking = {
        id: `booking-${Date.now()}`,
        ...input,
        ...calculateTotals(specialist),
        status: "pending",
    }

    BOOKINGS.push(booking)

    notify(booking)

    // Cópia, como em getBooking(): o consumidor não mexe no registro em memória.
    return { ...booking }
}

export async function getBooking(id: string): Promise<Booking | null> {
    const booking = BOOKINGS.find((item) => item.id === id)

    // Cópia: quem consome não mexe no registro em memória sem passar pelo serviço.
    return booking ? { ...booking } : null
}

/**
 * Agendamentos do paciente, do mais antigo para o mais recente.
 * Sem patientId, devolve todos.
 */
export async function listBookings(patientId?: string): Promise<Booking[]> {
    return BOOKINGS
        .filter((booking) => patientId === undefined || booking.patientId === patientId)
        .map((booking) => ({ ...booking }))
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
}

type BookingListener = (booking: Booking) => void

const LISTENERS = new Map<string, Set<BookingListener>>()

/** Chave do conjunto que recebe todos os agendamentos, usada pela Agenda. */
const ALL_BOOKINGS = "*"

function subscribe(key: string, listener: BookingListener) {
    const listeners = LISTENERS.get(key) ?? new Set<BookingListener>()

    listeners.add(listener)
    LISTENERS.set(key, listeners)

    return () => {
        listeners.delete(listener)

        if (listeners.size === 0) {
            LISTENERS.delete(key)
        }
    }
}

function notify(booking: Booking) {
    const copy = { ...booking }

    LISTENERS.get(booking.id)?.forEach((listener) => listener(copy))
    LISTENERS.get(ALL_BOOKINGS)?.forEach((listener) => listener(copy))
}

/**
 * Avisa quando o status de um agendamento muda (ex.: o profissional aceita
 * a solicitação). Retorna a função para cancelar a inscrição.
 */
export function subscribeBooking(id: string, listener: BookingListener) {
    return subscribe(id, listener)
}

/**
 * Avisa quando qualquer agendamento é criado ou muda de status.
 */
export function subscribeBookings(listener: BookingListener) {
    return subscribe(ALL_BOOKINGS, listener)
}

export async function updateBookingStatus(
    id: string,
    status: BookingStatus,
): Promise<Booking | null> {
    const booking = BOOKINGS.find((item) => item.id === id)

    if (!booking) {
        return null
    }

    booking.status = status

    notify(booking)

    return { ...booking }
}
