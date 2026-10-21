import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEmergencyCallById } from "../services/emergencyCallService";
import StatusBadge from "../components/StatusBadge";
import PageCard from "../components/PageCard";
import PageHeader from "../components/PageHeader";
import { colors, headingStyle, cardSpacing } from "../styles/theme";
import LoadingState from "../components/LoadingState";
import DetailsGrid from "../components/DetailsGrid";
import PageLayout from "../components/PageLayout";



export default function EmergencyCallDetailsPage() {
    const { id } = useParams();
    const [call, setCall] = useState(null);

    const loadCall = async () => {
        try {
            const data = await getEmergencyCallById(id);
            setCall(data);
        } catch (err) {
            console.error(err);
        }
    };


    useEffect(() => {
        loadCall();
    }, [id]);

    if (!call) { return <LoadingState/>; }
    const fileName = call.audio_file_path
        ? call.audio_file_path.split("/").pop()
        : null;


    return (
    <PageLayout>
        <PageHeader
            title={`Спешно обаждане #${call.id}`}
            subtitle={`Подател: ${call.caller_info || "Неизвестен"}`}
        />

        <PageCard style={cardSpacing}>
            <PageCard>
                <DetailsGrid>
                    <strong>Резултат от чернова:</strong>
                    <span> <StatusBadge status={call.status} /> </span>
                    <strong>Статус след обработка:</strong>
                    <span> <StatusBadge status={call.processing_status} /> </span>
                </DetailsGrid>
            </PageCard>

                <h2 style={headingStyle}>Транскрипция</h2>
                <div
                    style={{
                        background: colors.primaryLight,
                        fontSize: "15px",
                        padding: "24px",
                        borderRadius: "8px",
                        lineHeight: 1.8,
                        whiteSpace: "pre-wrap",
                        overflowY: "auto"
                    }}
                >
                    {
                        call.transcript ||
                        "Няма достъпна транскрипция."
                    }
                </div>
        </PageCard>


        <PageCard style={cardSpacing}>
            <h2 style={headingStyle}>Допълнителна информация</h2>

            <DetailsGrid>
                <strong>Данни за подател:</strong>
                <span> {call.caller_info || "-"} </span>

                <strong>Номер на диспечер:</strong>
                <span> {call.dispatcher_id || "-"} </span>

                <strong>Дата:</strong>
                <span> {
                    call.received_at
                        ? new Date(call.received_at
                        ).toLocaleString("bg-BG",
                            {timeZone: "Europe/Sofia"}
                        )
                        : "-"
                } </span>
            </DetailsGrid>
        </PageCard>


        <PageCard style={cardSpacing}>
            <h2 style={headingStyle}>Аудио файл</h2>
            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#fafafa"
                }}
            >
                {fileName ?? "Няма информация за файла."}
            </div>
        </PageCard>

    </PageLayout>
    );
}