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

// Pacientes dos atendimentos do profissional no modo demonstração.
const EXTRA_PATIENTS: Patient[] = [
    {
        id: "2",
        name: "Antônio Pereira",
        fullName: "Antônio Pereira",
        birthDate: "1951-03-18",
        gender: "Masculino",
        address: "Rua Abílio Soares, 640 - Paraíso, São Paulo - SP",
        zipCode: "04005-001",
        street: "Rua Abílio Soares",
        streetNumber: "640",
        neighborhood: "Paraíso",
        city: "São Paulo",
        state: "SP",
        email: "antonio.pereira@email.com",
        phone: "(11) 97654-3210",
    },
    {
        id: "3",
        name: "Helena Costa",
        fullName: "Helena Costa",
        birthDate: "1949-11-05",
        gender: "Feminino",
        address: "Rua da Consolação, 2140 - Consolação, São Paulo - SP",
        zipCode: "01302-001",
        street: "Rua da Consolação",
        streetNumber: "2140",
        neighborhood: "Consolação",
        city: "São Paulo",
        state: "SP",
        email: "helena.costa@email.com",
        phone: "(11) 96543-2109",
    },
    {
        id: "4",
        name: "José Almeida",
        fullName: "José Almeida",
        birthDate: "1947-07-22",
        gender: "Masculino",
        address: "Rua Galvão Bueno, 512 - Liberdade, São Paulo - SP",
        zipCode: "01506-000",
        street: "Rua Galvão Bueno",
        streetNumber: "512",
        neighborhood: "Liberdade",
        city: "São Paulo",
        state: "SP",
        email: "jose.almeida@email.com",
        phone: "(11) 95432-1098",
    },
    {
        id: "5",
        name: "Lúcia Fernandes",
        fullName: "Lúcia Fernandes",
        birthDate: "1953-02-14",
        gender: "Feminino",
        address: "Rua Oscar Freire, 980 - Jardins, São Paulo - SP",
        zipCode: "01426-001",
        street: "Rua Oscar Freire",
        streetNumber: "980",
        neighborhood: "Jardins",
        city: "São Paulo",
        state: "SP",
        email: "lucia.fernandes@email.com",
        phone: "(11) 94321-0987",
    },
]

// Mantido em memória para que as edições do perfil valham durante a sessão.
let patient = PATIENT

export async function getPatient(): Promise<Patient> {
    return patient
}

export async function getPatientById(id: string): Promise<Patient | null> {
    if (id === patient.id) {
        return patient
    }

    return EXTRA_PATIENTS.find((item) => item.id === id) ?? null
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
