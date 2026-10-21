export default function PageHeader({
    title,
    subtitle
}) {
    return (
        <div style={{ marginBottom: "24px" }}>
            <h1>{title}</h1>
            {subtitle && (
                <p>{subtitle}</p>
            )}
        </div>
    );
}