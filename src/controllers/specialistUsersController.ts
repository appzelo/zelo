import {
    getUserService,
    createCommonUserService,
    modifyUserService,
    deleteUserService
} from "../services/commonUsersService"
import { Request, Response } from "express";

// Funções exportadas para responder as requisições HTTP
// Funções relacionadas com usuários paceintes ou responsáveis
export async function getUser(req: Request, res: Response) {
    try {
        const { cpf } = req.params;
        const user = await getUserService(String(cpf));
    
        res.status(200).json(user);
    } catch (error) {       
        res.status(404).json({
            error: (error as Error).message
        });
    }
}

export async function createUser(req: Request, res: Response) {
    try {
        const { nome, cpf, registro, especialidade, distMax } = req.body;
        const user = await createUserService(
            nome, 
            cpf, 
            registro, 
            especialidade,
            distMax
        );

        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({
            error: (error as Error).message
        })
    }
}

export async function modifyUser(req: Request, res: Response) {
    try {
        const { cpf, camposModificados } = req.body
        const user = await modifyUserService(
            cpf,
            camposModificados
        );

        res.status(202).json(user)
    } catch (error) {
        res.status(400).json({
            error: (error as Error).message
        })
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        const { cpf } = req.params
        const user = await deleteUserService(String(cpf));

        res.status(202).json(user)
    } catch (error) {
        res.status(400).json({
            error: (error as Error).message
        })
    }
}