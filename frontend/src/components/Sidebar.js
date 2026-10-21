import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";



export default function Sidebar() {
    const role = localStorage.getItem("role");

    return (
        <div
            style={{
                width: "250px",
                background: "#c2dcff",
                minHeight: "100vh",
                padding: "20px"
            }}
        >

            <h1>Навигация</h1>
            <ul
                style={{
                    listStyle: "none",
                    padding: 0
                }}

            >

                {(role === "Admin" || role === "Officer" || role === "Dispatcher") && (
                    <li>
                        <NavLink to="/dashboard"
                        className={ ({isActive}) =>
                            isActive ? "sidebar-link active-link" : "sidebar-link" }>
                            Информационно табло
                        </NavLink>
                    </li>
                )}

                {(role === "Admin" || role === "Officer") && (
                    <>
                        <li>
                            <NavLink to="/map"
                            className={ ({isActive}) =>
                                isActive ? "sidebar-link active-link" : "sidebar-link" }>
                                Карта
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/signals"
                            className={ ({isActive}) =>
                                isActive ? "sidebar-link active-link" : "sidebar-link" }>
                                Сигнали
                            </NavLink>
                        </li>
                    </>
                )}

                {(role === "Admin" || role === "Dispatcher") && (
                    <>
                        <li>
                            <NavLink to="/drafts"
                            className={ ({isActive}) =>
                                isActive ? "sidebar-link active-link" : "sidebar-link" }>
                                Чернови на сигнали
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/emergency-calls" end
                            className={ ({isActive}) =>
                                isActive ? "sidebar-link active-link" : "sidebar-link" }>
                                Спешни обаждания
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/emergency-calls/upload"
                            className={ ({isActive}) =>
                                isActive ? "sidebar-link active-link" : "sidebar-link" }>
                                Добави аудио сигнал
                            </NavLink>
                        </li>
                    </>
                )}

                {role === "Admin" && (
                    <li>
                        <NavLink to="/officers"
                        className={ ({isActive}) =>
                            isActive ? "sidebar-link active-link" : "sidebar-link" }>
                            Служители
                        </NavLink>
                    </li>
                )}
            </ul>

        </div>
    );
}