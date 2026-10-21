import { getRoleBG } from "../utils/translations";



export default function RoleBadge({ role }) {
    const styles = {
        Admin: {
            background: "#fce6e6",
            color: "#5e2d2d"
        },
        Officer: {
            background: "#e6f0ff",
            color: "#1c2c61"
        },
        Dispatcher: {
            background: "#fbe3fc",
            color: "#5b1c5e"
        }
    };


    return (
        <span
            style={{
                ...(styles[role] || {}),
                padding: "5px 12px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "13px"
            }}
        >
            {getRoleBG(role)}
        </span>
    );
}