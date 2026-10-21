import api from "./api";



export async function login(username, password) {
    const response = await api.post(
        "/auth/login",
        { username, password }
    );

    localStorage.setItem(
        "token",
        response.data.access_token
    );

    localStorage.setItem(
        "role",
        response.data.role
    );

    localStorage.setItem(
        "user_id",
        response.data.user_id
    );

    return response.data;
}