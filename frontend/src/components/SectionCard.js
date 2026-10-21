import PageCard from "./PageCard";
import { sectionTitle } from "../styles/theme";

export default function SectionCard({
    title,
    children
}) {
    return (
        <PageCard>
            {title && (
                <h2 style={sectionTitle}>
                    {title}
                </h2>
            )}

            {children}
        </PageCard>
    );
}