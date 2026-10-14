import { Router } from "express";

// Importações das funções de usersController.ts
import {
    getUser,
    createUser,
    modifyUser,
    deleteUser
} from "../controllers/commonUsersController";

const router = Router();

// Caminhos de rotas para comunicar HTTP com a aplicação
router.get("/health", (req, res) => res.json(200))
router.get("/:cpf", getUser);
router.post("/", createUser);
router.patch("/:cpf", modifyUser);
router.delete("/:cpf", deleteUser);

export default router;