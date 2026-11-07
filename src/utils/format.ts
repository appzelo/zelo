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

/**
 * "1952-04-15" -> "15/04/1952"
 */
export function formatBirthDate(key: string) {
    const date = parseDateKey(key)

    if (!date) {
        return key
    }

    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

export function calculateAge(birthKey: string, from: Date = new Date()) {
    const birth = parseDateKey(birthKey)

    if (!birth) {
        return null
    }

    const beforeBirthday = from.getMonth() < birth.getMonth()
        || (from.getMonth() === birth.getMonth() && from.getDate() < birth.getDate())

    return from.getFullYear() - birth.getFullYear() - (beforeBirthday ? 1 : 0)
}

export function isTodayKey(key: string) {
    return key === dateKey(new Date())
}

/**
 * "2026-10-28" -> "Quarta, 28 de outubro de 2026"
 */
export function formatLongDateKey(key: string) {
    const date = parseDateKey(key)

    if (!date) {
        return key
    }

    return `${WEEKDAYS_LONG[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()].toLowerCase()} de ${date.getFullYear()}`
}

/**
 * "2026-10-27" -> "terça, 27/10"
 */
export function formatWeekdayDateKey(key: string) {
    const date = parseDateKey(key)

    if (!date) {
        return key
    }

    return `${WEEKDAYS_LONG[date.getDay()].toLowerCase()}, ${formatShortDateKey(key)}`
}

/**
 * 60 -> "1 hora"; 90 -> "1 hora e 30 min"; 45 -> "45 min"
 */
export function formatDurationLong(minutes: number) {
    if (minutes < 60) {
        return `${minutes} min`
    }

    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    const hourLabel = hours === 1 ? "1 hora" : `${hours} horas`

    return rest === 0 ? hourLabel : `${hourLabel} e ${rest} min`
}

/**
 * "2026-10-28" -> "Hoje" | "Amanhã" | "28/10"
 */
export function formatRelativeDayKey(key: string) {
    const today = new Date()
    const tomorrow = buildDate(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    if (isTodayKey(key)) {
        return "Hoje"
    }

    if (key === dateKey(tomorrow)) {
        return "Amanhã"
    }

    return formatShortDateKey(key)
}

/**
 * "Novembro 2026"
 */
export function formatMonthYear(date: Date = new Date()) {
    return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * 60 -> "1h"; 90 -> "1h30"; 45 -> "45 min"
 */
export function formatDuration(minutes: number) {
    if (minutes < 60) {
        return `${minutes} min`
    }

    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60

    return rest === 0 ? `${hours}h` : `${hours}h${pad(rest)}`
}

/**
 * "2026-10-29T20:54:00.000Z" -> "29/10/2026 às 20:54"
 */
export function formatTimestamp(iso: string, withTime = true) {
    const date = new Date(iso)

    if (Number.isNaN(date.getTime())) {
        return iso
    }

    const day = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`

    if (!withTime) {
        return day
    }

    return `${day} às ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatCurrency(value: number) {
    const [integer, decimals] = value.toFixed(2).split(".")
    const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

    return `R$ ${grouped},${decimals}`
}
