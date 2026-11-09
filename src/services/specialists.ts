export type Specialist = {
    id: string,
    name: string,
    specialty: string,
    /** Registro profissional, ex.: "CRM 123456-SP". */
    license: string,
    email: string,
    phone: string,
    rating: number,
    reviews: number,
    distanceKm: number,
    pricePerHour: number,
    /** Raio máximo de atendimento domiciliar. */
    maxDistanceKm: number,
    paymentMethods: string[],
    availableToday: boolean,
}

/** Campos editáveis na tela de perfil do especialista. */
export type SpecialistProfileInput = Pick<
    Specialist,
    "name" | "specialty" | "license" | "email" | "phone"
>

// Dados temporários até a integração com o backend.
// Basta trocar o corpo das funções por um fetch.
const SPECIALISTS: Specialist[] = [
    {
        id: "1",
        name: "Dr. Marcos Silva",
        specialty: "Fisioterapeuta Geriátrico",
        license: "CRM 123456-SP",
        email: "marcos.silva@zelo.com.br",
        phone: "(11) 91234-5678",
        rating: 4.9,
        reviews: 48,
        distanceKm: 2.4,
        pricePerHour: 150,
        maxDistanceKm: 10,
        paymentMethods: ["Pix", "Cartão de Crédito", "Dinheiro"],
        availableToday: true,
    },
    {
        id: "2",
        name: "Dra. Clara Silveira",
        specialty: "Enfermeira Geriatra",
        license: "COREN 987654-SP",
        email: "clara.silveira@zelo.com.br",
        phone: "(11) 92345-6789",
        rating: 4.9,
        reviews: 31,
        distanceKm: 1.8,
        pricePerHour: 150,
        maxDistanceKm: 8,
        paymentMethods: ["Pix", "Dinheiro"],
        availableToday: true,
    },
]

const AVAILABLE_SLOTS = ["09:00", "10:30", "14:00", "15:30"]

export type SpecialistFilters = {
    /** Valor máximo por hora; `null` desliga o filtro. */
    maxPrice: number | null,
    /** Distância máxima em km; `null` desliga o filtro. */
    maxDistanceKm: number | null,
    availableToday: boolean,
}

export const DEFAULT_FILTERS: SpecialistFilters = {
    maxPrice: null,
    maxDistanceKm: null,
    availableToday: false,
}

export function countActiveFilters(filters: SpecialistFilters): number {
    return (filters.maxPrice !== null ? 1 : 0)
        + (filters.maxDistanceKm !== null ? 1 : 0)
        + (filters.availableToday ? 1 : 0)
}

export async function searchSpecialists(
    query: string,
    filters: SpecialistFilters = DEFAULT_FILTERS,
): Promise<Specialist[]> {
    const term = query.trim().toLowerCase()

    return SPECIALISTS.filter((specialist) => {
        const matchesTerm = !term
            || specialist.name.toLowerCase().includes(term)
            || specialist.specialty.toLowerCase().includes(term)

        const matchesPrice = filters.maxPrice === null
            || specialist.pricePerHour <= filters.maxPrice

        const matchesDistance = filters.maxDistanceKm === null
            || specialist.distanceKm <= filters.maxDistanceKm

        const matchesToday = !filters.availableToday || specialist.availableToday

        return matchesTerm && matchesPrice && matchesDistance && matchesToday
    })
}

export async function getSpecialist(id: string): Promise<Specialist | null> {
    return SPECIALISTS.find((specialist) => specialist.id === id) ?? null
}

export async function updateSpecialist(
    id: string,
    input: SpecialistProfileInput,
): Promise<Specialist | null> {
    const specialist = SPECIALISTS.find((item) => item.id === id)

    if (!specialist) {
        return null
    }

    Object.assign(specialist, input)

    return specialist
}

export async function getAvailability(id: string): Promise<string[]> {
    const specialist = await getSpecialist(id)

    return specialist ? AVAILABLE_SLOTS : []
}
