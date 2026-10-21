export const roleBG = {
    Admin: "Администратор",
    Officer: "Служител",
    Dispatcher: "Диспечер"
};

export const severityBG = {
    High: "Висок",
    Medium: "Среден",
    Low: "Нисък"
};

export const statusBG = {
    Pending: "Чакащ",
    Assigned: "Разпределен",
    InProgress: "В процес",
    Resolved: "Приключен",
    Approved: "Одобрен",
    Rejected: "Отхвърлен",
    Completed: "Завършен",
    Failed: "Грешка"
};

export const documentTypes = [
    "IncidentReport",
    "WitnessStatement",
    "PhotoEvidence",
    "VideoEvidence",
    "Citation",
    "ResolutionReport",
    "EvidenceAttachment"
];
export const documentTypeBG = {
    IncidentReport: "Доклад за инцидент",
    WitnessStatement: "Свидетелски показания",
    PhotoEvidence: "Фото доказателство",
    VideoEvidence: "Видео доказателство",
    Citation: "Цитат",
    ResolutionReport: "Доклад за приключване",
    EvidenceAttachment: "Приложно доказателство"
};



export function getRoleBG(value) {
    return roleBG[value] || value;
}

export function getStatusBG(status) {
    return statusBG[status] || status;
}

export function getSeverityBG(severity) {
    return severityBG[severity] || severity;
}

export function getDocumentTypeBG(type) {
    return documentTypeBG[type] || type;
}
