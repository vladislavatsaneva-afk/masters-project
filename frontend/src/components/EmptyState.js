export default function EmptyState({
    title,
    subtitle
}) {
    return (
        <div
            style={{
                textAlign: "center",
                padding: "30px",
                color: "#6b7280"
            }}
        >
            <h3>{title}</h3>

            {subtitle && (
                <p>{subtitle}</p>
            )}
        </div>
    );
}