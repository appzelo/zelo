import { getBookedTimes } from "./bookings"
import { getAvailability } from "./specialists"

export type Slot = {
    /** "HH:MM". */
    time: string,
    /** Já reservado por outro atendimento do profissional. */
    taken: boolean,
}

/**
 * Horários do dia com o que o profissional já tem reservado. Módulo separado
 * para `bookings` e `specialists` não importarem um ao outro.
 */
export async function getDaySlots(specialistId: string, date: string): Promise<Slot[]> {
    const [slots, booked] = await Promise.all([
        getAvailability(specialistId),
        getBookedTimes(specialistId, date),
    ])

    return slots.map((time) => ({ time, taken: booked.includes(time) }))
}
