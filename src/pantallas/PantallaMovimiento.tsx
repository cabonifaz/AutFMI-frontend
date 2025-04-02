import { useLocation, useNavigate } from 'react-router-dom';
import { TalentoType } from '../models/type/TalentoType';
import useFetchParams from '../hooks/useFetchParams';
import { usePostHook } from '../hooks/usePostHook';
import { MODALIDAD_LOC_SERVICIOS, UNIDAD } from '../utils/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { MovementFormSchema, MovementFormType } from '../models/schema/MovementFormSchema';
import { useEffect } from 'react';
import { DropdownForm, InputForm, SalaryStructureForm } from '../components/forms';
import BackButton from '../components/ui/BackButton';
import useFetchEmpleado from '../hooks/useFetchEmpleado';
import { Loading } from '../components/ui/Loading';
import { useFetchClients } from '../hooks/useFetchClients';

const PantallaMovimiento = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { talento } = location.state as { talento: TalentoType } || {};

    const { postData, postloading } = usePostHook();
    const { employee, loading: employeeLoading } = useFetchEmpleado(talento.idUsuarioTalento);
    const { clientes, loading: clientsLoading } = useFetchClients();
    const { params, paramLoading } = useFetchParams(`${UNIDAD}`);

    const unitValues = params?.filter((param) => param.idMaestro === Number(UNIDAD));

    const goBack = () => navigate(-1);

    const { control, handleSubmit, formState: { errors, isDirty }, reset, setValue } = useForm<MovementFormType>({
        resolver: zodResolver(MovementFormSchema),
        mode: "onTouched",
        defaultValues: {
            nombres: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            idArea: 0,
            idCliente: 0,
            montoBase: 0,
            montoMovilidad: 0,
            montoTrimestral: 0,
            montoSemestral: 0,
            puesto: "",
            idMovArea: 0,
            jornada: "",
            fchMovimiento: ""
        }
    });

    useEffect(() => {
        if (employee && !employeeLoading) {
            reset({
                nombres: employee.nombres || "",
                apellidoPaterno: employee.apellidoPaterno || "",
                apellidoMaterno: employee.apellidoMaterno || "",
                idArea: employee.idArea || 0,
                idCliente: employee.idCliente || 0,
                montoBase: employee.remuneracion || 0,
            });
        }
    }, [employee, employeeLoading, reset]);

    const onSubmit: SubmitHandler<MovementFormType> = async (data) => {
        let cliente = "";
        let area = "";

        if (data?.idCliente && data.idCliente !== 0) {
            cliente = clientes.find((cliente) => cliente.idCliente === data?.idCliente)?.razonSocial || "";
        }

        if (data.idArea !== 0) {
            area = unitValues?.find((area) => area.num1 === data.idArea)?.string1 || "";
        }

        const response = await postData("/fmi/employee/movement", {
            idUsuarioTalento: talento.idUsuarioTalento,
            idMoneda: null,
            idModalidad: null,
            fchInicioContrato: null,
            fchTerminoContrato: null,
            proyectoServicio: null,
            objetoContrato: null,
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
                    <InputForm name="apellidoMaterno" control={control} label="Apellido Materno" error={errors.apellidoMaterno} required={true} />

                    <DropdownForm name="idArea" control={control} label="Área" error={errors.idArea} required={true}
                        options={unitValues?.map((unit) => ({ value: unit.num1, label: unit.string1 })) || []}
                    />

                    {talento.modalidad === MODALIDAD_LOC_SERVICIOS && (
                        <DropdownForm name="idCliente" control={control} label="Cliente" error={errors.idCliente}
                            options={clientes?.map((client) => ({ value: client.idCliente, label: client.razonSocial })) || []}
                            required={true}
                        />
                    )}

                    {/* Movement */}
                    <SalaryStructureForm control={control} mainLabel="Estructura Salarial" setValue={setValue} errors={errors}
                        inputs={[
                            { label: "Monto Base", name: "montoBase", type: "number" },
                            { label: "Monto Movilidad", name: "montoMovilidad", type: "number" },
                            { label: "Monto Trimestral", name: "montoTrimestral", type: "number" },
                            { label: "Monto Semestral", name: "montoSemestral", type: "number" }
                        ]}
                    />

                    <InputForm name="puesto" control={control} label="Puesto" error={errors.puesto} required={true} />
                    <DropdownForm name="idMovArea" control={control} label="Nueva Área" error={errors.idMovArea}
                        options={unitValues?.map((unit) => ({ value: unit.num1, label: unit.string1 })) || []}
                        required={true}
                    />
                    <InputForm name="jornada" control={control} label="Jornada" error={errors.jornada} required={true} />
                    <InputForm name="fchMovimiento" control={control} label="Fecha de movimiento" type="date" error={errors.fchMovimiento} word_wrap={true} required={true} />
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

export default PantallaMovimiento;
