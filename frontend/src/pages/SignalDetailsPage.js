import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSignalById, assignSignal, updateSignalStatus, getSignalDocuments, uploadDocument, deleteDocument } from "../services/signalService";
import StatusBadge from "../components/StatusBadge";
import SeverityBadge from "../components/SeverityBadge";
import { getStatusBG, documentTypes, getDocumentTypeBG } from "../utils/translations";

import { colors, primaryButton, dangerButton, inputStyle, selectStyle,
    headingStyle, tableStyle, tableHeaderStyle, tableCellStyle, tableRowStyle, onMouseEnter,
    cardSpacing}
        from "../styles/theme";

import PageCard from "../components/PageCard";
import PageHeader from "../components/PageHeader";
import LoadingState from "../components/LoadingState";
import ActionPanel from "../components/ActionPanel";
import DetailsGrid from "../components/DetailsGrid";
import PageLayout from "../components/PageLayout";
import Timeline from "../components/Timeline";



export default function SignalDetailsPage() {
    const { id } = useParams();
    const [signal, setSignal] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [documents, setDocuments] = useState([]);
    const [documentType, setDocumentType] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const isAdmin = role === "Admin";

    const loadSignal = async () => {
        try {
            const data = await getSignalById(id);
            setSignal(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadDocuments = async () => {
        try {
            const docs = await getSignalDocuments(id);
            setDocuments(docs);
        } catch (err) {
            console.error(err);
        }
    };

    const refreshPage = async () => {
        await loadSignal();
        await loadDocuments();
    };

    const handleAssign = async () => {
        try {
            await assignSignal(signal.id);
            await refreshPage();
        } catch (err) {
            console.error(err);
            alert(
                "Грешка с присвояването."
            );
        }
    };

    const handleStatusUpdate = async () => {
        if (!newStatus)
            return;
        try {
            await updateSignalStatus(
                signal.id,
                newStatus
            );
            await refreshPage();
        } catch (err) {
            console.error(err);
            alert(
                "Грешка с обновяването."
            );
        }
    };

    const handleUpload = async () => {
        if (!selectedFile)
            return;
        if (!documentType)
            return;
        try {
            await uploadDocument(
                signal.id,
                documentType,
                selectedFile
            );
            await refreshPage();
            setSelectedFile(null);
        } catch (err) {
            console.error(err);
            alert(
                "Грешка с прикачването."
            );
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (!window.confirm("Изтриване на документа?"))
            return;

        try {
            await deleteDocument(documentId);
            await loadDocuments();
        }
        catch (err) {
            console.error(err);
            alert("Грешка при изтриването.");
        }
    };


    useEffect(() => {
        loadSignal();
        loadDocuments();
    }, [id]);

    if (!signal) { return <LoadingState/>; }



return (
<PageLayout>
    <PageHeader
        title={`Сигнал #${signal.id}`}
        subtitle={signal.address}
    />

    <PageCard style={cardSpacing}>
        <DetailsGrid>
            <strong>Приоритет</strong>
            <span> <SeverityBadge severity={signal.severity}/> </span>
            <strong>Статус</strong>
            <span> <StatusBadge status={signal.status}/> </span>
        </DetailsGrid>
    </PageCard>

    <PageCard style={cardSpacing}>
        <h2 style={headingStyle}>Основна информация</h2>
        <DetailsGrid>
            <strong>Гражданин</strong>
            <span>{signal.citizen_name}</span>
            <strong>Адрес</strong>
            <span>{signal.address}</span>
            <strong>Тип сигнал</strong>
            <span>{signal.type_name}</span>
            <strong>Служител</strong>
            <span> {signal.officer_name || "Няма"}
            {" "}
            {isAdmin && signal.officer_id && (
                <button style={primaryButton}
                    onClick={() =>
                        navigate(`/signals?officer_id=${signal.officer_id}`)
                    }
                >
                    Провери всички сигнали за служителя
                </button>
            )} </span>
        </DetailsGrid>

    </PageCard>


    <PageCard style={cardSpacing}>
        <DetailsGrid>
            <h2 style={headingStyle}>Описание:</h2>
        </DetailsGrid>
        <div
            style={{
                background: "#f8fafc",
                fontSize: "15px",
                lineHeight: 1.8,
                padding: "20px"
            }}
        >
            {signal.description}
        </div>
    </PageCard>


    <PageCard>
        <h2 style={headingStyle}>Хронология</h2>
        <Timeline signal={signal} />
    </PageCard>


    <PageCard style={cardSpacing}>
        <h2 style={headingStyle}>Действия</h2>

        <DetailsGrid>
        <strong>Разпределение</strong>
            <span>
                {
                    signal.officer_name
                        ? (
                            <div
                                style={{
                                    background: colors.primaryLight,
                                    padding: "10px 16px",
                                    borderRadius: "8px",
                                    display: "inline-block"
                                }}
                            >
                                Разпределен на {signal.officer_name}
                            </div>
                        )
                        : (
                            <button
                                style={primaryButton}
                                onClick={handleAssign}
                            >
                                Разпредели
                            </button>
                        )
                }
            </span>
        </DetailsGrid>

        <DetailsGrid>
        <strong>Управление на статус</strong>
        <div>
            <select style={selectStyle}
                value={newStatus}
                disabled = {signal.status === "Resolved"}
                onChange={(e) =>
                    setNewStatus(e.target.value) }
            >
                <option value="">Избери статус</option>
                <option value="Assigned">{getStatusBG("Assigned")}</option>
                <option value="InProgress">{getStatusBG("InProgress")}</option>
                <option value="Resolved">{getStatusBG("Resolved")}</option>
                <option value="Rejected">{getStatusBG("Rejected")}</option>
            </select>

            <span>
                {" "}
                <button style={primaryButton}
                    disabled = {signal.status === "Resolved"}
                    onClick={handleStatusUpdate}>
                        Обнови статус
                </button>
            </span>
        </div>
        </DetailsGrid>

        <DetailsGrid>
        <strong>Навигация</strong>
        <span>
            <button style={primaryButton}
                onClick={() =>
                    navigate(
                        `/map?lat=${signal.latitude}&lng=${signal.longitude}&id=${signal.id}`
                    )
                }
            >
                Преглед на карта
            </button>
        </span>
        </DetailsGrid>
    </PageCard>



    <PageCard style={cardSpacing}>
        <h2 style={headingStyle}>Прикачи документ</h2>

        <DetailsGrid>
            <select style={selectStyle}
                value={documentType}
                onChange={(e) =>
                    setDocumentType(e.target.value) }
            >
                {documentTypes.map(type => (
                    <option key={type} value={type}>
                        {getDocumentTypeBG(type)}
                    </option>
                ))}
            </select>
        </DetailsGrid>

        <DetailsGrid>
            <input style={inputStyle}
                type="file"
                onChange={(e) =>
                    setSelectedFile(e.target.files[0]) }
            />
        </DetailsGrid>
            <button style={primaryButton}
                onClick={handleUpload}>
                    Прикачи
            </button>
    </PageCard>

    <PageCard>
        <h2 style={headingStyle}>Документи</h2>
            <table style={tableStyle}>
                <thead>
                    <tr style={{...tableRowStyle, ...onMouseEnter}}>
                        <th style={tableHeaderStyle}>Вид</th>
                        <th style={tableHeaderStyle}>Име на файл</th>
                        <th style={tableHeaderStyle}>Създаден на</th>
                        <th style={tableHeaderStyle}>Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {documents.length === 0 ? (
                        <tr style={{...tableRowStyle, ...onMouseEnter}}>
                            <td style={tableCellStyle}>Няма прикачени документи.</td> </tr>
                    ) : (
                        documents.map(doc => (
                            <tr style={{...tableRowStyle, ...onMouseEnter}}
                                key={doc.id}>
                                <td style={tableCellStyle}> {getDocumentTypeBG(doc.type)} </td>
                                <td style={tableCellStyle}> {doc.file_name} </td>
                                <td style={tableCellStyle}>
                                    {new Date(doc.created_at + "Z")
                                        .toLocaleString("bg-BG", {timeZone: "Europe/Sofia"})
                                    }
                                </td>
                                <td style={tableCellStyle}>
                                    <button
                                        style={dangerButton}
                                        onClick={() => handleDeleteDocument(doc.id)}
                                    >
                                        Изтрий
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
    </PageCard>

</PageLayout>
);
}