export const formatDateToDMY = (dateString: string): string => {
    if (!dateString) return "";
    return dateString.split("-").reverse().join("-");
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

export const getFileNameAndExtension = (fileName: fileNameType): { nombreArchivo: string; extensionArchivo: string } => {
    if (!fileName) return { nombreArchivo: "", extensionArchivo: "" };

    const lastDotIndex = fileName.lastIndexOf('.');

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