import { getBooking } from "./bookings"
import { getSpecialist } from "./specialists"

export type TrackingStatus = "on_the_way" | "arrived" | "in_service"

export type TrafficLevel = "Livre" | "Moderado" | "Intenso"

export type Tracking = {
    status: TrackingStatus,
    etaMinutes: number,
    traffic: TrafficLevel,
}

// Dados temporários até a integração com o backend.
// O ETA é derivado da distância só para manter a tela coerente.
export async function getTracking(bookingId: string): Promise<Tracking | null> {
    const booking = await getBooking(bookingId)

    if (!booking) {
        return null
    }

    const specialist = await getSpecialist(booking.specialistId)

    if (!specialist) {
        return null
    }

    return {
        status: "on_the_way",
        etaMinutes: Math.max(5, Math.round(specialist.distanceKm * 6)),
        traffic: "Livre",
    }
}
