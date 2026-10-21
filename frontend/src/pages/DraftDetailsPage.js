import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDraftById, approveDraft, rejectDraft } from "../services/draftService";
import StatusBadge from "../components/StatusBadge";
import SeverityBadge from "../components/SeverityBadge";
import ConfidenceBadge from "../components/ConfidenceBadge";

import { colors, primaryButton, dangerButton, successButton, headingStyle }
        from "../styles/theme";

import PageCard from "../components/PageCard";
import PageHeader from "../components/PageHeader";
import LoadingState from "../components/LoadingState";
import ActionPanel from "../components/ActionPanel";
import DetailsGrid from "../components/DetailsGrid";
import PageLayout from "../components/PageLayout";



export default function DraftDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [draft, setDraft] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const role = localStorage.getItem("role");

    const loadDraft = async () => {
        try {
            const data = await getDraftById(id);
            setDraft(data);
        } catch (err) {
            console.error(err);
        }
    };


    const handleApprove = async () => {
        try {
            const result = await approveDraft(id);
            navigate("/drafts");
        } catch (err) {
            console.error(err);
            alert("Грешка в одобрението.");
        }
    };


    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert(
                "Моля, въведете причина за отхвърляне."
            );
            return;
        }

        try {
            await rejectDraft( id, rejectReason );
            navigate("/drafts");
        } catch (err) {
            console.error(err);
            alert(
                "Грешка в отхвърлянето."
            );
        }
    };

    useEffect(() => {
        loadDraft();
    }, [id]);

    if (!draft) return <LoadingState/>;
    const isPending = draft.status === "Pending";



    return (
    <PageLayout>
        <PageHeader
            title={`Чернова #${draft.id}`}
            subtitle={`Аудио сигнал #${draft.emergency_call_id}`}
        />

        <PageCard>
            <PageCard>
                <DetailsGrid>
                    <strong>Увереност в истинността:</strong>
                    {" "}
                    <span> <ConfidenceBadge confidence={draft.confidence} /> </span>
                    <strong>Статус:</strong>
                    {" "}
                    <span> <StatusBadge status={draft.status} /> </span>
                </DetailsGrid>
            </PageCard>

                {
                    draft.rejection_reason && (
                        <div
                            style={{
                                background: "#fee2e2",
                                border: "1px solid #fecaca",
                                borderRadius: "8px",
                                padding: "15px",
                                marginBottom: "20px"
                            }}
                        >
                            <strong>Причина за отхвърляне: </strong>
                            <span>{draft.rejection_reason}</span>
                        </div>
                    )
                }
        </PageCard>


        <PageCard>
            <h2 style={headingStyle}>Предложен сигнал</h2>
                <DetailsGrid>
                    <strong>Имена на гражданин</strong>
                    <span> {draft.suggested?.citizen_name || "-"} </span>

                    <strong>Адрес</strong>
                    <span> {draft.suggested?.address || "-"} </span>

                    <strong>Приоритет</strong>
                    <span> <SeverityBadge severity={draft.suggested?.severity} /> </span>

                    <strong>Вид нарушение</strong>
                    <span> {draft.suggested?.type_name || "-"} </span>

                    {role !== "Dispatcher" &&
                    draft.suggested.latitude !== null &&
                    draft.suggested.longitude !== null && (
                    <>
                        <strong>Координати на адреса</strong>
                        <span>
                            {draft.suggested.latitude}, {draft.suggested.longitude}
                        </span>
                    </>
                    )}


                    {role !== "Dispatcher"
                    && draft.status === "Approved" && (
                    <>
                        <span>
                            <button style={primaryButton}
                                onClick={() =>
                                    navigate(`/map?lat=${draft.suggested.latitude}&lng=${draft.suggested.longitude}`)
                                }
                            >
                                Покажи създадения сигнал на карта
                            </button>
                        </span>
                    </>
                    )}
                </DetailsGrid>
        </PageCard>


        <PageCard>
            <h2 style={headingStyle}>Обобщение</h2>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        background: colors.primaryLight,
                        padding: "15px",
                        borderRadius: "8px",
                        lineHeight: 1.6,
                    }}
                >
                    {draft.summary}
                </div>

            <h2 style={headingStyle}>Извлечени данни, необходими за одобрение</h2>
                <div
                    style={{
                        background: colors.primaryLight,
                        borderRadius: "8px",
                        padding: "15px",
                        whiteSpace: "pre-wrap",
                        fontFamily: "monospace"
                    }}
                >
                    {draft.entities || " – "}
                </div>
        </PageCard>


        <PageCard>
            <h2 style={headingStyle}>Действия</h2>
                <ActionPanel>
                    {draft.status === "Pending" ? (
                        <button
                            style={successButton}
                            onClick={handleApprove}
                        >
                            Одобри
                        </button>
                    ) : (
                        <span>
                            {draft.status === "Approved"
                                ? "✓ Одобрена"
                                : "✕ Отхвърлена"}
                        </span>
                    )}

                    {draft.status === "Pending" ? (
                        <button
                            style={dangerButton}
                            onClick={handleReject}
                        >
                            Отхвърли
                        </button>
                    ) : null}

                    <button style={primaryButton}
                        onClick={() =>
                            navigate(
                                `/emergency-calls/${draft.emergency_call_id}`
                            )
                        }
                    >
                        Отвори данни за подадения аудио сигнал
                    </button>
                </ActionPanel>

            {isPending && (
                <textarea rows={5}
                    style={{textAlign: "center",
                        padding: "10px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "15px",
                        width: "100%",
                        boxSizing: "border-box",
                        margin: "3px 3px 3px 3px",
                        background: colors.primaryLight
                    }}
                    placeholder="... Посочете причина за отхвърляне..."
                    value={rejectReason}
                    onChange={(e) =>
                        setRejectReason(e.target.value)
                    }
                />
            )}

        </PageCard>
    </PageLayout>
    );
}