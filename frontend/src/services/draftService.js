import api from "./api";



export async function getDrafts() {
    const response =
        await api.get("/drafts/list");

    return response.data;
}


export async function getDraftById(id) {
    const response =
        await api.get(`/drafts/${id}`);

    return response.data;
}


export async function approveDraft(id) {
    const response =
        await api.post(
            `/drafts/${id}/approve`
        );

    return response.data;
}


export async function rejectDraft(
    id,
    reason
) {
    const response =
        await api.post(
            `/drafts/${id}/reject`,
            {
                rejection_reason: reason
            }
        );

    return response.data;
}


export async function deleteDraft(id) {
    return api.delete(`/drafts/${id}`);
}