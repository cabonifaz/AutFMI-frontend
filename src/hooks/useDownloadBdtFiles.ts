import { useEffect, useRef, useState } from "react";
import { axiosInstanceBDT } from "../utils";
import { BaseResponseBDT } from "../models/response/BaseResponse";

interface FileType {
  fileUrl: string;
  filename: string;
  fileBase64: string;
}

type FileTypeResponse = FileType & BaseResponseBDT;

interface HookProps {
  /**
   * FileRequest, you can add more properties if you need
   */
  request: Partial<FileType>;
  /**
   * Url where the requests it is handled
   */
  url: string;
  /**
   * Callback function for success response
   * @param data
   * @returns
   */
  onSuccess?: (data?: FileTypeResponse) => void;
  /**
   * Callback function for error response
   * @param data
   * @returns
   */
  onError?: (err: any) => void;
}
/**
 * Download any type of file from BDT Backend from FilesController
 * Implement new features on FilesController if you need it
 * @param
 * @returns
 */
export const useDownloadFileFromBDT = (props: HookProps) => {
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<FileTypeResponse | null>(null);

  const { request, url, onError, onSuccess } = props;

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!request.fileUrl) return;

    const downloadFile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rs = await axiosInstanceBDT.post<FileTypeResponse>(
          url,
          request,
        );
        const responseData = rs.data;

        if (responseData.idMensaje !== 2)
          throw new Error(responseData.mensaje);

        setData(responseData);
        onSuccessRef.current?.(responseData);
      } catch (err: any) {
        setError(err);
        onErrorRef.current?.(err);
      } finally {
        setIsLoading(false);
      }
    };

    downloadFile();
  }, [request.fileUrl, url]);
  return { isLoading, data, error };
};
