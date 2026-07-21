import { FolderOpen } from "lucide-react";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import useDownloadPdf from "../../../../../hooks/useDownloadPdf";
import { ReqTalento } from "../../../../../models/type/ReqTalento";
import { ESTADO_ATENDIDO } from "../../../../../utils";
import { Loading } from "../../../Loading";
import { ModalPostulantFiles } from "../../ModalPostulantFiles";

const notifyWarning = (message: string) =>
  enqueueSnackbar({ message, variant: "warning" });

interface TabProps {
  rqId: number;
  /** Cliente del RQ: los tipos de documento del postulante son por cliente. */
  idCliente: number;
  rqState: number;
  talents: ReqTalento[];
  handleAssign: (reqId: number) => void;
}

export const TabPostulant = ({
  rqId,
  idCliente,
  rqState,
  talents,
  handleAssign,
}: TabProps) => {
  /** Fetch CV for Talent */
  const { fetchAndOpenPdf, loading: downloadPdfLoading } =
    useDownloadPdf();

  // Postulante cuyo modal de archivos está abierto (null = cerrado).
  const [filesFor, setFilesFor] = useState<ReqTalento | null>(null);

  const handleDownloadCV = (talentIndex: number) => {
    // "/bdt/talent/file?fileId=${data}"
    const idCv = talents[talentIndex].idCvFile;
    const url = `bdt/talent/file?fileId=${idCv}`;
    if (url) {
      fetchAndOpenPdf(url);
    }
  };

  /**Handle Download CVs Fractal */
  const handleDownloadCVLang = (
    talentIndex: number,
    lang: "ES" | "EN"
  ) => {
    if (!talents[talentIndex]) {
      notifyWarning("No se encontró el talento seleccionado");
      return;
    }

    const talent = talents[talentIndex];
    const fileId = lang === "ES" ? talent.idCVEs : talent.idCVEn;

    if (fileId && fileId !== 0) {
      fetchAndOpenPdf(`bdt/talent/file?fileId=${fileId}`);
    } else {
      notifyWarning(
        `El talento no tiene CV Fractal en ${
          lang === "ES" ? "Español" : "Inglés"
        }`
      );
    }
  };

  return (
    <>
      {downloadPdfLoading && <Loading overlayMode />}

      <div className="flex flex-col h-[calc(570px-120px)]">
        <div className="text-end flex-shrink-0">
          {rqState !== ESTADO_ATENDIDO && (
            <button
              type="button"
              className="focus:outline-none text-sm rounded-lg py-1 px-2 mx-1 my-2 btn-blue cursor-pointer"
              onClick={() => handleAssign(rqId)}
            >
              Asignar
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto custom-scroll min-h-0">
          <table className="table w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="table-header">
                <th
                  scope="col"
                  className="table-header-cell text-center"
                >
                  CV
                </th>
                <th scope="col" className="table-header-cell">
                  Nombres y apellidos
                </th>
                <th scope="col" className="table-header-cell">
                  Doc. Identidad
                </th>
                <th scope="col" className="table-header-cell">
                  Celular
                </th>
                <th scope="col" className="table-header-cell">
                  Correo
                </th>
                <th scope="col" className="table-header-cell">
                  Situación
                </th>
                <th scope="col" className="table-header-cell">
                  Estado
                </th>
                <th scope="col" className="table-header-cell">
                  Perfil
                </th>
                <th scope="col" className="table-header-cell">
                  Archivos
                </th>
              </tr>
            </thead>
            <tbody>
              {talents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-empty">
                    No hay postulantes disponibles.
                  </td>
                </tr>
              ) : (
                talents.map((t, index) => (
                  <tr key={index} className="table-row">
                    <td className="text-center">
                      <div className="flex gap-3 items-center justify-center">
                        <button
                          type="button"
                          title="CV Español"
                          onClick={() =>
                            handleDownloadCVLang(index, "ES")
                          }
                        >
                          <img
                            src="/assets/ic_flag_es.png"
                            alt="icon eye"
                            className="w-5 h-5"
                          />
                        </button>
                        <button
                          type="button"
                          title="CV Inglés"
                          onClick={() =>
                            handleDownloadCVLang(index, "EN")
                          }
                        >
                          <img
                            src="/assets/ic_flag_usa.png"
                            alt="icon eye"
                            className="w-5 h-5"
                          />
                        </button>
                        <button
                          type="button"
                          className="hover:shadow-lg hover:rounded-full hover:bg-gray-100"
                          title="CV propio"
                          onClick={() => handleDownloadCV(index)}
                        >
                          <img
                            src="/assets/ic_resume.png"
                            alt="icon eye"
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                    </td>
                    <td className="table-cell">
                      {t.nombresTalento} {t.apellidosTalento}
                    </td>
                    <td className="table-cell">{t.dni}</td>
                    <td className="table-cell">{t.celular}</td>
                    <td className="table-cell">{t.email}</td>
                    <td className="table-cell">{t.situacion}</td>
                    <td className="table-cell">
                      <span
                        className={`badge ${
                          t.estado?.toUpperCase() ===
                          "DATOS COMPLETOS"
                            ? "badge-green"
                            : t.estado?.toUpperCase() === "OBSERVADO"
                            ? "badge-yellow"
                            : ""
                        }`}
                      >
                        {(
                          t.estado ||
                          (t.idEstado === 1
                            ? "DATOS COMPLETOS"
                            : "OBSERVADO")
                        ).toUpperCase()}
                      </span>
                    </td>
                    <td className="table-cell">{t.perfil}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        title="Ver archivos del postulante"
                        className="p-1 hover:rounded-full hover:bg-gray-100 hover:shadow-lg"
                        onClick={() => setFilesFor(t)}
                      >
                        <FolderOpen className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filesFor && (
        <ModalPostulantFiles
          rqId={rqId}
          idCliente={idCliente}
          postulant={filesFor}
          onClose={() => setFilesFor(null)}
        />
      )}
    </>
  );
};
