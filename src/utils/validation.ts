import { digitsOnly } from "./mask"

/** Regras de validação compartilhadas pelos formulários. */

export const MIN_PASSWORD_LENGTH = 8

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Valida o CPF incluindo os dígitos verificadores. */
export function isValidCPF(value: string): boolean {
    const digits = digitsOnly(value)

    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
        return false
    }

    function checkDigit(length: number) {
        let sum = 0

        for (let index = 0; index < length; index++) {
            sum += Number(digits[index]) * (length + 1 - index)
        }

        const rest = (sum * 10) % 11

        return rest === 10 ? 0 : rest
    }

    return checkDigit(9) === Number(digits[9])
        && checkDigit(10) === Number(digits[10])
}

/** Valida uma data DD/MM/AAAA real e que não esteja no futuro. */
export function isValidDate(value: string): boolean {
    const digits = digitsOnly(value)

    if (digits.length !== 8) {
        return false
    }

    const day = Number(digits.slice(0, 2))
    const month = Number(digits.slice(2, 4))
    const year = Number(digits.slice(4, 8))

    if (year < 1900) {
        return false
    }

    const date = new Date(year, month - 1, day)

    if (
        date.getFullYear() !== year
        || date.getMonth() !== month - 1
        || date.getDate() !== day
    ) {
        return false
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return date <= today
}

/** Verifica se a data representa pelo menos a idade informada. */
export function isAtLeastYears(value: string, years: number): boolean {
    if (!isValidDate(value)) {
        return false
    }

    const digits = digitsOnly(value)
    const birth = new Date(
        Number(digits.slice(4, 8)),
        Number(digits.slice(2, 4)) - 1,
        Number(digits.slice(0, 2)),
    )
    const limit = new Date()
    limit.setFullYear(limit.getFullYear() - years)

    return birth <= limit
}

export function isValidEmail(value: string): boolean {
    return EMAIL_REGEX.test(value.trim())
}

export function isValidPhone(value: string): boolean {
    const digits = digitsOnly(value)

    return digits.length === 10 || digits.length === 11
}

export function isValidCEP(value: string): boolean {
    return digitsOnly(value).length === 8
}

export function isValidUF(value: string): boolean {
    return /^[A-Z]{2}$/.test(value.trim().toUpperCase())
}
