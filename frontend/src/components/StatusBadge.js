import { getStatusBG } from "../utils/translations";



export default function StatusBadge({
    status
}) {
    const styles = {
        Pending: {
            background: "#fff9e0",
            color: "#704f0d"
        },
        Assigned: {
            background: "#e3eefc",
            color: "#223d94"
        },
        InProgress: {
            background: "#ede9fe",
            color: "#4f1e9c"
        },
        Resolved: {
            background: "#e6fcee",
            color: "#125e2f"
        },
        Approved: {
            background: "#dbffe7",
            color: "#105429"
        },
        Rejected: {
            background: "#fce8e8",
            color: "#691313"
        },
        Completed: {
            background: "#dbffe7",
            color: "#105429"
        },
        Failed: {
            background: "#ffdbdb",
            color: "#801212"
        }
    };


    return (
        <span
            style={{
                ...(styles[status] || {}),
                padding: "5px 12px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "13px"
            }}
        >
            {getStatusBG(status)}
        </span>
    );
}