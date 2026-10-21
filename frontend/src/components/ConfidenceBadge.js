export default function ConfidenceBadge({ confidence }) {
    const percent =
        confidence <= 1
            ? confidence * 100
            : confidence;

    const styles =
        percent >= 90
            ? {
                background: "#e3fcec",
                color: "#15522c"
            }
            : percent >= 70
            ? {
                background: "#faf3d9",
                color: "#736419"
            }
            : {
                background: "#fcebeb",
                color: "#7d2424"
            };


    return (
        <span
            style={{
                ...styles,
                padding: "4px 10px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "15px"
            }}
        >
            {Math.round(percent)}%
        </span>
    );
}