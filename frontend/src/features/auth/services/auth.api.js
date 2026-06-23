import axios from "axios"

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
})

export async function register({ username, email, password }) {

    const response = await api.post('/auth/register', {
        username, email, password
    })

    return response.data

}

export async function login({ email, password }) {

    const response = await api.post("/auth/login", {
        email, password
    })

    return response.data

}

export async function logout() {
    try {

        const response = await api.get("/auth/logout")

        return response.data

    } catch (err) {
        console.log(err)

    }
}

export async function getMe() {

    try {

        const response = await api.get("/auth/get-me")

        return response.data

    } catch (err) {
        if (err.response?.status === 401) {
            return { user: null }
        }

        throw err
    }

}
