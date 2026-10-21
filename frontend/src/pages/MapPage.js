import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { ZoomControl, useMap } from "react-leaflet";
import api from "../services/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getSeverityBG, getStatusBG } from "../utils/translations";

import { primaryButton, dangerButton,
    selectStyle, inputStyle, headingStyle }
        from "../styles/theme";

import SeverityBadge from "../components/SeverityBadge";
import StatusBadge from "../components/StatusBadge";
import PageCard from "../components/PageCard";
import PageHeader from "../components/PageHeader";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DetailsGrid from "../components/DetailsGrid";
import "../styles/marker.css";



function getMarkerIcon(severity, count, isSelected = false) {
    let color = "green";
    if (severity === "High") color = "red";
    else if (severity === "Medium") color = "orange";

    let size = 25;
    if (count >= 5) size = 40;
    else if (count >= 3) size = 32;

    if (isSelected) size+= 15;

    return L.divIcon({
        html: `
        <div
            class="${ isSelected ? "pulse-marker" : "" }"
        style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            border: 2px solid white;
            cursor: pointer;
            box-shadow: ${
                isSelected
                    ? "0 0 20px #00ffff"
                    : "0 0 6px rgba(0,0,0,0.5)"
            };
        ">
            ${count}
        </div>
        `,
        className: ""
    });
}


function FlyToSignal({lat, lng}) {
    const map = useMap();

    useEffect(() => {
        if (lat && lng) {
            map.flyTo(
            [Number(lat), Number(lng)], 18, {duration: 1.5}
            );
        }
    }, [lat, lng, map]);

    return null;
}



