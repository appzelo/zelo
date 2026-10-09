export interface User {
    nome: string;
    cpf: string;
    dataNascimento: Date;
    email: string;
    celular: string;
    endereco: Address;
}

interface Address {
    cep: string,
    rua: string,
    numero: number,
    bairro: string,
    cidade: string     
}

export type UserUpdate = Partial<Omit<User, "cpf">>;