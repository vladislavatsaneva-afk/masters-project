import { Navigate } from "react-router-dom";
import Layout from "./Layout";



export default function ProtectedRoute({
    children,
    roles = []
}) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" />;
    }
    if (
        roles.length > 0 &&
        !roles.includes(role)
    ) {
        return <Navigate to="/home" replace />;
    }


    return (
        <Layout>{children}</Layout>
    );
}