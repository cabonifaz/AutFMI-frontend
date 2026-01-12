import { format, isValid, parse } from "date-fns";
import { createElement, ReactNode } from "react";
import { ParamType } from "../models/type/ParamType";

type fileNameType = string | undefined | null;

export class Utils {
  // --- New function for truncating text with ellipsis ---
  static truncateText = (text: string | undefined | null, limit: number): string => {
    if (!text) return "-";
    return text.length > limit ? `${text.substring(0, limit)}...` : text;
  };

  static getPriorityValueFromParams = (values?: ParamType[]): number => {
    if (!values || values.length === 0) return 0;
    const prioritized = values.find((item) => item.num2 === 1);
    if (prioritized) return prioritized.num1;
    return values[0].num1 ?? 0;
  };

  static getStars = (rating: number): ReactNode[] => {
    const getFilledStar = (key: string): ReactNode =>
      createElement("img", { src: "/assets/ic_fill_star.svg", alt: "star", className: "h-5 w-5", key });
    const getOutlinedStar = (key: string): ReactNode =>
      createElement("img", { src: "/assets/ic_outline_star.svg", alt: "star", className: "h-5 w-5", key });

    const stars: ReactNode[] = [];
    for (let i = 0; i < 5; i++) {
      stars.push(i < rating ? getFilledStar(`${i}`) : getOutlinedStar(`${i + 5}`));
    }
    return stars;
  };

  static isValidToken = (token?: string): boolean => {
    if (!token) return false;
    const decodedToken = this.decodeJwt(token);
    if (!decodedToken) {
      localStorage.removeItem("token");
      return false;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp && decodedToken.exp > currentTime;
  };

  static decodeJwt = (token: string): any => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64).split("").map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`).join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      return null;
    }
  };

  static buildQueryString = (params: Record<string, any>): string => {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    }
    return queryParams.toString();
  };

  static getImageSrc = (base64String: string) => {
    const formato = this.detectarFormatoDesdeBase64(base64String);
    const base64WithPrefix = this.addBase64ImagePrefix(base64String, formato);
    return this.isValidImageBase64(base64WithPrefix) ? base64WithPrefix : "/assets/ic_no_image.svg";
  };

  static detectarFormatoDesdeBase64 = (imageBase64String: string) => {
    if (imageBase64String.startsWith("iVBORw0KGgo")) return "png";
    return "jpeg";
  };

  static isValidImageBase64 = (base64String: string) => 
    /^data:image\/(jpeg|png|jpg);base64,[A-Za-z0-9+/=]+$/.test(base64String);

  static addBase64ImagePrefix = (base64String: string, formato: string) => {
    if (base64String && !base64String.startsWith("data:image/")) {
      return `data:image/${formato};base64,${base64String}`;
    }
    return base64String;
  };

  static fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  static getFileNameAndExtension = (fileName: fileNameType) => {
    if (!fileName) return { nombreArchivo: "", extensionArchivo: "" };
    const lastDotIndex = fileName.lastIndexOf(".");
    return lastDotIndex === -1 
      ? { nombreArchivo: fileName, extensionArchivo: "" }
      : { nombreArchivo: fileName.slice(0, lastDotIndex), extensionArchivo: fileName.slice(lastDotIndex + 1) };
  };

  static formatDateToDMY = (dateString: string): string => {
    if (!dateString) return "";
    return dateString.split("-").reverse().join("-");
  };

  static formatCoin = (coinValue: number): string => {
    if (typeof coinValue !== "number" || !isFinite(coinValue) || isNaN(coinValue)) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(coinValue);
  };
}