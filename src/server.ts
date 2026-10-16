import express from "express"
// import commonUserRoutes from "./routes/commonUsersRoutes"

const app = express();

// Comando de "saúde" da api, responsável por comunicar se está acessível
//router.get('/usuarios/health', (req: Request, res: Response) => {
//    res.status(200).json({status: "ok"});
//})

app.use(express.json());
// app.use("/commonUsers", commonUserRoutes);

app.listen(3000, () => {
    console.log("Server rodando em 3000.");
})