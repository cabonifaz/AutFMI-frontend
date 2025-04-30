import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TalentoType } from '../models/type/TalentoType';
import { OutFormSchema, OutFormType } from '../models/schema/OutFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { usePostHook } from '../hooks/usePostHook';
import { MODALIDAD_LOC_SERVICIOS, MOTIVO_CESE, UNIDAD } from '../utils/config';
import { DropdownForm, InputForm } from '../components/forms';
import BackButton from '../components/ui/BackButton';
import useFetchEmpleado from '../hooks/useFetchEmpleado';
import { Loading } from '../components/ui/Loading';
import { useFetchClients } from '../hooks/useFetchClients';
import { useParams } from '../context/ParamsContext';

const PantallaCese = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { talento } = location.state as { talento: TalentoType } || {};

    const { postData, postloading } = usePostHook();
    const { employee, loading: employeeLoading } = useFetchEmpleado(talento.idUsuarioTalento);
    const { clientes, loading: clientsLoading } = useFetchClients();
    const { paramsByMaestro, loading: paramLoading } = useParams(`${UNIDAD},${MOTIVO_CESE}`);

    const unitValues = paramsByMaestro[UNIDAD];
    const reasonValues = paramsByMaestro[MOTIVO_CESE];

    const goBack = () => navigate(-1);

    const { control, handleSubmit, formState: { errors, isDirty }, reset } = useForm<OutFormType>({
        resolver: zodResolver(OutFormSchema),
        mode: "onChange",
        defaultValues: {
            nombres: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            idArea: 0,
            idCliente: 0,
            idMotivo: 0,
            fchCese: ""
        }
    });

    useEffect(() => {
        if (employee) {
            reset({
                nombres: employee.nombres || "",
                apellidoPaterno: employee.apellidoPaterno || "",
                apellidoMaterno: employee.apellidoMaterno || "",
                idArea: employee.idArea || 0,
            });
        }
    }, [employee, reset]);

    const onSubmit: SubmitHandler<OutFormType> = async (data) => {
        let cliente = "";
        let area = "";

        if (data?.idCliente && data.idCliente !== 0) {
            cliente = clientes.find((cliente) => cliente.idCliente === data?.idCliente)?.razonSocial || "";
        }

        if (data.idArea !== 0) {
            area = unitValues?.find((area) => area.num1 === data.idArea)?.string1 || "";
        }

        const response = await postData("/fmi/employee/contractTermination", {
            idUsuarioTalento: talento.idUsuarioTalento,
            area: area,
            cliente: cliente,
            ...data
        });

        if (response.idTipoMensaje === 2) {
            goBack();
        }
    };

    return (
        <>
            {(paramLoading || postloading || employeeLoading || clientsLoading) && <Loading overlayMode={true} />}
            <div className="w-full lg:w-[65%] m-auto p-4 border-2 rounded-lg my-8">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    {/* Talent Data */}
                    <h3 className="text-2xl font-semibold flex gap-2">
                        <BackButton backClicked={goBack} />
                        Datos del talento
                    </h3>
                    <InputForm name="nombres" control={control} label="Nombres" error={errors.nombres} required={true} />
                    <InputForm name="apellidoPaterno" control={control} label="Apellido Paterno" error={errors.apellidoPaterno} required={true} />
                    <InputForm name="apellidoMaterno" control={control} label="Apellido Materno" error={errors.apellidoMaterno} required={false} />

                    <DropdownForm name="idArea" control={control} label="Área" error={errors.idArea}
                        options={unitValues?.map((unit) => ({ value: unit.num1, label: unit.string1 })) || []}
                        required={true}
                    />

                    {talento.modalidad === MODALIDAD_LOC_SERVICIOS && (
                        <DropdownForm name="idCliente" control={control} label="Cliente" error={errors.idCliente}
                            options={clientes?.map((client) => ({ value: client.idCliente, label: client.razonSocial })) || []}
                            required={true}
                        />
                    )}

                    {/* CESE */}
                    <DropdownForm name="idMotivo" control={control} label="Motivo de cese" error={errors.idMotivo}
                        options={reasonValues?.map((reason) => ({ value: reason.num1, label: reason.string1 })) || []} required={true}
                    />

                    <InputForm name="fchCese" control={control} label="Fecha de cese" error={errors.fchCese} type="date" required={true} />

                    {/* Form options */}
                    <div className="flex justify-center gap-4">
                        <button type="button" className="btn btn-outline-gray" onClick={goBack}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`btn ${isDirty ? "btn-primary" : "btn-disabled"}`}
                            disabled={!isDirty}>
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default PantallaCese;
