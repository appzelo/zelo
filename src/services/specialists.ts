export type Specialist = {
    id: string,
    name: string,
    specialty: string,
    rating: number,
    distanceKm: number,
    pricePerHour: number,
    availableToday: boolean,
}

// Dados temporários até a integração com o backend.
// Basta trocar o corpo de searchSpecialists por um fetch.
const SPECIALISTS: Specialist[] = [
    {
        id: "1",
        name: "Dr. Marcos Aurelio",
        specialty: "Fisioterapeuta Motor",
        rating: 4.8,
        distanceKm: 3.2,
        pricePerHour: 180,
        availableToday: false,
    },
    {
        id: "2",
        name: "Dra. Clara Silveira",
        specialty: "Enfermeira Geriatra",
        rating: 4.9,
        distanceKm: 1.8,
        pricePerHour: 150,
        availableToday: true,
    },
]

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