export default function MapPage() {
    const [signals, setSignals] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [officers, setOfficers] = useState([]);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        severity: "",
        status: "",
        officer_id: "",
        date_from: "",
        date_to: ""
    });

    const [selectedSignals, setSelectedSignals] = useState([]);
    const [searchParams] = useSearchParams();
    const focusLat = searchParams.get("lat");
    const focusLng = searchParams.get("lng");
    const role = localStorage.getItem("role");
    const isAdmin = role === "Admin";

    const totalSignals =
    signals.reduce( (sum, s) => sum + s.count, 0 );

    const signalId = searchParams.get("id");
    const selectedSignalId = Number(searchParams.get("id"));

    useEffect(() => {
        fetchSignals();
    }, [filters.status, filters.officer_id, filters.severity, filters.date_from, filters.date_to]);

    useEffect(() => {
        api.get("/officers/lookup")
        .then(res => {
            setOfficers(res.data);
        })
        .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        api.get("/signals/statuses")
        .then(res => setStatuses(res.data))
        .catch(err => console.error(err));
    }, []);


    function fetchSignals() {
        const params = new URLSearchParams();
        if (role === "Officer") { params.append("visibility", "officer"); }

        if (filters.status) params.append("status", filters.status);
        if (filters.officer_id !== "") params.append("officer_id", filters.officer_id);
        if (filters.severity) params.append("severity", filters.severity);
        if (filters.date_from) params.append("date_from", filters.date_from);
        if (filters.date_to) params.append("date_to", filters.date_to);

        api.get(`/signals/map?${params.toString()}`)
        .then(res => {
            console.log("MAP DATA", res.data);
            setSignals(res.data);
        })
        .catch(err => console.error(err));
    }


    function loadDetails(signalIds) {
        const ids = signalIds.join(",");
        api.get(`/signals/details?ids=${ids}`)
        .then(res => setSelectedSignals(res.data))
        .catch(err => console.error(err));
    }

    useEffect(() => {
        if (!signalId) return;
        loadDetails([signalId]);
    }, [signalId]);



    return (
    <PageLayout>
        <PageHeader
            title="Карта на сигналите"
            subtitle="Географско разпределение на активните сигнали"
        />

        <PageCard>
            <div style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap"
            }}>
                <StatCard
                    title="Общо сигнали"
                    value={totalSignals}
                />

                <StatCard
                    title="Висок приоритет"
                    value={
                        signals.filter(s => s.severity === "High").length
                    }
                />

                <StatCard
                    title="Среден приоритет"
                    value={signals.filter(s => s.severity === "Medium").length
                    }
                />

                <StatCard
                    title="Нисък приоритет"
                    value={signals.filter(s => s.severity === "Low").length
                    }
                />
            </div>
        </PageCard>

        <PageCard>
            <h3 style={headingStyle}>Филтри</h3>

            <label>Приоритет:</label>
                <select style={selectStyle}
                    value={filters.severity}
                    onChange={(e) =>
                    setFilters({ ...filters, severity: e.target.value })
                    }
                >
                    <option value="">Всички</option>
                    <option value="High">{getSeverityBG("High")}</option>
                    <option value="Medium">{getSeverityBG("Medium")}</option>
                    <option value="Low">{getSeverityBG("Low")}</option>
                </select>


            <label>Статус:</label>
                <select style={selectStyle}
                    value={filters.status}
                    onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                    }
                >
                    <option value="">Всички</option>
                        {statuses.map((status) => (
                        <option key={status} value={status}>
                            {getStatusBG(status)}
                        </option>
                    ))}
                </select>

            {isAdmin && (
            <>
            <label>Служител:</label>
                <select style={selectStyle}
                    value={filters.officer_id}
                    onChange={(e) =>
                        setFilters({
                          ...filters,
                          officer_id: e.target.value === "" ? "" : Number(e.target.value)
                        })
                    }
                >

                    <option value="">Всички</option>
                        {officers.map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.username}
                        </option>
                    ))}
                </select>
            </>
            )}

            <label>От дата:</label>
                <input style={inputStyle}
                    type="date"
                    value={filters.date_from}
                    onChange={(e) =>
                    setFilters({ ...filters, date_from: e.target.value })
                    }
                />

            <label>До дата:</label>
                <input style={inputStyle}
                    type="date"
                    value={filters.date_to}
                    onChange={(e) =>
                    setFilters({ ...filters, date_to: e.target.value })
                    }
                />
        </PageCard>


    <div
        style={{
            display: "grid",
            gridTemplateColumns:
                selectedSignals.length > 0
                    ? "1fr 380px"
                    : "1fr",
            gap: "20px"
        }}
    >
        <MapContainer
            center={[43.85, 25.95]}
            zoom={13}
            zoomControl={false}
            style={{ height: "75vh", width: "100%" }}
        >

            <FlyToSignal
                lat={focusLat}
                lng={focusLng}
            />
            <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />

            <MarkerClusterGroup>
                {Array.isArray(signals) && signals.map((s, index) => {
                    const isSelectedMarker =
                        selectedSignalId &&
                        s.signals.some(
                            signal => signal.id === selectedSignalId
                    );
                    return (
                        <Marker
                            key={`${s.address}-${index}`}
                            position={[s.lat, s.lng]}
                            icon={getMarkerIcon(s.severity, s.count, isSelectedMarker)}
                            eventHandlers={{
                            click: () => loadDetails(s.signals.map(x => x.id))
                            }}
                            >
                            <Popup>
                                <div style={{minWidth: "300px"}}>
                                    <strong>Адрес: {s.address}</strong>
                                    <br></br>
                                    <strong>Брой сигнали: {s.count}</strong>
                                    <br></br>
                                    <strong>Приоритет:
                                        {" "}
                                        <SeverityBadge severity={s.severity}/>
                                    </strong>
                                    <br></br>
                                    <strong>Служител:
                                        {" "}
                                        {s.officer_name || "-"}
                                    </strong>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MarkerClusterGroup>
        </MapContainer>

        {selectedSignals.length > 0 && (
            <div
                style={{
                    width: "100%",
                    background: "#f8fafc",
                    color: "black",
                    overflowY: "auto",
                    padding: "15px",
                    boxShadow: "-2px 0 10px rgba(0,0,0,0.5)",
                    transition: "all 0.3s ease"
                }}
            >

                <PageCard>
                {selectedSignals.map((s) => (
                    <>
                        <h3 style={headingStyle}>Детайли</h3>
                        <DetailsGrid>
                            <strong>Приоритет: </strong>
                            <span> <SeverityBadge severity={s.severity} /> </span>

                            <strong>Статус: </strong>
                            <span> <StatusBadge status={s.status} /> </span>

                            <strong>Гражданин:</strong>
                            <span>{s.citizen_name}</span>

                            <strong>Адрес:</strong>
                            <span>{s.address}</span>

                            <strong>Обработващ служител:</strong>
                            <span>{s.officer_name || "Няма"}</span>

                            <strong>Описание:</strong>
                            <span>{s.description}</span>

                            <strong>Тип:</strong>
                            <span>{s.type}</span>

                            <strong>Дата:</strong>
                            <span>{new Date(s.created_at + "Z").toLocaleString("bg-BG", {timeZone: "Europe/Sofia"})}</span>

                            <button style={primaryButton}
                                onClick={() => navigate(`/signals/${s.id}`)} >
                                Отвори сигнал
                            </button>

                            <button style={dangerButton}
                                onClick={() => setSelectedSignals([])} >
                                Затвори
                            </button>
                        </DetailsGrid>
                    </>
                ))}
                </PageCard>
            </div>
        )}
    </div>

    </PageLayout>
    )
}