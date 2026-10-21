import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MapPage from "./pages/MapPage";
import SignalsPage from "./pages/SignalsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SignalDetailsPage from "./pages/SignalDetailsPage";
import DraftsPage from "./pages/DraftsPage";
import DraftDetailsPage from "./pages/DraftDetailsPage";
import EmergencyCallsPage from "./pages/EmergencyCallsPage";
import EmergencyCallDetailsPage from "./pages/EmergencyCallDetailsPage";
import OfficersPage from "./pages/OfficersPage";
import UploadEmergencyCallPage from "./pages/UploadEmergencyCallPage";
import HomeRedirectPage from "./pages/HomeRedirectPage";


function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/home"
                    element={<HomeRedirectPage />}
                />

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute roles={["Admin", "Officer", "Dispatcher"]}>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/map"
                    element={
                        <ProtectedRoute roles={["Admin", "Officer"]} >
                            <MapPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/signals"
                    element={
                        <ProtectedRoute roles={["Admin", "Officer"]} >
                            <SignalsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/signals/:id"
                    element={
                        <ProtectedRoute roles={["Admin", "Officer"]} >
                            <SignalDetailsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/drafts"
                    element={
                        <ProtectedRoute roles={["Admin", "Dispatcher"]} >
                            <DraftsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/drafts/:id"
                    element={
                        <ProtectedRoute roles={["Admin", "Dispatcher"]} >
                            <DraftDetailsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/emergency-calls"
                    element={
                        <ProtectedRoute roles={["Admin", "Dispatcher"]} >
                            <EmergencyCallsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/emergency-calls/:id"
                    element={
                        <ProtectedRoute roles={["Admin", "Dispatcher"]} >
                            <EmergencyCallDetailsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/officers"
                    element={
                        <ProtectedRoute roles={["Admin"]} >
                            <OfficersPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/emergency-calls/upload"
                    element={
                        <ProtectedRoute roles={["Admin", "Dispatcher"]} >
                            <UploadEmergencyCallPage />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;