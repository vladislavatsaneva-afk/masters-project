import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { colors, primaryButton, inputStyle, headingStyle } from "../styles/theme";
import PageCard from "../components/PageCard";



export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        try {
            await login(username, password);
            navigate("/home")
        }
        catch (err) {
            alert("Невалидни данни");
            console.error(err);
        }
    }


    return (
    <>
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: colors.primaryLight
            }}
        >

        <PageCard style={{width: "400px", maxWidth: "90%"}}>
            <h1 style={headingStyle}>🛡️ Управление на сигнали 🛡️</h1>
            <p style={{textAlign:"center"}}>Система за обработка на сигнали град Русе</p>

            <h1 style={headingStyle}>Вход в профил</h1>
            <form onSubmit={handleLogin}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                }}
            >

                <div>
                    <input style={{
                        textAlign: "center",
                        padding: "10px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "15px",
                        width: "100%",
                        boxSizing: "border-box",
                        margin: "3px 3px 3px 3px",
                        background: colors.primaryLight
                    }}
                        type="text"
                        placeholder="Потребител"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                    />
                </div>

                <div>
                    <input style={{
                        textAlign: "center",
                        padding: "10px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "15px",
                        width: "100%",
                        boxSizing: "border-box",
                        margin: "3px 3px 3px 3px",
                        background: colors.primaryLight
                    }}
                        type="password"
                        placeholder="Парола"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />
                </div>

                <button type="submit" style={primaryButton}> Вход </button>
            </form>
        </PageCard>
    </div>

    </>
    );
}