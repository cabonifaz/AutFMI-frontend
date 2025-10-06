import { ParamType } from "../models/type/ParamType";

export const formatDateToDMY = (dateString: string): string => {
  if (!dateString) return "";
  return dateString.split("-").reverse().join("-");
};

export const getPriorityValueFromParams = (values?: ParamType[]): number => {
  if (!values || values.length === 0) return 0;

  // buscamos el primer item con prioridad (num2 = 1)
  const prioritized = values.find((item) => item.num2 === 1);
  if (prioritized) return prioritized.num1;

  // fallback: usamos el primer valor disponible
  return values[0].num1 ?? 0;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result as string;
      const pureBase64 = base64String.split(",")[1];

      resolve(pureBase64);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

export const getFileNameAndExtension = (
  fileName: fileNameType
): { nombreArchivo: string; extensionArchivo: string } => {
  if (!fileName) return { nombreArchivo: "", extensionArchivo: "" };

  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return { nombreArchivo: fileName, extensionArchivo: "" };
  }

  const nombreArchivo = fileName.slice(0, lastDotIndex);
  const extensionArchivo = fileName.slice(lastDotIndex + 1);

  return { nombreArchivo, extensionArchivo };
};

type fileNameType = string | undefined | null;

enum TipoArchivo {
  PDF = 1,
  WORD = 2,
  EXCEL = 3,
}

export const getTipoArchivoId = (extension: string): number => {
  switch (extension.toLowerCase()) {
    case "pdf":
      return TipoArchivo.PDF;
    case "doc":
    case "docx":
      return TipoArchivo.WORD;
    case "xls":
    case "xlsx":
      return TipoArchivo.EXCEL;
    default:
      throw new Error(`Tipo de archivo no soportado: ${extension}`);
  }
};

export const formatCoin = (coinValue: number): string => {
  // Check if the input is a valid finite number
  if (
    typeof coinValue !== "number" ||
    !isFinite(coinValue) ||
    isNaN(coinValue)
  ) {
    return "-";
  }

  // Initialize Intl.NumberFormat with specific options:
  const formatter = new Intl.NumberFormat("en-US", {
    // Use 'decimal' style for regular number formatting (not currency symbol)
    style: "decimal",

    // Ensure there are always exactly 2 digits after the decimal point
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,

    // Ensure thousand separators are used (this is default behavior for 'en-US',
    // but explicitly stating it is good practice if needed)
    useGrouping: true,
  });

  return formatter.format(coinValue);
};

export const downloadAnyFile = (file64: string, ext: string) => {
  // Limpiar la cadena base64
  const cleanBase64 = file64.replace(/\s/g, "");

  // Decodificamos base64 -> bytes
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Creamos un blob genérico
  const blob = new Blob([byteArray]);

  // Creamos URL temporal
  const url = URL.createObjectURL(blob);

  // Simulamos descarga
  const a = document.createElement("a");
  a.href = url;
  a.download = `archivo.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Liberamos la URL temporal
  URL.revokeObjectURL(url);
};

export const isValidToken = (token?: string): boolean => {
  if (!token) return false;

  const decodedToken = decodeJwt(token);
  if (!decodedToken) {
    localStorage.removeItem("token");
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (decodedToken.exp && decodedToken.exp > currentTime) {
    return true;
  }

  localStorage.removeItem("token");
  return false;
};

export const decodeJwt = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};
