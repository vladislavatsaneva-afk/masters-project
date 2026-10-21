import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDrafts, deleteDraft } from "../services/draftService";
import StatusBadge from "../components/StatusBadge";
import SeverityBadge from "../components/SeverityBadge";
import ConfidenceBadge from "../components/ConfidenceBadge";
import { getStatusBG, getSeverityBG } from "../utils/translations";

import { primaryButton, dangerButton, selectStyle,
    tableStyle, tableRowStyle, onMouseEnter, tableCellStyle,
    cardSpacing }
        from "../styles/theme";

import PageCard from "../components/PageCard";
import StatCard from "../components/StatCard";
import PageHeader from "../components/PageHeader";
import ActionPanel from "../components/ActionPanel";
import PageLayout from "../components/PageLayout";



export default function DraftsPage() {
    const [drafts, setDrafts] = useState([]);
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState("");
    const [severityFilter, setSeverityFilter] = useState("");
    const role = localStorage.getItem("role");
    const isAdmin = role === "Admin";

    const filteredDrafts = drafts.filter(draft => {
        const statusMatch =
            !statusFilter ||
            draft.status ===
            statusFilter;

        const severityMatch =
            !severityFilter ||
            draft.severity ===
            severityFilter;

        return (
            statusMatch && severityMatch
        );
    });

    const totalDrafts = drafts.length;
    const pendingDrafts =
        drafts.filter(
            d => d.status === "Pending"
        ).length;
    const approvedDrafts =
        drafts.filter(
            d => d.status === "Approved"
        ).length;
    const rejectedDrafts =
        drafts.filter(
            d => d.status === "Rejected"
        ).length;


    useEffect(() => {
        async function load() {
            try {
                const data = await getDrafts();
                setDrafts(data);
            } catch (err) {
                console.error(err);
            }
        }
        load();
    }, []);



    return (
    <PageLayout>
        <PageHeader
            title={`Чернови (${filteredDrafts.length})`}
            subtitle="Чернови, генерирани автоматично от аудио сигнали"
        />

        <PageCard style={cardSpacing}>
            <div
                style={{
                    display: "flex",
                    gap: "15px",
                    marginBottom: "20px",
                    flexWrap: "wrap"
                }}
            >
                <StatCard
                    title="Общо чернови"
                    value={totalDrafts}
                />
                <StatCard
                    title="Чакащи"
                    value={pendingDrafts}
                />
                <StatCard
                    title="Одобрени"
                    value={approvedDrafts}
                />
                <StatCard
                    title="Отхвърлени"
                    value={rejectedDrafts}
                />
            </div>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "20px",
                        flexWrap: "wrap"
                    }}
                >

                    <select style={selectStyle}
                        value={severityFilter}
                        onChange={(e) =>
                            setSeverityFilter(e.target.value)
                        }
                    >
                        <option value="">Всички приоритети</option>
                        <option value="High">{getSeverityBG("High")}</option>
                        <option value="Medium">{getSeverityBG("Medium")}</option>
                        <option value="Low">{getSeverityBG("Low")}</option>
                    </select>

                    <select style={selectStyle}
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                    >
                        <option value="">Всички статуси</option>
                        <option value="Pending">{getStatusBG("Pending")}</option>
                        <option value="Approved">{getStatusBG("Approved")}</option>
                        <option value="Rejected">{getStatusBG("Rejected")}</option>
                    </select>
                </div>
        </PageCard>


        <PageCard style={cardSpacing}>
            <table style={tableStyle}>
                <thead>
                    <tr style={{...tableRowStyle, ...onMouseEnter}}>
                        <th style={tableCellStyle}>
                            Увереност</th>
                        <th style={tableCellStyle}>
                            Адрес</th>
                        <th style={tableCellStyle}>
                            Приоритет</th>
                        <th style={tableCellStyle}>
                            Статус</th>
                        <th style={tableCellStyle}>
                            Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredDrafts.map(draft => (
                        <tr style={{...tableRowStyle, ...onMouseEnter}}
                            key={draft.id}
                            onClick={() =>
                                navigate(`/drafts/${draft.id}`)
                            }
                            style={{cursor: "pointer", borderBottom: "1px solid #e5e7eb"}}
                        >

                            <td style={tableCellStyle}> <ConfidenceBadge confidence={draft.confidence}/> </td>
                            <td style={tableCellStyle}> {draft.address} </td>
                            <td style={tableCellStyle}> <SeverityBadge severity={draft.severity}/> </td>
                            <td style={tableCellStyle}> <StatusBadge status={draft.status}/> </td>

                        <ActionPanel>
                            <td style={tableCellStyle}>
                                <button style={primaryButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/drafts/${draft.id}`);
                                    }}
                                >
                                    Преглед на чернова
                                </button>


                                {isAdmin && (
                                    <button style={dangerButton}
                                        onClick={async (e) => {
                                            e.stopPropagation();

                                            if (!window.confirm("Изтриване на черновата?")) return;
                                            try {
                                                await deleteDraft(draft.id);
                                                setDrafts(prev =>
                                                    prev.filter(d => d.id !== draft.id)
                                                );
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        }}
                                    >
                                        Изтрий
                                    </button>
                                )}
                            </td>
                        </ActionPanel>
                        </tr>
                    ))}
                </tbody>
            </table>
        </PageCard>
    </PageLayout>
    );
}