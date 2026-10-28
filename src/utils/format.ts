// Formatação pt-BR sem Intl (o Hermes do Android não garante todos os locales).

export const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export const WEEKDAYS_LONG = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
]

export const MONTHS = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
]

export type DayOption = {
    key: string,
    weekday: string,
    day: number,
    month: string,
    date: Date,
}

function pad(value: number) {
    return String(value).padStart(2, "0")
}

function buildDate(year: number, month: number, day: number) {
    // Meio-dia evita viradas de dia por causa de fuso horário / horário de verão.
    return new Date(year, month, day, 12, 0, 0, 0)
}

export function dateKey(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Próximos dias disponíveis para agendamento, começando hoje.
 */
export function nextDays(count = 5, from: Date = new Date()): DayOption[] {
    return Array.from({ length: count }, (_, index) => {
        const date = buildDate(from.getFullYear(), from.getMonth(), from.getDate() + index)

        return {
            key: dateKey(date),
            weekday: WEEKDAYS_SHORT[date.getDay()],
            day: date.getDate(),
            month: MONTHS[date.getMonth()],
            date,
        }
    })
}

function parseDateKey(key: string) {
    const [year, month, day] = key.split("-").map(Number)

    if (!year || !month || !day) {
        return null
    }

    return buildDate(year, month - 1, day)
}

/**
 * "2026-10-28" + "09:00" -> "Quarta, 28 de Outubro às 09:00"
 */
export function formatDateKey(key: string, time?: string) {
    const date = parseDateKey(key)

    if (!date) {
        return time ?? ""
    }

    const long = `${WEEKDAYS_LONG[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`

    return time ? `${long} às ${time}` : long
}

/**
 * "2026-10-28" -> "28/10"
 */
export function formatShortDateKey(key: string) {
    const date = parseDateKey(key)

    if (!date) {
        return key
    }

    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`
}

export function formatCurrency(value: number) {    const [integer, decimals] = value.toFixed(2).split(".")
    const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

    return `R$ ${grouped},${decimals}`
}
