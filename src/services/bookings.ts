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

/** Atendimento de exemplo, usado até a Agenda existir. */
export const DEMO_BOOKING_ID = "booking-demo"

// Fica em memória durante a sessão até a integração com o backend.
const BOOKINGS: Booking[] = [
    {
        id: DEMO_BOOKING_ID,
        specialistId: "1",
        patientId: "1",
        date: dateKey(new Date()),
        time: "10:30",
        needs: "Auxílio para locomoção (andador). Sequelas leves de AVC, foco em fisioterapia motora.",
        // Espelha calculateTotals() do Dr. Marcos Silva (R$ 150 + R$ 12 de deslocamento).
        price: 150,
        travelFee: 12,
        total: 162,
        status: "accepted",
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

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
    const specialist = await getSpecialist(input.specialistId)

    if (!specialist) {
        throw new Error("Especialista não encontrado")
    }

    const booking: Booking = {
        id: `booking-${Date.now()}`,
        ...input,
        ...calculateTotals(specialist),
        status: "pending",
    }

    BOOKINGS.push(booking)

    return booking
}

export async function getBooking(id: string): Promise<Booking | null> {
    const booking = BOOKINGS.find((item) => item.id === id)

    // Cópia: quem consome não mexe no registro em memória sem passar pelo serviço.
    return booking ? { ...booking } : null
}

type BookingListener = (booking: Booking) => void

const LISTENERS = new Map<string, Set<BookingListener>>()

/**
 * Avisa quando o status de um agendamento muda (ex.: o profissional aceita
 * a solicitação). Retorna a função para cancelar a inscrição.
 */
export function subscribeBooking(id: string, listener: BookingListener) {
    const listeners = LISTENERS.get(id) ?? new Set<BookingListener>()

    listeners.add(listener)
    LISTENERS.set(id, listeners)

    return () => {
        listeners.delete(listener)

        if (listeners.size === 0) {
            LISTENERS.delete(id)
        }
    }
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

    const updated = { ...booking }

    LISTENERS.get(id)?.forEach((listener) => listener(updated))

    return updated
}
