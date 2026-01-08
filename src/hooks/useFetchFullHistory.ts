import { useState } from "react";
import { apiClientWithToken } from "../utils/apiClient";
import { enqueueSnackbar } from "notistack";
import { EmployeeResponseDetail } from "../models/response/EmployeeDetailResponse";
export const useFetchEmployeeDetails = () => {
  const [details, setDetails] = useState<EmployeeResponseDetail>();
  const [loading, setLoading] = useState<boolean>(false);
  const fetchClients = async (talentId: number) => {
    setLoading(true);
    try {
      const response =
        await apiClientWithToken.get<EmployeeResponseDetail>(
          `/fmi/employee/detail?talentId=${talentId}`
        );
      if (response.data.idTipoMensaje === 2) {
        setDetails(response.data);
        return;
      }
      enqueueSnackbar(response.data.mensaje, { variant: "warning" });
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };
  return { details, loading, fetchClients };
};