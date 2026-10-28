import { Specialist, getSpecialist } from "./specialists"

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

// Fica em memória durante a sessão até a integração com o backend.
const BOOKINGS: Booking[] = []

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
    return BOOKINGS.find((booking) => booking.id === id) ?? null
}
