import { ResultSetHeader } from "mysql2";
import { pool } from "../database/commonUsersDB";
import { User, UserUpdate } from "../types/commonUser"
import { error } from "node:console";

export async function findUserByCPF(cpf: string) {
    const [rows] = await pool.execute(
        ' \
        SELECT nome, cpf, dataNascimento, email, celular, endereco \
        FROM users \
        WHERE cpf = ? \
        ',
        [cpf]
    );

    return Array.isArray(rows) && rows.length > 0 
        ? rows[0] : null;
}

export async function insertUser(
    nome: string,
    cpf: string, 
    dataNascimento: Date, 
    email: string, 
    celular: string, 
    endereco: User["endereco"]
) {
    const [result] = await pool.execute<ResultSetHeader>(
        ' \
        INSERT INTO users \
        (nome, cpf, dataNascimento, email, celular, endereco) \
        VALUES \
        (?, ?, ?, ?, ?, ?) \
        ',
        [nome, cpf, dataNascimento, email, celular, JSON.stringify(endereco)]
    );

    return result.insertId;
}

export async function modifyUser(cpf: string, camposModificados: UserUpdate) {
    const campos = Object.entries(camposModificados)
        .filter(([campo, valor]) => 
            [
                "nome",
                "dataNascimento",
                "email",
                "celular",
                "endereco"
            ].includes(campo) && valor !== undefined
        );
    
    if (campos.length === 0) {
        throw new Error("Nenhum campo validado para modificar")
    }

    const definicoes = campos.map(([campo]) => `\`${campo}\` = ?`);
    const valores = campos.map(([campo, valor]) =>
        campo === "endereco"
            ? JSON.stringify(valor) : valor
    );

    const [result] = await pool.execute<ResultSetHeader>({
        sql: `UPDATE users
        SET ${definicoes.join(", ")}
        WHERE cpf = ?`,
        values: [...valores, cpf]
    });
    
    return result.affectedRows;
}

export async function deleteUser(cpf: string) {
    const [result] = await pool.execute<ResultSetHeader>(
        ' \
        DELETE FROM users \
        WHERE cpf = ? \
        ',
        [cpf]
    );

    return result.affectedRows;
}