import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TalentoType } from '../models/type/TalentoType';
import { OutFormSchema, OutFormType } from '../models/schema/OutFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import useFetchParams from '../hooks/useFetchParams';
import { usePostHook } from '../hooks/usePostHook';
import { MODALIDAD_LOC_SERVICIOS, MOTIVO_CESE, UNIDAD } from '../utils/config';
import Loading from '../components/loading/Loading';
import { DropdownForm, InputForm } from '../components/forms';
import BackButton from '../components/ui/BackButton';
import useFetchEmpleado from '../hooks/useFetchEmpleado';

const PantallaCese = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { talento } = location.state as { talento: TalentoType } || {};

    const { postData, postloading } = usePostHook();
    const { employee, loading: employeeLoading } = useFetchEmpleado(talento.idUsuarioTalento);
    const { params, paramLoading } = useFetchParams(`${UNIDAD}, ${MOTIVO_CESE}`);

    const unitValues = params?.filter((param) => param.idMaestro === Number(UNIDAD));
    const reasonValues = params?.filter((param) => param.idMaestro === Number(MOTIVO_CESE));

    const goBack = () => navigate(-1);

    const { control, handleSubmit, formState: { errors, isDirty }, reset } = useForm<OutFormType>({
        resolver: zodResolver(OutFormSchema),
        mode: "onTouched",
        defaultValues: {
            nombres: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            idUnidad: 0,
            empresa: "",
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
                idUnidad: employee.idUnidad || 0,
            });
        }
    }, [employee, reset]);

    const onSubmit: SubmitHandler<OutFormType> = async (data) => {
        const response = await postData("/fmi/employee/contractTermination", {
            idUsuarioTalento: talento.idUsuarioTalento,
            ...data
        });

        if (response.idTipoMensaje === 2) {
            goBack();
        }
    };

    return (
        <>
            {paramLoading && <Loading />}
            {postloading && <Loading />}
            {employeeLoading && <Loading />}
            <div className="w-full lg:w-[65%] m-auto p-4 border-2 rounded-lg my-8">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    {/* Talent Data */}
                    <h3 className="text-2xl font-semibold flex gap-2">
                        <BackButton backClicked={goBack} />
                        Datos del talento
                    </h3>
                    <InputForm name="nombres" control={control} label="Nombres" error={errors.nombres} />
                    <InputForm name="apellidoPaterno" control={control} label="Apellido Paterno" error={errors.apellidoPaterno} />
                    <InputForm name="apellidoMaterno" control={control} label="Apellido Materno" error={errors.apellidoMaterno} />

                    <DropdownForm name="idUnidad" control={control} label="Unidad" error={errors.idUnidad}
                        options={unitValues?.map((unit) => ({ value: unit.num1, label: unit.string1 })) || []}
                    />

                    {talento.modalidad === MODALIDAD_LOC_SERVICIOS && (<InputForm name="empresa" control={control} label="Empresa" error={errors.empresa} />)}

                    {/* CESE */}
                    <DropdownForm name="idMotivo" control={control} label="Motivo de cese" error={errors.idMotivo}
                        options={reasonValues?.map((reason) => ({ value: reason.num1, label: reason.string1 })) || []} />

                    <InputForm name="fchCese" control={control} label="Fecha de cese" error={errors.fchCese} type="date" />

                    {/* Form options */}
                    <div className="flex justify-center gap-4">
                        <button type="button" className="btn btn-outline-gray" onClick={goBack}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`btn ${isDirty ? "btn-primary" : "bg-gray-400 cursor-not-allowed"}`}
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
