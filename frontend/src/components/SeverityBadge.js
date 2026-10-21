import { getSeverityBG } from "../utils/translations";



export default function SeverityBadge({ severity })
{
    const styles = {
        High: {
            background: "#fce8e8",
            color: "#691313"
        },
        Medium: {
            background: "#fff9e0",
            color: "#704f0d"
        },
        Low: {
            background: "#e6fcee",
            color: "#125e2f"
        }
    };

    return (
        <span
            style={{
                ...(styles[severity] || {}),
                padding: "5px 12px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "13px"
            }}
        >
            {getSeverityBG(severity)}
        </span>
    );
}