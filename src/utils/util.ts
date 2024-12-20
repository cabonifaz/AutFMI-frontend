export const formatDateToDMY = (dateString: string): string => {
    if (!dateString) return "";
    return dateString.split("-").reverse().join("-");
};