import { ClipboardList, FileUp, Home, LucideIcon, Settings } from "lucide-react";
import { Utils } from "./utils";
import { ROL_SUPERADMIN } from "./config";

/**
 * Catálogo de módulos del menú de FMI. El acceso NO se decide aquí: las rutas
 * permitidas provienen de la base de datos (PARAMETROS, ID_MAESTRO=49) y viajan
 * en el claim `routes` del token. `path` es la clave que cruza con esas rutas.
 * Mismo esquema que el Banco de Talentos.
 */
export interface NavModule {
  key: string;
  icon: LucideIcon;
  label: string;
  path: string;
}

export const NAV_MODULES: NavModule[] = [
  { key: "inicio", icon: Home, label: "Inicio", path: "/listaTalentos" },
  { key: "requerimientos", icon: ClipboardList, label: "Requerimientos", path: "/requerimientos" },
  { key: "cargar-fmi", icon: FileUp, label: "Cargar FMI", path: "/cargarFMI" },
  { key: "administracion", icon: Settings, label: "Administración", path: "/administracion" },
];

/** Sin ninguna ruta autorizada. Siempre accesible con sesión iniciada. */
export const RUTA_SIN_ACCESO = "/no-autorizado";

/**
 * Sub-pantallas que pertenecen a un módulo pero cuya URL no tiene registro propio
 * en PARAMETROS (maestro 49). El acceso se hereda: si el usuario puede entrar a
 * alguno de los módulos dueños, puede entrar a la sub-pantalla.
 */
const AUX_ROUTE_OWNERS: { prefix: string; owners: string[] }[] = [
  { prefix: "/tableAsignarTalento", owners: ["/requerimientos"] },
  // Vuelta a la lista desde Cese/Movimiento/Solicitud de equipo (reabre el detalle).
  { prefix: "/pantalla-lista-talentos", owners: ["/listaTalentos"] },
];

const matches = (pathname: string, route: string): boolean =>
  pathname === route || pathname.startsWith(`${route}/`);

/**
 * Una ruta está permitida si coincide con una ruta autorizada o es hija de ella
 * (prefijo por segmento). Las sub-pantallas de {@link AUX_ROUTE_OWNERS} heredan
 * el acceso de su módulo dueño.
 */
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

/**
 * A dónde entra el usuario al iniciar sesión (y a dónde se le devuelve si cae en
 * una ruta que no le corresponde).
 *
 * El SUPERADMIN va directo a Administración (cuando el módulo esté en el
 * catálogo y lo tenga autorizado); el resto, al primer módulo autorizado.
 */
export const getLandingPath = (token?: string): string => {
  const allowed = getAllowedModules(Utils.getUserRoutes(token));

  const esSuperadmin = Utils.getUserRoleIds(token).includes(ROL_SUPERADMIN);
  if (esSuperadmin && allowed.some((m) => m.path === RUTA_ADMINISTRACION)) {
    return RUTA_ADMINISTRACION;
  }

  return allowed[0]?.path ?? RUTA_SIN_ACCESO;
};
