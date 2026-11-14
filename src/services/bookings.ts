import { Specialist, getSpecialist } from "./specialists"
import { dateKey } from "../utils/format"

export type BookingStatus =
    | "pending"
    | "accepted"
    | "in_progress"
    | "completed"
    | "rejected"
    | "cancelled"

export type PaymentStatus = "pending" | "paid"

export type Booking = {
    id: string,
    specialistCPF: string,
    patientCPF: string,
    /** Dia no formato "AAAA-MM-DD". */
    date: string,
    /** Horário no formato "HH:MM". */
    time: string,
    needs: string,
    price: number,
    travelFee: number,
    total: number,
    status: BookingStatus,
    /** Duração combinada do atendimento, em minutos. */
    durationMinutes: number,
    /** Distância até o paciente, em km. */
    distanceKm: number,
    /** Pagamento combinado direto com o profissional. */
    paymentStatus?: PaymentStatus,
    address: {
        zipCode: string,
        street: string,
        streetNumber: string,
        neighborhood: string,
        city: string,
        state: string
    }
}

export type CreateBookingInput = {
    specialistCPF: string,
    patientCPF: string,
    date: string,
    time: string,
    needs: string,
    address: {
        zipCode: string,
        street: string,
        streetNumber: string,
        neighborhood: string,
        city: string,
        state: string
    }
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
const BOOKINGS: Booking[] = []
//     {
//         id: "booking-demo",
//         specialistId: "1",
//         patientCPF: "1",
//         date: daysFromNow(0),
//         time: "10:30",
//         needs: "Auxílio para locomoção (andador). Sequelas leves de AVC, foco em fisioterapia motora.",
//         // Espelha calculateTotals() do Dr. Marcos Silva (R$ 150 + R$ 12 de deslocamento).
//         price: 150,
//         travelFee: 12,
//         total: 162,
//         status: "accepted",
//         durationMinutes: 60,
//         distanceKm: 2.4,
//         paymentStatus: "pending",
//     },
//     {
//         id: "booking-demo-pending",
//         specialistId: "2",
//         patientCPF: "1",
//         date: daysFromNow(1),
//         time: "14:00",
//         needs: "Acompanhamento de pressão arterial e curativo simples.",
//         // Espelha calculateTotals() da Dra. Clara Silveira (R$ 150 + R$ 9 de deslocamento).
//         price: 150,
//         travelFee: 9,
//         total: 159,
//         status: "pending",
//         durationMinutes: 60,
//         distanceKm: 1.8,
//         paymentStatus: "pending",
//     },
//     {
//         id: "booking-pro-antonio",
//         specialistId: "1",
//         patientId: "2",
//         date: daysFromNow(0),
//         time: "14:00",
//         needs: "Fisioterapia motora para recuperação de cirurgia no quadril.",
//         price: 150,
//         travelFee: 16,
//         total: 166,
//         status: "accepted",
//         durationMinutes: 60,
//         distanceKm: 3.1,
//         paymentStatus: "pending",
//     },
//     {
//         id: "request-pro-helena",
//         specialistId: "1",
//         patientId: "3",
//         date: daysFromNow(1),
//         time: "09:00",
//         needs: "Reabilitação de joelho e treino de equilíbrio.",
//         price: 150,
//         travelFee: 21,
//         total: 171,
//         status: "pending",
//         durationMinutes: 60,
//         distanceKm: 4.2,
//         paymentStatus: "pending",
//     },
//     {
//         id: "request-pro-jose",
//         specialistId: "1",
//         patientId: "4",
//         date: daysFromNow(1),
//         time: "14:00",
//         needs: "Acompanhamento de pressão arterial e caminhada assistida.",
//         price: 150,
//         travelFee: 19,
//         total: 169,
//         status: "pending",
//         durationMinutes: 60,
//         distanceKm: 3.8,
//         paymentStatus: "pending",
//     },
//     {
//         id: "booking-pro-lucia",
//         specialistId: "1",
//         patientId: "5",
//         date: daysFromNow(-1),
//         time: "16:00",
//         needs: "Avaliação inicial de mobilidade.",
//         price: 150,
//         travelFee: 25,
//         total: 175,
//         status: "rejected",
//         durationMinutes: 60,
//         distanceKm: 5,
//         paymentStatus: "pending",
//     },
// ]

export function calculateTotals(specialist: Specialist): BookingTotals {
    const travelFee = Math.round(6 * TRAVEL_FEE_PER_KM)//(specialist.distanceKm * TRAVEL_FEE_PER_KM)

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

/** Situações que ainda ocupam a agenda. Recusado e concluído liberam o horário. */
const ACTIVE_STATUSES: BookingStatus[] = ["pending", "accepted", "in_progress"]

type ConflictInput = {
    patientCPF: string,
    specialistCPF: string,
    date: string,
    time: string,
    /** Ignora o próprio agendamento ao revalidar uma solicitação. */
    ignoreBookingId?: string,
}

/**
 * Checa as duas regras da agenda: um atendimento por paciente ao dia e um
 * paciente por horário do profissional. O dia vem antes para a mensagem
 * mostrar a regra mais ampla quando as duas falham.
 */
export function findConflict(input: ConflictInput): BookingConflict | null {
    const active = BOOKINGS.filter(
        (booking) =>
            ACTIVE_STATUSES.includes(booking.status)
            && booking.id !== input.ignoreBookingId,
    )

    const sameDay = active.some(
        (booking) => booking.patientCPF === input.patientCPF && booking.date === input.date,
    )

    if (sameDay) {
        return "patient-day"
    }

    const sameSlot = active.some(
        (booking) =>
            booking.specialistCPF === input.specialistCPF
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
export async function getBookedTimes(specialistCPF: string, date: string): Promise<string[]> {
    return BOOKINGS
        .filter(
            (booking) =>
                booking.specialistCPF === specialistCPF
                && booking.date === date
                && ACTIVE_STATUSES.includes(booking.status),
        )
        .map((booking) => booking.time)
}

/** Atendimento ativo do paciente naquele dia, se houver. */
export async function getPatientDayBooking(
    patientCPF: string,
    date: string,
): Promise<Booking | null> {
    const booking = BOOKINGS.find(
        (item) =>
            item.patientCPF === patientCPF
            && item.date === date
            && ACTIVE_STATUSES.includes(item.status),
    )

    return booking ? { ...booking } : null
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
    console.log("criando consulta")
    const specialist = await getSpecialist(input.specialistCPF)

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
        durationMinutes: 60,
        distanceKm: 100,//specialist.distanceKm,
        paymentStatus: "pending"
    }

    BOOKINGS.push(booking)

    notify(booking)

    console.log("tentando salvar no banco de dados")
    await fetch(`${process.env.EXPO_PUBLIC_APPT_API}/appointments`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(booking),
    })
    .then(async response => {
        console.log("oi")
        const responseJson = await response.json();
        console.log(responseJson);
    })

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
 * Sem patientCPF, devolve todos.
 */
export async function listBookings(patientCPF?: string): Promise<Booking[]> {
    try {
        fetchAndSyncBookings(patientCPF);
    } catch (error) {
        console.error("Erro ao sincronizar agendamentos do paciente:", error)
    }
    
    return BOOKINGS
        .filter((booking) => patientCPF === undefined || booking.patientCPF === patientCPF)
        .map((booking) => ({ ...booking }))
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
}

/** Agenda do profissional, ordenada por data e horário. */
export async function listSpecialistBookings(specialistCPF: string): Promise<Booking[]> {
    try {
        fetchAndSyncBookings(specialistCPF);
    } catch (error) {
        console.error("Erro ao sincronizar agendamentos do especialista:", error)
    }
    
    return BOOKINGS
        .filter((booking) => booking.specialistCPF === specialistCPF)
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

    try {
        await fetch(`${process.env.EXPO_PUBLIC_APPT_API}/appointments/${id}`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        })
    } catch (error) {
        console.error("Erro ao atualizar status no servidor:", error)
    }

    notify(booking)

    return { ...booking }
}

/**
 * Aceite da solicitação. Revalida os conflitos porque outro paciente pode
 * ter ocupado o horário enquanto o profissional decidia.
 */
export async function acceptBooking(id: string): Promise<Booking> {
    const booking = BOOKINGS.find((item) => item.id === id)

    if (!booking) {
        throw new Error("Solicitação não encontrada")
    }

    const conflict = findConflict({
        patientCPF: booking.patientCPF,
        specialistCPF: booking.specialistCPF,
        date: booking.date,
        time: booking.time,
        ignoreBookingId: booking.id,
    })

    if (conflict) {
        throw new BookingConflictError(conflict)
    }

    return (await updateBookingStatus(id, "accepted"))!
}

export async function rejectBooking(id: string): Promise<Booking> {
    const booking = BOOKINGS.find((item) => item.id === id)

    if (!booking) {
        throw new Error("Solicitação não encontrada")
    }

    return (await updateBookingStatus(id, "rejected"))!
}

export async function cancelBooking(id: string): Promise<Booking> {
    const booking = BOOKINGS.find((item) => item.id === id)

    if (!booking) {
        throw new Error("Solicitação não encontrada")
    }

    return (await updateBookingStatus(id, "cancelled"))!
}

export async function fetchAndSyncBookings(patientCPF?: string, specialistCPF?: string): Promise<Booking[]> {
    try {
        let url = `${process.env.EXPO_PUBLIC_APPT_API}/appointments/getAll/`
        if (patientCPF) url += patientCPF
        if (specialistCPF) url += specialistCPF
        
        // console.log("A url enviada para fetch é: ", url)
        const response = await fetch(url)
        // console.log(response)
        if (response.ok) {
            const data: Booking[] = await response.json()
            if (data != null) {
                // Substitui ou mescla os dados no array em memória
                BOOKINGS.length = 0 // limpa o array atual
                BOOKINGS.push(...data) // insere os dados vindos do banco
            }
        }
    } catch (error) {
        console.error("Erro ao buscar agendamentos do servidor:", error)
    }

    if (patientCPF) return listBookings(patientCPF)
    if (specialistCPF) return listBookings(specialistCPF)
    else return []
}