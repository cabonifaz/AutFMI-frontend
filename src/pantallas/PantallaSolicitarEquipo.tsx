import { useLocation, useNavigate } from 'react-router-dom';
import { TalentoType } from '../models/type/TalentoType';
import { usePostHook } from '../hooks/usePostHook';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, useFieldArray } from 'react-hook-form';
import { EquipoFormSchema, EquipoFormType } from '../models/schema/EquipoFormSchema';
import { useEffect, useMemo, useState } from 'react';
import { DropdownForm, InputForm } from '../components/forms';
import BackButton from '../components/ui/BackButton';
import useFetchEmpleado from '../hooks/useFetchEmpleado';
import CheckboxForm from '../components/forms/CheckboxForm';
import useFetchParams from '../hooks/useFetchParams';
import { ANEXO_HARDWARE, TIPO_HARDWARE, TIPO_SOFTWARE, UNIDAD } from '../utils/config';
import { Loading } from '../components/ui/Loading';
import { useFetchClients } from '../hooks/useFetchClients';

const PantallaSolicitarEquipo = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { talento } = location.state as { talento: TalentoType } || {};
    const [defaultSoftwareIds, setDefaultSoftwareIds] = useState<string[]>([]);

    const { postData, postloading } = usePostHook();
    const { employee, loading: employeeLoading } = useFetchEmpleado(talento?.idUsuarioTalento);
    const { clientes, loading: clientsLoading } = useFetchClients();
    const { params, paramLoading } = useFetchParams(`${UNIDAD}, ${TIPO_HARDWARE}, ${ANEXO_HARDWARE}, ${TIPO_SOFTWARE}`);

    const tipoHardwareParams = useMemo(() =>
        params?.filter(param => param.idMaestro === Number(TIPO_HARDWARE)) || [],
        [params]
    );

    const anexoHardwareParams = useMemo(() =>
        params?.filter(param => param.idMaestro === Number(ANEXO_HARDWARE)) || [],
        [params]
    );

    const tipoSoftwareParams = useMemo(() =>
        params?.filter(param => param.idMaestro === Number(TIPO_SOFTWARE)) || [],
        [params]
    );

    const unitValues = useMemo(() =>
        params?.filter((param) => param.idMaestro === Number(UNIDAD)) || [],
        [params]
    );

    const goBack = () => navigate(-1);

    const { control, handleSubmit, formState: { errors, isDirty }, reset, watch, trigger } = useForm<EquipoFormType>({
        resolver: zodResolver(EquipoFormSchema),
        mode: "onChange",
        defaultValues: {
            nombres: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            idCliente: 0,
            idArea: 0,
            cargo: "",
            fechaSolicitud: new Date().toISOString().split('T')[0],
            fechaEntrega: new Date().toISOString().split('T')[0],
            tipoHardware: tipoHardwareParams?.length ? tipoHardwareParams[tipoHardwareParams.length - 1].num1 : 99,
            anexoHardware: anexoHardwareParams?.length ? anexoHardwareParams[anexoHardwareParams.length - 1].num1 : 99,
            isPc: false,
            isLaptop: false,
            procesador: "",
            ram: "",
            disco: "",
            marca: "",
            celular: "no",
            internetMovil: "no",
            accesorios: "",
            software: []
        }
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "software"
    });

    const tipoHardware = watch("tipoHardware");

    // const isPcOrLaptop = tipoHardware === "PC" || tipoHardware === "Laptop";
    const isPcOrLaptop = Number(tipoHardware) === 1 || Number(tipoHardware) === 2;

    const isDefaultSoftware = (id: any) => {
        return defaultSoftwareIds.includes(id);
    };

    useEffect(() => {
        trigger(["procesador", "ram", "disco"]);

        if (isPcOrLaptop) {
            const defaultProductNames = tipoSoftwareParams?.map(param => param.string1) || [];

            const existingDefaultSoftware = fields.filter(field =>
                defaultProductNames.includes(field.producto ?? "")
            );

            const existingDefaultProductNames = existingDefaultSoftware.map(field => field.producto);

            const missingDefaultSoftware = tipoSoftwareParams?.filter(param =>
                !existingDefaultProductNames.includes(param.string1)
            ).map(param => ({
                producto: param.string1,
                version: param.string2
            })) || [];

            const manualSoftware = fields.filter(field =>
                !defaultProductNames.includes(field.producto ?? "")
            );

            const newFields = [
                ...existingDefaultSoftware,
                ...missingDefaultSoftware,
                ...manualSoftware
            ];

            replace(newFields);

            setTimeout(() => {
                const newDefaultIds = fields
                    .filter(field => defaultProductNames.includes(field.producto ?? ""))
                    .map(field => field.id);
                setDefaultSoftwareIds(newDefaultIds);
            }, 0);
        } else {
            const defaultProductNames = tipoSoftwareParams?.map(param => param.string1) || [];
            const manualSoftware = fields.filter(field =>
                !defaultProductNames.includes(field.producto ?? "")
            );
            replace(manualSoftware);
            setDefaultSoftwareIds([]);
        }
        // eslint-disable-next-line
    }, [tipoHardware, tipoSoftwareParams, replace, trigger]);

    useEffect(() => {
        if (employee && !employeeLoading) {
            reset({
                nombres: employee.nombres || "",
                apellidoPaterno: employee.apellidoPaterno || "",
                apellidoMaterno: employee.apellidoMaterno || "",
                idCliente: employee.idCliente || 0,
                idArea: employee.idArea || 0,
                cargo: "",
                fechaSolicitud: new Date().toISOString().split('T')[0],
                fechaEntrega: new Date().toISOString().split('T')[0],
                tipoHardware: tipoHardwareParams?.length ? tipoHardwareParams[tipoHardwareParams.length - 1].num1 : 99,
                anexoHardware: anexoHardwareParams?.length ? anexoHardwareParams[anexoHardwareParams.length - 1].num1 : 99,
                isPc: false,
                isLaptop: false,
                procesador: "",
                ram: "",
                disco: "",
                marca: "",
                celular: "no",
                internetMovil: "no",
                accesorios: "",
                software: []
            });
        }
    }, [employee, employeeLoading, reset, tipoHardwareParams, anexoHardwareParams]);

    const onSubmit: SubmitHandler<EquipoFormType> = async (data) => {
        let cliente = "";
        let area = "";

        if (data?.idCliente && data.idCliente !== 0) {
            cliente = clientes.find((cliente) => cliente.idCliente === data?.idCliente)?.razonSocial || "";
        }

        if (data.idArea !== 0) {
            area = unitValues?.find((area) => area.num1 === data.idArea)?.string1 || "";
        }

        try {
            const formattedData = {
                idUsuarioEmpleado: talento?.idUsuarioTalento,
                nombreEmpleado: data.nombres,
                apellidoPaternoEmpleado: data.apellidoPaterno,
                apellidoMaternoEmpleado: data.apellidoMaterno,
                idCliente: data.idCliente,
                idArea: data.idArea,
                area: area,
                cliente: cliente,
                puesto: data.cargo,
                fechaSolicitud: data.fechaSolicitud,
                fechaEntrega: data.fechaEntrega,
                idTipoEquipo: data.tipoHardware,
                tipoEquipo: tipoHardwareParams.find(param => param.num1 === data.tipoHardware)?.string1 || "",
                procesador: data.procesador,
                ram: data.ram,
                hd: data.disco,
                marca: data.marca,
                anexo: anexoHardwareParams.find(param => param.num1 === data.anexoHardware)?.string1 || "",
                idAnexo: data.anexoHardware,
                celular: data.celular === "si",
                internetMovil: data.internetMovil === "si",
                accesorios: data.accesorios,
                lstSoftware: data.software.map((sw, index) => ({
                    idItem: index + 1,
                    producto: sw.producto,
                    prodVersion: sw.version
                }))
            };

            const response = await postData("/fmi/employee/solicitud/equipo", formattedData);

            if (response.idTipoMensaje === 2) {
                goBack();
            }
        } catch (error) {
            console.error("Error al enviar el formulario:", error);
        }
    };

    const addNewSoftwareRow = () => {
        append({ producto: "", version: "" });
    };

    const isLoading = postloading || employeeLoading || paramLoading || clientsLoading;

    return (
        <>
            {isLoading && <Loading overlayMode={true} />}
            <div className="w-full lg:w-[65%] m-auto p-4 border-2 rounded-lg my-8">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    {/* Datos del Colaborador */}
                    <h3 className="text-2xl font-semibold flex gap-2">
                        <BackButton backClicked={goBack} />
                        Datos del Colaborador
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputForm name="nombres" control={control} label="Nombres" error={errors.nombres} required={true} />
                        <InputForm name="apellidoPaterno" control={control} label="Apellido Paterno" error={errors.apellidoPaterno} required={true} />
                        <InputForm name="apellidoMaterno" control={control} label="Apellido Materno" error={errors.apellidoMaterno} required={true} />
                        <DropdownForm name="idCliente" control={control} label="Cliente" error={errors.idCliente}
                            options={clientes?.map((client) => ({ value: client.idCliente, label: client.razonSocial })) || []}
                            required={true}
                        />
                        <DropdownForm name="idArea" control={control} label="Área" error={errors.idArea}
                            options={unitValues?.map((unit) => ({ value: unit.num1, label: unit.string1 })) || []}
                            required={true}
                        />
                        <InputForm name="cargo" control={control} label="Cargo" error={errors.cargo} required={true} />
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputForm
                            name="fechaSolicitud"
                            control={control}
                            label="Fecha de Solicitud"
                            type="date"
                            error={errors.fechaSolicitud}
                            required={true}
                        />
                        <InputForm
                            name="fechaEntrega"
                            control={control}
                            label="Fecha de Entrega"
                            type="date"
                            error={errors.fechaEntrega}
                            required={true}
                        />
                    </div>

                    {/* Datos de Requerimiento de Hardware */}
                    <h3 className="text-2xl font-semibold mt-4">Datos de Requerimiento de Hardware</h3>

                    {/* Tipo de Equipo */}
                    <div className="min-w-[9rem]">
                        <DropdownForm
                            name="tipoHardware"
                            control={control}
                            label="Tipo de Equipo"
                            options={tipoHardwareParams?.map(param => ({
                                value: param.num1,
                                label: param.string1
                            })) || []}
                            error={errors.tipoHardware}
                            required={true}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputForm
                            name="procesador"
                            control={control}
                            label={`Procesador`}
                            error={errors.procesador}
                            disabled={!isPcOrLaptop}
                            required={isPcOrLaptop}
                        />
                        <InputForm
                            name="ram"
                            control={control}
                            label={`RAM`}
                            error={errors.ram}
                            disabled={!isPcOrLaptop}
                            required={isPcOrLaptop}
                        />
                        <InputForm
                            name="disco"
                            control={control}
                            label={`Disco Duro`}
                            error={errors.disco}
                            disabled={!isPcOrLaptop}
                            required={isPcOrLaptop}
                        />
                        <InputForm
                            name="marca"
                            control={control}
                            label="Marca (Opcional)"
                            error={errors.marca}
                            disabled={!isPcOrLaptop}
                            required={false}
                        />
                    </div>


                    {/* Anexo, Celular e Internet Móvil */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Anexo Hardware */}
                        <div className="col-span-1 lg:col-span-6">
                            <DropdownForm
                                name="anexoHardware"
                                control={control}
                                label="Anexo"
                                options={anexoHardwareParams?.map(param => ({
                                    value: param.num1,
                                    label: param.string1
                                })) || []}
                                error={errors.anexoHardware}
                                required={true}
                            />
                        </div>

                        {/* Contenedor para Celular e Internet Móvil */}
                        <div className="col-span-1 lg:col-span-6 grid grid-cols-2 gap-6">
                            {/* Celular */}
                            <div className="col-span-1">
                                <label className="block mb-2 font-medium">Celular</label>
                                <div className="flex gap-8">
                                    <CheckboxForm
                                        name="celular"
                                        control={control}
                                        label="Sí"
                                        value="si"
                                        group="celular"
                                    />
                                    <CheckboxForm
                                        name="celular"
                                        control={control}
                                        label="No"
                                        value="no"
                                        defaultChecked={true}
                                        group="celular"
                                    />
                                </div>
                            </div>

                            {/* Internet Móvil */}
                            <div className="col-span-1">
                                <label className="block mb-2 font-medium">Internet Móvil</label>
                                <div className="flex gap-8">
                                    <CheckboxForm
                                        name="internetMovil"
                                        control={control}
                                        label="Sí"
                                        value="si"
                                        group="internetMovil"
                                    />
                                    <CheckboxForm
                                        name="internetMovil"
                                        control={control}
                                        label="No"
                                        value="no"
                                        defaultChecked={true}
                                        group="internetMovil"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>


                    <InputForm
                        name="accesorios"
                        control={control}
                        label="Accesorios"
                        error={errors.accesorios}
                        required={false}
                    />

                    {/* Datos de Instalación de Software */}
                    <h3 className="text-2xl font-semibold mt-4">Datos de Instalación de Software</h3>

                    <div className="border p-4 rounded-lg overflow-x-auto">
                        {/* Tabla con scroll horizontal en móvil */}
                        <div className="min-w-[500px]">
                            {/* Encabezado de la tabla */}
                            <div className="grid grid-cols-12 gap-2 mb-2">
                                <div className="col-span-1 text-sm font-medium flex items-center justify-center">Item</div>
                                <div className="col-span-6 text-sm font-medium flex items-center justify-center">Producto</div>
                                <div className="col-span-5 text-sm font-medium flex items-center justify-center">Versión</div>
                            </div>

                            {/* Filas de la tabla */}
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-2 mb-2">
                                    {/* Columna Item */}
                                    <div className="col-span-1 flex items-center justify-center">{index + 1}</div>

                                    {/* Columna Producto - eliminando espacio extra */}
                                    <div className="col-span-6 px-10">
                                        <div className="w-full">
                                            <InputForm
                                                name={`software.${index}.producto`}
                                                control={control}
                                                label=""
                                                error={errors.software?.[index]?.producto}
                                                isTable={true}
                                                required={false}
                                            />
                                        </div>
                                    </div>

                                    {/* Columna Versión - eliminando espacio extra */}
                                    <div className="col-span-5 flex items-center">
                                        <div className="flex-grow px-4">
                                            <InputForm
                                                name={`software.${index}.version`}
                                                control={control}
                                                label=""
                                                error={errors.software?.[index]?.version}
                                                isTable={true}
                                                required={false}
                                            />
                                        </div>
                                        {/* Solo mostrar botón de eliminar para software NO predeterminado */}
                                        {!isDefaultSoftware(field.id) && (
                                            <button
                                                type="button"
                                                className="ml-1 text-red-500 hover:text-red-700"
                                                onClick={() => remove(index)}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Botón para agregar nueva fila */}
                        <div className="mt-4">
                            <button
                                type="button"
                                className="btn btn-blue"
                                onClick={addNewSoftwareRow}
                            >
                                Agregar
                            </button>
                        </div>
                    </div>
                    {/* Form options */}
                    <div className="flex justify-center gap-8">
                        <button
                            type="button"
                            className="btn btn-outline-gray"
                            onClick={goBack}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`btn ${isDirty ? "btn-primary" : "btn-disabled"}`}
                            disabled={!isDirty}
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default PantallaSolicitarEquipo;