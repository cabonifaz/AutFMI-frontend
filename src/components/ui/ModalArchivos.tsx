import { useParams } from "../../context/ParamsContext";
import useDownloadPdf from "../../hooks/useDownloadPdf";
import { TalentoType } from "../../models/type/TalentoType";
import { Tabs } from "./Tabs";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    talento?: TalentoType | null;
}

export const ModalArchivos = ({ isOpen, onClose, talento }: Props) => {
    const { paramsByMaestro, loading: paramLoading } = useParams(`9`);
    const { fetchAndOpenPdf, loading: downloadPdfLoading } = useDownloadPdf();

    const tipoHistorial = paramsByMaestro[9];
    const historialurl = '/fmi/employee/lastHistory';
    const solicitudEquipoUrl = '/fmi/employee/lastSolicitudEquipo';

    const handleHistorialClick = (idTipoHistorial: number) => {
        if (talento) {
            fetchAndOpenPdf(`${historialurl}?idTipoHistorial=${idTipoHistorial}&idTalento=${talento.idTalento}`);
        }
    }

    const handleSolicitudEquipoClick = () => {
        if (talento) {
            fetchAndOpenPdf(`${solicitudEquipoUrl}?idSolicitudEquipo=${talento.idEquipoSolicitud}`)
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
            <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[90%] lg:w-[400px] min-h-[270px] overflow-y-auto relative">
                <h2 className="text-lg font-bold mb-2">Documentos</h2>
                <button type="button" onClick={onClose} className="absolute top-4 right-4 focus:outline-none">
                    <img src="/assets/ic_close_x_fmi.svg" alt="icon close" className="w-6 h-6" />
                </button>
                <Tabs
                    isDataLoading={paramLoading || downloadPdfLoading}
                    initialTab={0}
                    tabs={[
                        {
                            label: "General",
                            children: (
                                <div className="flex flex-col gap-2 p-2">
                                    {tipoHistorial?.map((item, index) => (
                                        <button
                                            type="button"
                                            key={index}
                                            onClick={handleHistorialClick.bind(null, item.num1)}
                                            className="p-2 border rounded-lg hover:bg-slate-50 flex items-center justify-between">
                                            {item.string1}
                                            <img src="/assets/open_pdf.svg" className="w-8 h-8" alt="pdf file" />
                                        </button>
                                    ))}
                                </div>
                            )
                        },
                        {
                            label: "Solicitudes",
                            children: (
                                <div className="flex flex-col gap-2 p-2">
                                    <button
                                        type="button"
                                        onClick={handleSolicitudEquipoClick}
                                        className="p-2 border rounded-lg hover:bg-slate-50 flex items-center justify-between">
                                        Solicitud de equipo
                                        <img src="/assets/open_pdf.svg" className="w-8 h-8" alt="pdf file" />
                                    </button>
                                </div>
                            )
                        }
                    ]}
                />
            </div>
        </div>
    );
}