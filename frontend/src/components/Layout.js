import Navbar from "./Navbar";
import Sidebar from "./Sidebar";



export default function Layout({
    children
}) {
    return (
        <div>
            <Navbar />
            <div
                style={{
                    display: "flex",
                    minHeight: "calc(100vh - 60px)"
                }}
            >
                <Sidebar />
                <div
                    style={{
                        flex: 1,
                        padding: "24px"
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}