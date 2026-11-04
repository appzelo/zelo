export type Patient = {
    id: string,
    /** Nome curto, usado nos resumos do app. */
    name: string,
    /** Nome completo, usado na área do especialista. */
    fullName: string,
    /** Data de nascimento no formato "AAAA-MM-DD". */
    birthDate: string,
    gender: string,
    /** Endereço completo já formatado para exibição. */
    address: string,
    zipCode: string,
    street: string,
    streetNumber: string,
    neighborhood: string,
    city: string,
    state: string,
    email: string,
    phone: string,
}

// Dados temporários até a integração com o backend.
const PATIENT: Patient = {
    id: "1",
    name: "Maria das Dores",
    fullName: "Maria das Dores Oliveira",
    birthDate: "1952-04-15",
    gender: "Feminino",
    address: "Avenida Paulista, 1578 - Bela Vista, São Paulo - SP",
    zipCode: "01310-100",
    street: "Avenida Paulista",
    streetNumber: "1578",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    email: "maria.oliveira@email.com",
    phone: "(11) 98765-4321",
}

// Mantido em memória para que as edições do perfil valham durante a sessão.
let patient = PATIENT

export async function getPatient(): Promise<Patient> {
    return patient
}

export async function updatePatient(
    changes: Partial<Omit<Patient, "id">>,
): Promise<Patient> {
    patient = { ...patient, ...changes }

    return patient
}

/**
 * Monta o endereço de exibição a partir dos campos separados do cadastro.
 * "Avenida Paulista, 1578 - Bela Vista, São Paulo - SP"
 */
export function formatAddress(
    address: Pick<Patient, "street" | "streetNumber" | "neighborhood" | "city" | "state">,
): string {
    const streetLine = [address.street, address.streetNumber].filter(Boolean).join(", ")
    const cityLine = [address.neighborhood, address.city].filter(Boolean).join(", ")
    const region = [cityLine, address.state].filter(Boolean).join(" - ")

    return [streetLine, region].filter(Boolean).join(" - ")
}

/**
 * Nome curto para os resumos: primeiro e último nome.
 * "Maria das Dores Oliveira" -> "Maria Oliveira"
 */
export function formatShortName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean)

    if (parts.length <= 1) {
        return parts[0] ?? ""
    }

    return `${parts[0]} ${parts[parts.length - 1]}`
}
