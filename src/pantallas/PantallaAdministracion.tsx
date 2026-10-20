import { useState } from "react";
import { PantallaWrapper } from "./PantallaWrapper";
import { useMenu } from "../context/MenuContext";
import { AdministrationSidebar } from "../components/administracion/AdministrationSidebar";
import { AdministrationContent } from "../components/administracion/AdministrationContent";
import { ADMIN_SECTIONS } from "../components/administracion/sections";

/**
 * Workspace de Administración (SUPERADMIN). Ruta única `/administracion`: el
 * cambio entre mantenimientos es estado interno. El acceso a la ruta sale de BD
 * (claim `routes`, ver utils/navigation) y el backend valida cada operación por
 * funcionalidad (SP_VERIFY_FUNCIONALIDAD).
 */
export default function PantallaAdministracion() {
  const [activeKey, setActiveKey] = useState(ADMIN_SECTIONS[0].key);
  const { toggleMenu } = useMenu();

  return (
    <PantallaWrapper>
      <div className="flex h-screen flex-col p-6">
        <h2 className="text-2xl font-semibold mb-6 flex gap-2">
          <div
            className="space-y-1 cursor-pointer ms-1 lg:hidden self-center"
            onClick={toggleMenu}
          >
            <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
            <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
            <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
          </div>
          Administración
        </h2>

        <div className="flex-1 min-h-0 flex gap-6">
          <AdministrationSidebar activeKey={activeKey} onSelect={setActiveKey} />
          <AdministrationContent activeKey={activeKey} />
        </div>
      </div>
    </PantallaWrapper>
  );
}
