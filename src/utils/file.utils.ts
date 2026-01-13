import { ParamType } from "../models/type/ParamType";
import { PDFDataType } from "../models/type/PDFDataType";

export const allowedFileExtensions = (
  filesFromParams: ParamType[]
) => {
  const extensions = filesFromParams.map((p) => `.${p.string2}`);
  return extensions.join(", ");
};

export const openPdfFilesInNewTab = (files: PDFDataType[]) => {
  files.forEach((file, index) => {
    setTimeout(() => {
      const pdfBlob = decodeBase64ToBlob(file.archivoB64);
      const url = URL.createObjectURL(pdfBlob);

      const newTab = window.open(url, `_blank_${index}`);
      if (newTab) {
      } else {
        console.error(
          `Failed to open tab for file: ${file.nombreArchivo}`
        );
      }
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
