/**
 * Configuração de atendimento do profissional: horário de trabalho por dia
 * da semana, dias bloqueados e raio máximo de deslocamento.
 *
 * Separado de availability.ts, que calcula os horários livres do paciente.
 */
export type DayAvailability = {
    enabled: boolean,
    /** "HH:MM" */
    start: string,
    /** "HH:MM" */
    end: string,
}

export type SpecialistAvailability = {
    specialistId: string,
    radiusKm: number,
    /** Chave: 0 = domingo ... 6 = sábado. */
    workingHours: Record<number, DayAvailability>,
    /** Dias sem atendimento no formato "AAAA-MM-DD". */
    blockedDates: string[],
}

export const DEFAULT_WORKING_HOURS: Record<number, DayAvailability> = {
    0: { enabled: false, start: "08:00", end: "18:00" },
    1: { enabled: true, start: "08:00", end: "18:00" },
    2: { enabled: true, start: "08:00", end: "18:00" },
    3: { enabled: true, start: "08:00", end: "18:00" },
    4: { enabled: true, start: "08:00", end: "18:00" },
    5: { enabled: true, start: "08:00", end: "18:00" },
    6: { enabled: true, start: "08:00", end: "12:00" },
}

const AVAILABILITIES = new Map<string, SpecialistAvailability>()

function cloneWorkingHours(hours: Record<number, DayAvailability>) {
    return Object.fromEntries(
        Object.entries(hours).map(([day, value]) => [Number(day), { ...value }]),
    ) as Record<number, DayAvailability>
}

function cloneAvailability(availability: SpecialistAvailability): SpecialistAvailability {
    return {
        ...availability,
        workingHours: cloneWorkingHours(availability.workingHours),
        blockedDates: [...availability.blockedDates],
    }
}

export async function getSpecialistAvailability(
    specialistId: string,
): Promise<SpecialistAvailability> {
    const existing = AVAILABILITIES.get(specialistId)

    if (existing) {
        return cloneAvailability(existing)
    }

    const initial: SpecialistAvailability = {
        specialistId,
        radiusKm: 10,
        workingHours: cloneWorkingHours(DEFAULT_WORKING_HOURS),
        blockedDates: [],
    }

    AVAILABILITIES.set(specialistId, initial)

    return cloneAvailability(initial)
}

export async function saveSpecialistAvailability(
    availability: SpecialistAvailability,
): Promise<SpecialistAvailability> {
    AVAILABILITIES.set(availability.specialistId, cloneAvailability(availability))

    return cloneAvailability(availability)
}
