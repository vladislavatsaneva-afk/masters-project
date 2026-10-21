import api from "./api";



export async function getOfficers() {
    const response =
        await api.get("/officers");

    return response.data;
}


export async function createOfficer(payload) {
    return api.post("/officers", payload);
}


export async function deleteOfficer(id) {
    return api.delete(`/officers/${id}`);
}

