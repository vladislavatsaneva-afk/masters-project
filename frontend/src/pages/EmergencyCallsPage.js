import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmergencyCalls, deleteEmergencyCall } from "../services/emergencyCallService";

import { primaryButton, dangerButton, selectStyle,
    tableStyle, tableHeaderStyle, tableCellStyle, tableRowStyle, onMouseEnter,
    cardSpacing }
        from "../styles/theme";

import StatusBadge from "../components/StatusBadge";
import PageCard from "../components/PageCard";
import StatCard from "../components/StatCard";
import PageHeader from "../components/PageHeader";
import ActionPanel from "../components/ActionPanel";
import PageLayout from "../components/PageLayout";
import { getStatusBG } from "../utils/translations";



export default function EmergencyCallsPage() {
    const [calls, setCalls] = useState([]);
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const isAdmin = role === "Admin";
    const [statusFilter, setStatusFilter] = useState("");

    const totalCalls = calls.length;

    const approvedCalls =
        calls.filter(
            c => c.processing_status === "Approved"
        ).length;

    const pendingCalls =
        calls.filter(
            c => c.processing_status === "Pending"
        ).length;

    const failedCalls =
        calls.filter(
            c => c.processing_status === "Rejected"
        ).length;

    const filteredCalls = calls.filter(call => {
        const statusMatch =
            !statusFilter ||
            call.processing_status ===
            statusFilter;

        return statusMatch;
    });

    useEffect(() => {
        async function load() {
            try {
                const data = await getEmergencyCalls();
                setCalls(data);
            } catch (err) {
                console.error(err);
            }
        }
        load();
    }, []);



    return (
    <PageLayout>
        <PageHeader
            title={`Спешни обаждания (${filteredCalls.length})`}
            subtitle="Постъпили аудио сигнали за обработка"
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
                    title="Общо обаждания"
                    value={totalCalls}
                />

                <StatCard
                    title="Одобрени"
                    value={approvedCalls}
                />

                <StatCard
                    title="Чакащи"
                    value={pendingCalls}
                />

                <StatCard
                    title="Отхвърлени"
                    value={failedCalls}
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
                value={statusFilter}
                onChange={(e) =>
                    setStatusFilter(e.target.value)
                }
            >
                <option value="">Всички статуси</option>
                <option value="Approved">{getStatusBG("Approved")}</option>
                <option value="Rejected">{getStatusBG("Rejected")}</option>
            </select>
            </div>
        </PageCard>


        <PageCard style={cardSpacing}>
            <table style={tableStyle}>
                <thead>
                    <tr style={{...tableRowStyle, ...onMouseEnter}}>
                        <th style={tableHeaderStyle}>Подател</th>
                        <th style={tableHeaderStyle}>Получен на</th>
                        <th style={tableHeaderStyle}>Резултат от чернова</th>
                        <th style={tableHeaderStyle}>Статус след обработка</th>
                        <th style={tableHeaderStyle}>Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredCalls.map(call => (
                        <tr style={{...tableRowStyle, ...onMouseEnter}}
                            key={call.id}
                            style={{
                                cursor: "pointer",
                                borderBottom: "1px solid #e5e7eb"
                            }}
                            onClick={() =>
                                navigate(`/emergency-calls/${call.id}`)
                            }
                        >

                            <td style={tableCellStyle}>
                                {call.caller_info || "Неизвестен"}</td>

                            <td style={tableCellStyle}>
                                {
                                    call.received_at
                                        ? new Date(call.received_at
                                          ).toLocaleString("bg-BG", {timeZone: "Europe/Sofia"}
                                          )
                                        : "-"
                                }
                            </td>

                            <td style={tableCellStyle}>
                                <StatusBadge status={call.status}/> </td>

                            <td style={tableCellStyle}>
                                <StatusBadge status={call.processing_status}/>
                            </td>

                        <ActionPanel>
                            <td style={tableCellStyle}>
                                <button style={primaryButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/emergency-calls/${call.id}`);
                                    }}
                                >
                                    Преглед
                                </button>

                                {isAdmin && (
                                    <button style={dangerButton}
                                        onClick={async (e) => {
                                            e.stopPropagation();

                                            if (!window.confirm("Изтриване на обаждане?")) return;
                                            try {
                                                await deleteEmergencyCall(call.id);
                                                setCalls(prev =>
                                                    prev.filter(c => c.id !== call.id)
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