import { ParamType } from "../models/type/ParamType";
import { PDFDataType } from "../models/type/PDFDataType";

export const allowedFileExtensions = (
  filesFromParams: ParamType[]
) => {
  const extensions = filesFromParams.map((p) => `.${p.string2}`);
  return extensions.join(", ");
};

/** El backend manda el nombre sin extensión ("Alicia Oroya - FT-GS-01 ..."). */
export const pdfFileName = (nombreArchivo?: string): string => {
  const base = (nombreArchivo || "documento").trim();
  return base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
};

const ENTIDADES_HTML: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escaparHtml = (texto: string): string =>
  texto.replace(/[&<>"']/g, (caracter) => ENTIDADES_HTML[caracter]);

/**
 * Página mínima que envuelve al PDF: barra con el nombre y un botón Descargar,
 * y debajo el documento a pantalla completa.
 */
const paginaVisor = (blobUrl: string, nombre: string): string => {
  const nombreSeguro = escaparHtml(nombre);
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${nombreSeguro}</title>
    <style>
      html, body { margin: 0; height: 100%; font-family: system-ui, sans-serif; }
      body { display: flex; flex-direction: column; background: #525659; }
      header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 16px; padding: 8px 16px; background: #1f2937; color: #f9fafb;
      }
      h1 { font-size: 14px; font-weight: 500; margin: 0;
           overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      a { flex: none; background: #0ea5e9; color: #fff; text-decoration: none;
          font-size: 13px; padding: 6px 14px; border-radius: 6px; }
      a:hover { background: #0284c7; }
      iframe { flex: 1; border: 0; width: 100%; }
    </style>
  </head>
  <body>
    <header>
      <h1>${nombreSeguro}</h1>
      <a href="${blobUrl}" download="${nombreSeguro}">Descargar</a>
    </header>
    <iframe src="${blobUrl}" title="${nombreSeguro}"></iframe>
  </body>
</html>`;
};

/**
 * Abre cada PDF en su propia pestaña.
 *
 * La pestaña no apunta directamente al `blob:`: una URL de blob no lleva nombre
 * de archivo, así que el visor del navegador propone su UUID
 * ("f3b1c8de-....pdf") al descargar. En su lugar se escribe una página mínima
 * que muestra el PDF y trae su propio botón Descargar, que sí guarda con el
 * nombre real que arma el backend ("Alicia Oroya - FT-GS-01 Solicitud de
 * Creación de Usuarios.pdf"), el mismo que viaja como adjunto en los correos.
 */
export const openPdfFilesInNewTab = (files: PDFDataType[]) => {
  files.forEach((file, index) => {
    setTimeout(() => {
      const nombre = pdfFileName(file.nombreArchivo);
      // Se envuelve en un File y no en un Blob pelado para que el nombre viaje
      // con el objeto: es lo que usan los navegadores cuando la descarga no
      // trae nombre propio. Aun así, la URL sigue siendo `blob:.../<uuid>` y el
      // visor interno del navegador propone ese uuid; el nombre bueno lo pone
      // el botón Descargar de la barra.
      const pdfFile = new File([decodeBase64ToBlob(file.archivoB64)], nombre, {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(pdfFile);

      const newTab = window.open("", `_blank_${index}`);

      if (!newTab) {
        console.error(
          `Failed to open tab for file: ${file.nombreArchivo}`
        );
        URL.revokeObjectURL(url);
        return;
      }

      newTab.document.write(paginaVisor(url, nombre));
      newTab.document.close();
      // La URL vive mientras la pestaña la esté mostrando.
      newTab.addEventListener("beforeunload", () =>
        URL.revokeObjectURL(url)
      );
    }, index * 500);
  });
};

export const decodeBase64ToBlob = (base64: string): Blob => {
  const binaryData = atob(base64);
  const arrayBuffer = new Uint8Array(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    arrayBuffer[i] = binaryData.charCodeAt(i);
  }
  return new Blob([arrayBuffer], { type: "application/pdf" });
};
