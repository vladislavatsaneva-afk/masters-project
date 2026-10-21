import api from "./api";



export async function getSignals() {
    const response =
        await api.get("/signals/list");

    return response.data;
}


export async function getSignalById(id) {
    const response =
        await api.get(`/signals/${id}`);

    return response.data;
}


export async function assignSignal(signalId) {
    const response = await api.post(
        "/signals/assign",
        {signal_id: signalId}
    );

    return response.data;
}


export async function updateSignalStatus(
    signalId,
    status
) {
    const response = await api.post(
        `/signals/status?signal_id=${signalId}`,
        {status}
    );

    return response.data;
}


export async function getSignalDocuments(
    signalId
) {
    const response =
        await api.get(
            `/signals/${signalId}/documents`
        );

    return response.data;
}


export async function uploadDocument(
    signalId,
    type,
    file
) {
    const formData = new FormData();

    formData.append(
        "signal_id",
        signalId
    );

    formData.append(
        "type",
        type
    );

    formData.append(
        "file",
        file
    );

    const response =
        await api.post(
            "/signals/document",
            formData
        );

    return response.data;
}


export async function deleteSignal(id) {
    const response = await api.delete(`/signals/${id}`);

    return response.data;
}


export async function deleteDocument(documentId) {
    const res = await api.delete(
        `/signals/documents/${documentId}`
    );

    return res.data;
}