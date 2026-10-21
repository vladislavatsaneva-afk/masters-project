export default function PageCard({
    children
}) {
    return (
        <div
            style={{
                background: "rgba(255,255,255,0.5)",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}
        >
            {children}
        </div>
    );
}