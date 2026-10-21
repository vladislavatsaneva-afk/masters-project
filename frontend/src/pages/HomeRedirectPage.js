import { Navigate } from "react-router-dom";



export default function HomeRedirectPage() {
    const role = localStorage.getItem("role");

    switch (role) {
        case "Admin":
            return <Navigate to="/dashboard" replace />;
        case "Officer":
            return <Navigate to="/dashboard" replace />;
        case "Dispatcher":
            return <Navigate to="/dashboard" replace />;
        default:
            return <Navigate to="/login" replace />;
    }
}