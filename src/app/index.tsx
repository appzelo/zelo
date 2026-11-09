import { Redirect } from "expo-router"

// Ponto de entrada do app: sem sessão persistida, todo início passa pelo login.
export default function Index() {
    return <Redirect href="/login" />
}
