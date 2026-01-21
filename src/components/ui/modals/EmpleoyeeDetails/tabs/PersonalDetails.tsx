import { EmployeeResponseDetail } from "../../../../../models/response/EmployeeDetailResponse";
import { InfoCard } from "../../../InfoCard";
import { useState } from "react";
import { Utils } from "../../../../../utils/utils"; 

interface MDProps {
  details?: EmployeeResponseDetail;
}

export const PersonalDetailsTab = ({ details }: MDProps) => {
  const [showCVs, setShowCVs] = useState(false);

  const handleOpenCV = (type: 'cv' | 'cv-fractal-esp' | 'cv-fractal-eng') => {
    console.log(`Abrir CV tipo: ${type}`);
  };

   const handleOpenPhoto = () => {
    if (details?.photoB64 && details.photoB64.trim() !== "") {
      const photoUrl = Utils.getImageSrc(details.photoB64); 
      window.open(photoUrl, '_blank');
    }
  };

  // Generar URL de la imagen desde Base64
  const getPhotoUrl = () => {
    if (details?.photoB64 && details.photoB64.trim() !== "") {
      return Utils.getImageSrc(details.photoB64);  
    }
    return "/assets/ic_phot_cv.png"; // Imagen por defecto
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
            src={getPhotoUrl()}
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCVs && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 z-10 min-w-[150px]">
              <button
                onClick={() => handleOpenCV('cv')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                CV
              </button>
              <button
                onClick={() => handleOpenCV('cv-fractal-esp')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                CV Fractal ESP
              </button>
              <button
                onClick={() => handleOpenCV('cv-fractal-eng')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                CV Fractal ENG
              </button>
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
          <InfoCard label="Documento" value={details?.documentNumber} />
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <InfoCard label="Descripción" value={details?.description} />
          </div>
        </div>
      </div>
    </div>
  );
};