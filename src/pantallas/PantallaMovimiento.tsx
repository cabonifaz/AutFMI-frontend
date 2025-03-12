import { useLocation, useNavigate } from 'react-router-dom';
import { TalentoType } from '../models/type/TalentoType';
import useFetchParams from '../hooks/useFetchParams';
import { usePostHook } from '../hooks/usePostHook';
import { MODALIDAD_LOC_SERVICIOS, UNIDAD } from '../utils/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { MovementFormSchema, MovementFormType } from '../models/schema/MovementFormSchema';
import { useEffect } from 'react';
import Loading from '../components/loading/Loading';
import { DropdownForm, InputForm, SalaryStructureForm } from '../components/forms';
import BackButton from '../components/ui/BackButton';
import useFetchEmpleado from '../hooks/useFetchEmpleado';

const PantallaMovimiento = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { talento } = location.state as { talento: TalentoType } || {};

    const { postData, postloading } = usePostHook();
    const { employee, loading: employeeLoading } = useFetchEmpleado(talento.idUsuarioTalento);
    const { params, paramLoading } = useFetchParams(`${UNIDAD}`);

    const unitValues = params?.filter((param) => param.idMaestro === Number(UNIDAD));

    const goBack = () => navigate(-1);

    const { control, handleSubmit, formState: { errors, isDirty }, reset, setValue } = useForm<MovementFormType>({
        resolver: zodResolver(MovementFormSchema),
        mode: "onTouched",
        defaultValues: {
            nombres: "",
            apellidos: "",
            idUnidad: 0,
            empresa: "",
            montoBase: 0,
            montoMovilidad: 0,
            montoTrimestral: 0,
            montoSemestral: 0,
            puesto: "",
            area: "",
            jornada: "",
            fchMovimiento: ""
        }
    });

    useEffect(() => {
        if (employee && !employeeLoading) {
            reset({
                nombres: employee.nombres || "",
                apellidos: employee.apellidos || "",
                idUnidad: employee.idUnidad || 0,
                montoBase: employee.remuneracion || 0,
            });
        }
    }, [employee, employeeLoading, reset]);

    const onSubmit: SubmitHandler<MovementFormType> = async (data) => {
        const response = await postData("/fmi/employee/movement", {
            idUsuarioTalento: talento.idUsuarioTalento,
            idMoneda: null,
            idModalidad: null,
            fchInicioContrato: null,
            fchTerminoContrato: null,
            proyectoServicio: null,
            objetoContrato: null,
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
                    <InputForm name="apellidos" control={control} label="Apellidos" error={errors.apellidos} />

                    <DropdownForm name="idUnidad" control={control} label="Unidad" error={errors.idUnidad}
                        options={unitValues?.map((unit) => ({ value: unit.num1, label: unit.string1 })) || []}
                    />

                    {talento.modalidad === MODALIDAD_LOC_SERVICIOS && (<InputForm name="empresa" control={control} label="Empresa" error={errors.empresa} />)}

                    {/* Movement */}
                    <SalaryStructureForm control={control} mainLabel="Estructura Salarial" setValue={setValue} errors={errors}
                        inputs={[
                            { label: "Monto Base", name: "montoBase", type: "number" },
                            { label: "Monto Movilidad", name: "montoMovilidad", type: "number" },
                            { label: "Monto Trimestral", name: "montoTrimestral", type: "number" },
                            { label: "Monto Semestral", name: "montoSemestral", type: "number" }
                        ]}
                    />

                    <InputForm name="puesto" control={control} label="Puesto" error={errors.puesto} />
                    <InputForm name="area" control={control} label="Área" error={errors.area} />
                    <InputForm name="jornada" control={control} label="Jornada" error={errors.jornada} />
                    <InputForm name="fchMovimiento" control={control} label="Fecha de movimiento" type="date" error={errors.fchMovimiento} />
                    {/* Form options */}
                    <div className="flex justify-center gap-4">
                        <button type="button" className="w-40 bg-slate-600 rounded-lg text-white py-2 hover:bg-slate-500" onClick={goBack}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`w-40 rounded-lg text-white py-2 ${isDirty ? "bg-green-700 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}
                            disabled={!isDirty}>
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default PantallaMovimiento;
