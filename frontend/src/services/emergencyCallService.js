import api from "./api";



export async function getEmergencyCalls() {
    const response =
        await api.get(
            "/emergency-calls/list"
        );

    return response.data;
}


export async function getEmergencyCallById(id) {
    const response =
        await api.get(
            `/emergency-calls/${id}`
        );

    return response.data;
}


export async function uploadEmergencyCall(
    file,
    callerInfo,
    dispatcherId
) {
    const formData = new FormData();

    formData.append("audio", file);
    formData.append(
        "caller_info",
        callerInfo
    );
    formData.append(
        "dispatcher_id",
        dispatcherId
    );

    const response =
        await api.post(
            "/emergency-calls/upload",
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data"
                }
            }
        );

    return response.data;
}


export async function deleteEmergencyCall(id) {
    return api.delete(`/emergency-calls/${id}`);
}
