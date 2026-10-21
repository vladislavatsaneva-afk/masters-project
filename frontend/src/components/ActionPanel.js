export default function ActionPanel({
    children
}) {
    return (
        <div
            style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                alignItems: "center"
            }}
        >
            {children}
        </div>
    );
}