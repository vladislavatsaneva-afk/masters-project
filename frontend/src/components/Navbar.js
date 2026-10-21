import { useNavigate } from "react-router-dom";
import { primaryButton } from "../styles/theme";
import RoleBadge from "../components/RoleBadge";



export default function Navbar() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user_id");
        navigate("/login");
    };


    return (
        <div
            style={{
                height: "60px",
                background: "#036aaf",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 20px",

                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                position: "sticky",
                top: 0,
                zIndex: 1000
            }}
        >
            <h2 style={{margin: 0}}>Управление на сигнали</h2>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}
            >
                <span>Вписан като:</span>
                <RoleBadge role={role} />
            </div>

            <button onClick={logout} style={primaryButton}>
                Изход
            </button>

        </div>
    );
}
