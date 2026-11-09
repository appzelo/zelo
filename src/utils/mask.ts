export type InputMask = "cpf" | "date" | "phone" | "cep" | "uf"

/** Comprimento máximo do valor já formatado. */
export const MASK_MAX_LENGTH: Record<InputMask, number> = {
    cpf: 14,
    date: 10,
    phone: 15,
    cep: 9,
    uf: 2,
}

export function digitsOnly(value: string) {
    return value.replace(/\D/g, "")
}

export function applyMask(value: string, mask: InputMask): string {
    switch (mask) {
        case "cpf": {
            const digits = digitsOnly(value).slice(0, 11)

            return digits
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        }

        case "date": {
            const digits = digitsOnly(value).slice(0, 8)

            return digits
                .replace(/(\d{2})(\d)/, "$1/$2")
                .replace(/(\d{2})(\d)/, "$1/$2")
        }

        case "phone": {
            const digits = digitsOnly(value).slice(0, 11)

            if (!digits) {
                return ""
            }

            if (digits.length <= 2) {
                return `(${digits}`
            }

            const areaCode = digits.slice(0, 2)
            const number = digits.slice(2)
            // Celular tem 9 dígitos; telefone fixo tem 8.
            const prefixLength = digits.length > 10 ? 5 : 4
            const prefix = number.slice(0, prefixLength)
            const suffix = number.slice(prefixLength)

            return `(${areaCode})${prefix}${suffix ? `-${suffix}` : ""}`
        }

        case "cep": {
            const digits = digitsOnly(value).slice(0, 8)

            return digits.replace(/(\d{5})(\d)/, "$1-$2")
        }

        case "uf":
            return value.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase()
    }
}
