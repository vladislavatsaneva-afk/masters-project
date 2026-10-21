export default function StatCard({
    title,
    value
}) {

    return (
        <div
            style={{
                background: "rgba(255,255,255,0.95)",
                border: "1px solid #e6f1fc",
                borderRadius: "12px",
                padding: "20px",
                minWidth: "220px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                transition: "0.2s",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
            }}
        >

            <h4 style={{
                margin: 0,
                color: "#4a5875",
                fontSize: "14px"
            }}>
            {title}</h4>

            <h1 style={{
                margin: 0,
                fontSize: "32px"
            }}>
            {value}</h1>

        </div>
    );
}