export type Specialist = {
    id: string,
    name: string,
    specialty: string,
    /** Registro profissional, ex.: "CRM 123456-SP". */
    license: string,
    rating: number,
    reviews: number,
    distanceKm: number,
    pricePerHour: number,
    /** Raio máximo de atendimento domiciliar. */
    maxDistanceKm: number,
    paymentMethods: string[],
    availableToday: boolean,
}

// Dados temporários até a integração com o backend.
// Basta trocar o corpo das funções por um fetch.
const SPECIALISTS: Specialist[] = [
    {
        id: "1",
        name: "Dr. Marcos Silva",
        specialty: "Fisioterapeuta Geriátrico",
        license: "CRM 123456-SP",
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

export async function searchSpecialists(query: string): Promise<Specialist[]> {
    const term = query.trim().toLowerCase()

    if (!term) {
        return SPECIALISTS
    }

    return SPECIALISTS.filter((specialist) =>
        specialist.name.toLowerCase().includes(term)
        || specialist.specialty.toLowerCase().includes(term)
    )
}

export async function getSpecialist(id: string): Promise<Specialist | null> {
    return SPECIALISTS.find((specialist) => specialist.id === id) ?? null
}

export async function getAvailability(id: string): Promise<string[]> {
    const specialist = await getSpecialist(id)

    return specialist ? AVAILABLE_SLOTS : []
}
