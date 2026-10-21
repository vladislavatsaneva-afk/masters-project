import { useEffect, useState } from "react";
import { getOfficers, createOfficer, deleteOfficer } from "../services/officerService";

import { colors, primaryButton, dangerButton, inputStyle, selectStyle,
    tableStyle, tableHeaderStyle, tableCellStyle, tableRowStyle, onMouseEnter,
    headingStyle, cardSpacing }
        from "../styles/theme";

import PageCard from "../components/PageCard";
import PageHeader from "../components/PageHeader";
import RoleBadge from "../components/RoleBadge";
import StatCard from "../components/StatCard";
import PageLayout from "../components/PageLayout";



export default function OfficersPage() {
    const [officers, setOfficers] = useState([]);
    const role = localStorage.getItem("role");
    const isAdmin = role === "Admin";
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [newRole, setNewRole] = useState("Officer");

    useEffect(() => {
        async function load() {
            try {
                const data = await getOfficers();
                setOfficers(data);
            } catch (err) {
                console.error(err);
            }
        }
        load();
    }, []);



return (
<PageLayout>
    <PageHeader
        title={`Служители (${officers.length})`}
    />

    <PageCard style={cardSpacing}>
        <div
            style={{
                display: "flex",
                gap: "16px",
                marginBottom: "20px"
            }}
        >
            <StatCard
                title="Общо служители"
                value={officers.length}
            />

            <StatCard
                title="Администратори"
                value={
                    officers.filter(
                        o => o.role === "Admin"
                    ).length
                }
            />
            <StatCard
                title="Диспечери"
                value={
                    officers.filter(
                        o => o.role === "Dispatcher"
                    ).length
                }
            />
        </div>

        <PageCard style={cardSpacing}>
            <h2 style={headingStyle}>Добавяне на служител</h2>

            {isAdmin && (
                <div
                    style={{
                        padding: "20px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr auto",
                        gap: "12px",
                        alignItems: "center"
                    }}
                >


                    <input style={inputStyle}
                        placeholder="Име"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />

                    <input style={inputStyle}
                        placeholder="Парола"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    <select style={selectStyle}
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                    >
                        <option value="Officer">Служител</option>
                        <option value="Dispatcher">Диспечер</option>
                        <option value="Admin">Администратор</option>
                    </select>

                    <button style={primaryButton}
                        onClick={async () => {
                            try {
                                await createOfficer({ username, password, role: newRole });
                                const data = await getOfficers();
                                setOfficers(data);
                                setUsername("");
                                setPassword("");
                                setNewRole("Officer");
                            } catch (err) {
                                console.error(err);
                            }
                        }}
                    >
                        Добави
                    </button>
                </div>
            )}
        </PageCard>


        <PageCard style={cardSpacing}>
            <table style={tableStyle}>
                <thead>
                    <tr style={{...tableRowStyle, ...onMouseEnter}}>
                        <th style={{tableHeaderStyle, width:"150px"}}>Име</th>
                        <th style={{tableHeaderStyle, width:"150px"}}>Роля</th>
                        <th style={{tableHeaderStyle, width:"150px"}}>Създаден на</th>
                        <th style={{tableHeaderStyle, width:"150px"}}>Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {officers.map(officer => (
                        <tr style={{...tableRowStyle, ...onMouseEnter}}
                            key={officer.id}>
                            <td style={tableCellStyle}>{officer.username}</td>
                            <td style={tableCellStyle}> <RoleBadge role={officer.role} /> </td>
                            <td style={tableCellStyle}>{new Date(officer.created_at + "Z")
                                .toLocaleString("bg-BG", {timeZone: "Europe/Sofia"})}
                            </td>

                            <td style={tableCellStyle}>
                                {isAdmin && (
                                    <button style={dangerButton}
                                        onClick={async (e) => {
                                            e.stopPropagation();

                                            if (!window.confirm("Изтриване на служител?")) return;
                                            try {
                                                await deleteOfficer(officer.id);
                                                setOfficers(prev =>
                                                    prev.filter(o => o.id !== officer.id)
                                                );
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        }}
                                    >
                                        Изтрий
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </PageCard>
    </PageCard>
</PageLayout>
);
}