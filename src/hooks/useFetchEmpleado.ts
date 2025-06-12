import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { apiClientWithToken } from '../utils/apiClient';
import { EmployeeType } from '../models/type/EmployeeType';
import { EmployeeResponse } from '../models/response/EmployeeResponse';

const useFetchEmpleado = (idTalento: number) => {
    const [employee, setEmployee] = useState<EmployeeType | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchEmpleados = async () => {
            setLoading(true);
            try {
                const response = await apiClientWithToken.get<EmployeeResponse>(`/fmi/employee/data?idTalento=${idTalento}`);

                if (response.data.idTipoMensaje === 2) {
                    setEmployee(response.data.employee);
                    return;
                }
                enqueueSnackbar(response.data.mensaje, { variant: 'error' });
            } catch (error) { }
            finally {
                setLoading(false);
            }
        };

        fetchEmpleados();
    }, [enqueueSnackbar, idTalento]);

    return { employee, loading };
};

export default useFetchEmpleado;
