import { ClipboardList, FileUp, Home, Inbox, LucideIcon, Settings } from "lucide-react";
import { Utils } from "./utils";
import { ROL_SUPERADMIN } from "./config";


export interface NavModule {
  key: string;
  icon: LucideIcon;
  label: string;
  path: string;
}

export const NAV_MODULES: NavModule[] = [
  { key: "inicio", icon: Home, label: "Inicio", path: "/listaTalentos" },
  { key: "requerimientos", icon: ClipboardList, label: "Requerimientos", path: "/requerimientos" },
  { key: "bandeja-aprobaciones", icon: Inbox, label: "Aprobaciones", path: "/bandejaAprobaciones" },
  { key: "cargar-fmi", icon: FileUp, label: "Cargar FMI", path: "/cargarFMI" },
  { key: "administracion", icon: Settings, label: "Administración", path: "/administracion" },
];


export const RUTA_BANDEJA_APROBACIONES = "/bandejaAprobaciones";

/** Sin ninguna ruta autorizada. Siempre accesible con sesión iniciada. */
export const RUTA_SIN_ACCESO = "/no-autorizado";


const AUX_ROUTE_OWNERS: { prefix: string; owners: string[] }[] = [
  { prefix: "/tableAsignarTalento", owners: ["/requerimientos"] },
  // Vuelta a la lista desde Cese/Movimiento/Solicitud de equipo (reabre el detalle).
  { prefix: "/pantalla-lista-talentos", owners: ["/listaTalentos"] },
];

const matches = (pathname: string, route: string): boolean =>
  pathname === route || pathname.startsWith(`${route}/`);


export const isRouteAllowed = (pathname: string, allowedRoutes: string[]): boolean => {
  if (pathname === RUTA_SIN_ACCESO) return true;
  if (allowedRoutes.some((r) => matches(pathname, r))) return true;

  const aux = AUX_ROUTE_OWNERS.find((a) => matches(pathname, a.prefix));
  return aux
    ? aux.owners.some((owner) => allowedRoutes.some((r) => matches(owner, r)))
    : false;
};

/** Módulos visibles en el menú: los del catálogo cuya ruta está autorizada. */
export const getAllowedModules = (allowedRoutes: string[]): NavModule[] =>
  NAV_MODULES.filter((m) => allowedRoutes.includes(m.path));

/** Módulo de Administración: el lugar de trabajo del SUPERADMIN. */
const RUTA_ADMINISTRACION = "/administracion";


export const getLandingPath = (token?: string): string => {
  const allowed = getAllowedModules(Utils.getUserRoutes(token));

  const esSuperadmin = Utils.getUserRoleIds(token).includes(ROL_SUPERADMIN);
  if (esSuperadmin && allowed.some((m) => m.path === RUTA_ADMINISTRACION)) {
    return RUTA_ADMINISTRACION;
  }

  return allowed[0]?.path ?? RUTA_SIN_ACCESO;
};
