import {
    findUserByCPF,
    insertUser,
    modifyUser,
    deleteUser
} from "../repositories/commonUsersRepository"

export async function getUserService(cpf: string) {
    const existingUser = await findUserByCPF(cpf);

    if (!existingUser) {
        throw new Error("Usuário não encontrado");
    }

    return await existingUser;
}

export async function createUserService(
    nome: string,
    cpf: string, 
    dataNascimento: Date, 
    email: string, 
    celular: string, 
    endereco: JSON
) {
    const existingUser = await findUserByCPF(cpf);

    if (existingUser) {
        throw new Error("Usuário já cadastrado");
    }

    return await insertUser(
        nome,
        cpf, 
        dataNascimento, 
        email, 
        celular, 
        endereco
    );
}

export async function modifyUserService(cpf: string, camposModificados: JSON) {
    const existingUser = await findUserByCPF(cpf);

    if (!existingUser) {
        throw new Error("Usuário não encontrado");
    }

    return modifyUser(
        cpf,
        camposModificados
    );
}

export async function deleteUserService(cpf: string) {
    const existingUser = await findUserByCPF(cpf);

    if (!existingUser) {
        throw new Error("Usuário não encontrado");
    }

    return await deleteUser(cpf);
}