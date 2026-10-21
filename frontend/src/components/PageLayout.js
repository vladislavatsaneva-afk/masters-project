import { pageMaxWidth } from "../styles/theme";

export default function PageLayout({ children }) {
    return (
        <div
            style={{
                maxWidth: pageMaxWidth,
                margin: "0 auto",
                padding: "20px"
            }}
        >
            {children}
        </div>
    );
}