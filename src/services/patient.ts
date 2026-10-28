export type Patient = {
    id: string,
    /** Nome curto, usado nos resumos do app. */
    name: string,
    /** Nome completo, usado na área do especialista. */
    fullName: string,
    age: number,
    gender: string,
    address: string,
}

// Dados temporários até a integração com o backend.
const PATIENT: Patient = {
    id: "1",
    name: "Maria das Dores",
    fullName: "Maria das Dores Oliveira",
    age: 74,
    gender: "Feminino",
    address: "Avenida Paulista, 1578 - Bela Vista",
}

export async function getPatient(): Promise<Patient> {
    return PATIENT
}
