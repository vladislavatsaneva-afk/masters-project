import { useState } from "react";
import { uploadEmergencyCall } from "../services/emergencyCallService";
import { colors, primaryButton, cardSpacing } from "../styles/theme";
import PageCard from "../components/PageCard";
import PageHeader from "../components/PageHeader";



export default function UploadEmergencyCallPage() {
    const [file, setFile] = useState(null);
    const [callerInfo, setCallerInfo] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!file)
            return;
        try {
            setLoading(true);
            const result =
                await uploadEmergencyCall(
                    file,
                    callerInfo,
                    1
                );
            alert(
                `Черновата е създадена успешно.`
            );
        } catch (err) {
            console.error(err);
            alert("Грешка в прикачването.");
        } finally {
            setLoading(false);
        }
    };



    return (
    <>
        <PageHeader
            title="Прикачване на аудио сигнал"
            subtitle="Файлът ще бъде обработен автоматично"
        />

        <PageCard style={cardSpacing}>
            <div style={{
                display:"flex",
                flexDirection:"column",
                gap:"20px"
            }}>

                <input style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "15px",
                        width: "100%",
                        boxSizing: "border-box",
                        background: colors.primaryLight
                    }}

                    type="text"
                    placeholder="... Данни за подател ..."
                    value={callerInfo}
                    onChange={(e) =>
                        setCallerInfo(
                            e.target.value
                        )
                    }
                />

                <input style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "15px",
                        width: "100%",
                        boxSizing: "border-box",
                        background: colors.primaryLight
                    }}

                    type="file"
                    accept=".mp3,.wav,.m4a"
                    onChange={(e) =>
                        setFile(
                            e.target.files[0]
                        )
                    }
                />

                {file && (
                    <>
                        <div>📁: {file.name}</div>
                        <div>
                            Размер:
                            {(file.size / 1024 / 1024).toFixed(2)}
                            MB
                        </div>
                    </>
                )}

                <button style={primaryButton}
                    onClick={handleSubmit}
                    disabled={!file || loading}
                >
                    {loading
                        ? "Обработка..."
                        : "Прикачи"
                    }
                </button>
            </div>
        </PageCard>

    </>
    );
}