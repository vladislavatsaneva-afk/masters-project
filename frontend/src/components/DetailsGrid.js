import { detailsGrid } from "../styles/theme";

export default function DetailsGrid({
    children
}) {
    return (
        <div style={detailsGrid}>
            {children}
        </div>
    );
}