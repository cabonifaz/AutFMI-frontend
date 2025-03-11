import { useLocation, useNavigate } from 'react-router-dom';
import { TalentoType } from '../models/type/TalentoType';
import { usePostHook } from '../hooks/usePostHook';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, useFieldArray } from 'react-hook-form';
import { EquipoFormSchema, EquipoFormType } from '../models/schema/EquipoFormSchema';
import { useEffect, useMemo, useState } from 'react';
import Loading from '../components/loading/Loading';
import { DropdownForm, InputForm } from '../components/forms';
import BackButton from '../components/ui/BackButton';
import useFetchEmpleado from '../hooks/useFetchEmpleado';
import CheckboxForm from '../components/forms/CheckboxForm';
import useFetchParams from '../hooks/useFetchParams';
import { ANEXO_HARDWARE, TIPO_HARDWARE, TIPO_SOFTWARE, UNIDAD } from '../utils/config';

const PantallaSolicitarEquipo = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { talento } = location.state as { talento: TalentoType } || {};
    const [defaultSoftwareIds, setDefaultSoftwareIds] = useState<string[]>([]);

    const { postData, postloading } = usePostHook();
    const { employee, loading: employeeLoading } = useFetchEmpleado(talento?.idUsuarioTalento);
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
        mode: "onTouched",
        defaultValues: {
            nombres: "",
            apellidos: "",
            cliente: "",
            area: 0,
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
                defaultProductNames.includes(field.producto??"")
            );
            
            const existingDefaultProductNames = existingDefaultSoftware.map(field => field.producto);
            
            const missingDefaultSoftware = tipoSoftwareParams?.filter(param => 
                !existingDefaultProductNames.includes(param.string1)
            ).map(param => ({
                producto: param.string1,
                version: param.string2
            })) || [];
            
            const manualSoftware = fields.filter(field => 
                !defaultProductNames.includes(field.producto??"")
            );
            
            const newFields = [
                ...existingDefaultSoftware,
                ...missingDefaultSoftware,
                ...manualSoftware
            ];
            
            replace(newFields);
            
            setTimeout(() => {
                const newDefaultIds = fields
                    .filter(field => defaultProductNames.includes(field.producto??""))
                    .map(field => field.id);
                setDefaultSoftwareIds(newDefaultIds);
            }, 0);
        } else {
            const defaultProductNames = tipoSoftwareParams?.map(param => param.string1) || [];
            const manualSoftware = fields.filter(field => 
                !defaultProductNames.includes(field.producto??"")
            );
            replace(manualSoftware);
            setDefaultSoftwareIds([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tipoHardware, tipoSoftwareParams, replace, trigger]);

    useEffect(() => {
        if (employee && !employeeLoading) {
            reset({
                nombres: employee.nombres || "",
                apellidos: employee.apellidos || "",
                cliente: "",
                area: 0,
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
        const formattedData = {
            ...data,
            isPc: data.tipoHardware === 1,
            isLaptop: data.tipoHardware === 2,
            anexoFijo: data.anexoHardware === 1,
            anexoSoftphone: data.anexoHardware === 2,
            celularsi: data.celular === "si",
            celularno: data.celular === "no",
            internetMovilsi: data.internetMovil === "si",
            internetMovilno: data.internetMovil === "no",
        };

        const response = await postData("/fmi/equipment/request", {
            idUsuarioTalento: talento?.idUsuarioTalento,
            ...formattedData
        });

        if (response.idTipoMensaje === 2) {
            goBack();
        }
    };

    const addNewSoftwareRow = () => {
        append({ producto: "", version: "" });
    };

    const isLoading = postloading || employeeLoading || paramLoading;

    return (
        <>
            {isLoading && <Loading />}
            <div className="w-full lg:w-[65%] m-auto p-4 border-2 rounded-lg my-8">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    {/* Datos del Colaborador */}
                    <h3 className="text-2xl font-semibold flex gap-2">
                        <BackButton backClicked={goBack} />
                        Datos del Colaborador
                    </h3>
                    <hr className="my-1" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputForm name="nombres" control={control} label="Nombres" error={errors.nombres} />
                        <InputForm name="apellidos" control={control} label="Apellidos" error={errors.apellidos} />
                        <InputForm name="cliente" control={control} label="Cliente" error={errors.cliente} />
                        <DropdownForm name="area" control={control} label="Área" error={errors.area}
                            options={unitValues?.map((unit) => ({ value: unit.num1, label: unit.string1 })) || []}
                        />
                        <InputForm name="cargo" control={control} label="Cargo" error={errors.cargo} />
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputForm 
                            name="fechaSolicitud" 
                            control={control} 
                            label="Fecha de Solicitud" 
                            type="date" 
                            error={errors.fechaSolicitud} 
                        />
                        <InputForm 
                            name="fechaEntrega" 
                            control={control} 
                            label="Fecha de Entrega" 
                            type="date" 
                            error={errors.fechaEntrega} 
                        />
                    </div>

                    {/* Datos de Requerimiento de Hardware */}
                    <h3 className="text-2xl font-semibold">Datos de Requerimiento de Hardware</h3>
                    
                    {/* Tipo de Equipo */}
                    <div className="flex flex-col">
                        <div className="flex gap-4">
                            <DropdownForm
                                name="tipoHardware"
                                control={control}
                                label="Tipo de Equipo"
                                options={tipoHardwareParams?.map(param => ({ 
                                    value: param.num1, 
                                    label: param.string1 
                                })) || []}
                                error={errors.tipoHardware}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputForm 
                            name="procesador" 
                            control={control} 
                            label={`Procesador`} 
                            error={errors.procesador} 
                            disabled={!isPcOrLaptop}
                        />
                        <InputForm 
                            name="ram" 
                            control={control} 
                            label={`RAM`}
                            error={errors.ram} 
                            disabled={!isPcOrLaptop}
                        />
                        <InputForm 
                            name="disco" 
                            control={control} 
                            label={`Disco Duro`}
                            error={errors.disco} 
                            disabled={!isPcOrLaptop}
                        />
                        <InputForm 
                            name="marca"
                            control={control} 
                            label="Marca (Opcional)" 
                            error={errors.marca} 
                            disabled={!isPcOrLaptop}
                        />
                    </div>

                    {/* Anexos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <div className="flex gap-4">
                                <DropdownForm
                                    name="anexoHardware"
                                    control={control}
                                    label="Anexo"
                                    options={anexoHardwareParams?.map(param => ({ 
                                        value: param.num1, 
                                        label: param.string1 
                                    })) || []}
                                    error={errors.anexoHardware}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="mb-2 font-medium">Celular</label>
                            <div className="flex gap-4">
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
                        <div className="flex flex-col">
                            <label className="mb-2 font-medium">Internet Móvil</label>
                            <div className="flex gap-4">
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
                    
                    <InputForm 
                        name="accesorios" 
                        control={control} 
                        label="Accesorios" 
                        error={errors.accesorios} 
                    />

                   {/* Datos de Instalación de Software */}
                    <h3 className="text-2xl font-semibold">Datos de Instalación de Software</h3>

                    <div className="border p-4 rounded-lg">
                        {/* Encabezado de la tabla */}
                        <div className="grid grid-cols-12 gap-4 mb-2">
                            <div className="col-span-1 text-sm font-medium flex items-center justify-center">Item</div>
                            <div className="col-span-6 text-sm font-medium flex items-center justify-center">Producto</div>
                            <div className="col-span-5 text-sm font-medium flex items-center justify-center">Versión</div>
                        </div>

                        {/* Filas de la tabla */}
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-4 mb-4">
                                {/* Columna Item */}
                                <div className="col-span-1 flex items-center h-10 justify-center">{index + 1}</div>

                                {/* Columna Producto */}
                                <div className="col-span-6 justify-center">
                                    <InputForm
                                        name={`software.${index}.producto`}
                                        control={control}
                                        label=""
                                        error={errors.software?.[index]?.producto}
                                    />
                                </div>

                                {/* Columna Versión */}
                                <div className="col-span-5 flex items-center justify-center">
                                    <div className="w-full">
                                        <InputForm
                                            name={`software.${index}.version`}
                                            control={control}
                                            label=""
                                            error={errors.software?.[index]?.version}
                                        />
                                    </div>
                                    {/* Solo mostrar botón de eliminar para software NO predeterminado */}
                                    {!isDefaultSoftware(field.id) && (
                                        <button
                                            type="button"
                                            className="ml-2 text-red-500 hover:text-red-700"
                                            onClick={() => remove(index)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Botón para agregar nueva fila */}
                        <div className="mt-4">
                            <button
                                type="button"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                                onClick={addNewSoftwareRow}
                            >
                                Agregar
                            </button>
                        </div>
                    </div>

                    {/* Form options */}
                    <div className="flex justify-center gap-4">
                        <button 
                            type="button" 
                            className="w-40 bg-slate-600 rounded-lg text-white py-2 hover:bg-slate-500" 
                            onClick={goBack}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`w-40 rounded-lg text-white py-2 ${isDirty ? "bg-green-700 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}
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