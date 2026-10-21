import { getSignalById } from "../services/signalService";



export default function Timeline({
    signal
}) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px"
            }}
        >
            <div>
                ● <b> Създаден на: </b> {" "}
                { new Date(signal.created_at + "Z")
                    .toLocaleString("bg-BG", {timeZone: "Europe/Sofia"})
                }
            </div>

            <div>
                ● <b> Разпределен на: </b> {" "}
                {signal.officer_name || "–"}
            </div>


            <div>
                ● <b> Обновен на: </b> {" "}
                { signal.updated_at
                    ? new Date(signal.updated_at + "Z")
                        .toLocaleString("bg-BG", {timeZone: "Europe/Sofia"})
                    : "-"
                }
            </div>

            <div>
                ● <b> Приключен на: </b> {" "}
                { signal.resolved_at
                    ? new Date(signal.resolved_at + "Z")
                        .toLocaleString("bg-BG", {timeZone: "Europe/Sofia"})
                    : "-"
                }
            </div>
        </div>
    );
}