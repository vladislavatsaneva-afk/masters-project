import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/dashboardService";
import PageCard from "../components/PageCard";
import StatCard from "../components/StatCard";
import { cardSpacing } from "../styles/theme";
import LoadingState from "../components/LoadingState";



export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const role = localStorage.getItem("role");

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getDashboardStats();
                setStats(data);
            }
            catch (err) {
                console.error(err);
            }
        }
        loadData();
    }, []);

    if (!stats) { return <LoadingState/>; }



    return (
    <div
        style={{
            position: "relative",
            minHeight: "100vh"
        }}
    >
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundImage: "url('/background.jpg')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
                opacity: 0.35,
                pointerEvents: "none",
                zIndex: -1
            }}
        />

        <div
            style={{
                position: "relative",
                zIndex: 1
            }}
        >

        <PageCard style={cardSpacing}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "20px"
                }}
            >

            {(role === "Admin" || role === "Officer") && (
                <StatCard
                    title="Активни сигнали"
                    value={stats.open_signals}
                />
            )}

            {(role === "Admin" || role === "Officer") && (
                <StatCard
                    title="Висок приоритет"
                    value={stats.high_severity}
                />
            )}

            {(role === "Admin" || role === "Dispatcher") && (
                <StatCard
                    title="Чакащи чернови"
                    value={stats.pending_drafts}
                />
            )}

            {(role === "Admin" || role === "Dispatcher") && (
                <StatCard
                    title="Обаждания днес"
                    value={stats.calls_today}
                />
            )}

            </div>
        </PageCard>

        </div>
    </div>
    );
}