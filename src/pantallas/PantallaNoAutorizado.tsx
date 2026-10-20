import { LogOut, ShieldX } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Destino del usuario con sesión iniciada que no tiene ninguna ruta de FMI
 * autorizada (PARAMETROS, maestro 49). Solo le queda cerrar sesión.
 */
const PantallaNoAutorizado = () => {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <ShieldX className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h1 className="mb-2 text-lg font-semibold text-gray-800">
          Sin acceso
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Tu usuario no tiene módulos de FMI habilitados. Si crees que es un
          error, comunícate con el administrador.
        </p>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default PantallaNoAutorizado;
