import { EmployeeResponseDetail } from "../../../../../models/response/EmployeeDetailResponse";
import { InfoCard } from "../../../InfoCard";
import { useMemo, useState } from "react";
import { Utils } from "../../../../../utils/utils";
import { useDownloadFileFromBDT } from "../../../../../hooks/useDownloadBdtFiles";

interface MDProps {
  details?: EmployeeResponseDetail;
}

export const PersonalDetailsTab = ({ details }: MDProps) => {
  const [showCVs, setShowCVs] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<
    string | undefined
  >();

  const { data } = useDownloadFileFromBDT({
    request: { fileUrl: details?.photoUrl },
    url: "bdt/files/document-by-url",
    onSuccess: (rs) => setPhotoBase64(rs?.fileBase64),
  });

  const { data: cvNormalData } = useDownloadFileFromBDT({
    request: { fileUrl: details?.cvNormal },
    url: "bdt/files/document-by-url",
  });

  const { data: cvFractalEspData } = useDownloadFileFromBDT({
    request: { fileUrl: details?.cvEs },
    url: "bdt/files/document-by-url",
  });

  const { data: cvFractalEngData } = useDownloadFileFromBDT({
    request: { fileUrl: details?.cvEn },
    url: "bdt/files/document-by-url",
  });

  const handleOpenCV = (
    type: "cv" | "cv-fractal-esp" | "cv-fractal-eng",
  ) => {
    let cvBase64: string | undefined;

    if (type === "cv") {
      cvBase64 = cvNormalData?.fileBase64;
    } else if (type === "cv-fractal-esp") {
      cvBase64 = cvFractalEspData?.fileBase64;
    } else if (type === "cv-fractal-eng") {
      cvBase64 = cvFractalEngData?.fileBase64;
    }

    if (cvBase64) {
    openBase64File(cvBase64, "application/pdf");
    }
  };

  const photoUrl = useMemo(() => {
    if (photoBase64) {
      return Utils.getImageSrc(photoBase64);
    }
    return "/assets/ic_phot_cv.png";
  }, [photoBase64]);

  const handleOpenPhoto = () => {
    if (photoBase64) {
      const mimeType = photoBase64.startsWith("/9j/") ? "image/jpeg" : "image/png";
      openBase64File(photoBase64, mimeType);
    }
  };

  const openBase64File = (base64: string, mimeType: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
    
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center gap-4 pb-3 border-b border-gray-200">
        <button
          onClick={handleOpenPhoto}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          title="Ver foto de perfil"
        >
          <img
            src={photoUrl}
            alt="Foto de perfil"
            className="w-28 h-28 rounded-full object-cover border-2 border-gray-300"
          />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowCVs(!showCVs)}
            className="text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1"
          >
            <span>Ver CVs</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showCVs && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 z-10 min-w-[150px]">
              {details?.cvNormal && (
                <button
                  onClick={() => handleOpenCV("cv")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  CV
                </button>
              )}
              {details?.cvEs && (
                <button
                  onClick={() => handleOpenCV("cv-fractal-esp")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  CV Fractal ESP
                </button>
              )}
              {details?.cvEn && (
                <button
                  onClick={() => handleOpenCV("cv-fractal-eng")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  CV Fractal ENG
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard
            label="Nombre completo"
            value={[
              details?.names,
              details?.lastname,
              details?.surname,
            ].join(" ")}
          />
          <InfoCard label="Correo" value={details?.email} />
          <InfoCard
            label="Documento"
            value={details?.documentNumber}
          />
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <InfoCard
              label="Descripción"
              value={details?.description}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
