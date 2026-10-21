import { useEffect, useState } from "react";
import { getSignals, deleteSignal } from "../services/signalService";
import { useNavigate, useSearchParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import SeverityBadge from "../components/SeverityBadge";
import { getStatusBG, getSeverityBG } from "../utils/translations";

import { primaryButton, dangerButton, selectStyle,
    tableStyle, tableHeaderStyle, tableCellStyle, tableRowStyle, onMouseEnter,
    cardSpacing, filterContainer }
        from "../styles/theme";

import PageCard from "../components/PageCard";
import StatCard from "../components/StatCard";
import PageHeader from "../components/PageHeader";
import ActionPanel from "../components/ActionPanel";
import PageLayout from "../components/PageLayout";



export default function SignalsPage() {
    const [signals, setSignals] = useState([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const officerFilter = searchParams.get("officer_id");
    const [statusFilter, setStatusFilter] = useState("");
    const [severityFilter, setSeverityFilter] = useState("");
    const role = localStorage.getItem("role");
    const isAdmin = role === "Admin";

    const filteredSignals = signals.filter(signal => {
        const statusMatch =
            !statusFilter ||
            signal.status === statusFilter;

        const severityMatch =
            !severityFilter ||
            signal.severity === severityFilter;

        const officerMatch =
            !officerFilter ||
            signal.officer_id === Number(officerFilter);

        return (
            statusMatch && severityMatch &&
            officerMatch
        );
    });

    const totalSignals = signals.length;
    const highSignals =
        signals.filter(
            s => s.severity === "High"
        ).length;
    const assignedSignals =
        signals.filter(
            s => s.officer_name
        ).length;
    const resolvedSignals =
        signals.filter(
            s => s.status === "Resolved"
        ).length;


    useEffect(() => {
        async function load() {
            try {
                const data = await getSignals();
                console.log(data);
                setSignals(data);
            }
            catch (err) {
                console.error(err);
            }
        }
        load();
    }, []);



    return (
    <PageLayout>
        <PageHeader
            title={`Сигнали (${filteredSignals.length})`}
            subtitle="Постъпили сигнали"
        />

        <PageCard style={cardSpacing}>
            {filteredSignals.length === 0 && (
            <>
                <p>🔍 Не са намерени сигнали 🔍</p>
                <p>Променете критериите за филтриране.</p>
            </>
            )}

        <div
                style={{
                    display: "flex",
                    gap: "15px",
                    marginBottom: "20px",
                    flexWrap: "wrap"
                }}
        >
            <StatCard
                title="Общо сигнали"
                value={totalSignals}
            />
            <StatCard
                title="Висок приоритет"
                value={highSignals}
            />
            <StatCard
                title="Разпределени"
                value={assignedSignals}
            />
            <StatCard
                title="Приключени"
                value={resolvedSignals}
            />
        </div>

            <div style={filterContainer}>
                <select style={selectStyle}
                    value={severityFilter}
                    onChange={(e) =>
                        setSeverityFilter(
                            e.target.value
                        )
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
                        setStatusFilter(
                            e.target.value
                        )
                    }
                >
                    <option value="">Всички статуси</option>
                    <option value="Pending">{getStatusBG("Pending")}</option>
                    <option value="Assigned">{getStatusBG("Assigned")}</option>
                    <option value="InProgress">{getStatusBG("InProgress")}</option>
                    <option value="Resolved">{getStatusBG("Resolved")}</option>
                </select>
            </div>
        </PageCard>


        <PageCard style={cardSpacing}>
            <table style={tableStyle}>
                <thead>
                    <tr style={{...tableRowStyle, ...onMouseEnter}}>
                        <th style={tableHeaderStyle}>Адрес</th>
                        <th style={tableHeaderStyle}>Приоритет</th>
                        <th style={tableHeaderStyle}>Статус</th>
                        <th style={tableHeaderStyle}>Обработващ служител</th>
                        <th style={tableHeaderStyle}>Дата</th>
                        <th style={tableHeaderStyle}>Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredSignals.map(signal => (
                    <tr style={{...tableRowStyle, ...onMouseEnter}}
                        key={signal.id} onClick={() =>
                            navigate(`/signals/${signal.id}`)
                        }
                    >

                        <td style={tableCellStyle}>{signal.address}</td>
                        <td style={tableCellStyle}>
                            <SeverityBadge severity={signal.severity}/> </td>
                        <td style={tableCellStyle}> <StatusBadge status={signal.status}/> </td>
                        <td style={tableCellStyle}>{signal.officer_name || "-"}</td>

                        <td style={tableCellStyle}>
                            {new Date(
                                signal.created_at
                            ).toLocaleString()}
                        </td>

                    <ActionPanel>
                        <td style={tableCellStyle}>
                            <button style={primaryButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/signals/${signal.id}`);
                                }}
                            >
                                Преглед
                            </button>

                            {isAdmin && (
                                <button style={dangerButton}
                                    onClick={async (e) => {
                                        e.stopPropagation();

                                        if (!window.confirm("Изтриване на сигнал?")) return;
                                        try {
                                            await deleteSignal(signal.id);
                                            setSignals(prev =>
                                                prev.filter(s => s.id !== signal.id)
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