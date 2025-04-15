import React, { FormEvent, ReactEventHandler, useEffect, useMemo, useState } from "react";
import { ParamType } from "../../models/type/ParamType";
import { SubmitHandler, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newRQSchema, newRQSchemaType } from "../../models/schema/NewRQSchema";
import { fileToBase64, getFileNameAndExtension, getTipoArchivoId } from "../../utils/util";
import { usePostHook } from "../../hooks/usePostHook";
import { ClientType } from "../../models/type/ClientType";
import { Loading } from "./Loading";
import { NumberInput } from "../forms/NumberInput";
import { Tabs } from "./Tabs";

interface Archivo {
    name: string;
    size: number;
    file: File;
}

interface Props {
    onClose: () => void;
    updateRQData: () => void;
    estadoOptions: ParamType[];
    perfiles: ParamType[];
    clientes: ClientType[];
}

export const AgregarRQModal = ({ onClose, updateRQData, estadoOptions, clientes, perfiles }: Props) => {
    const [archivos, setArchivos] = useState<Archivo[]>([]);
    const { postData, postloading } = usePostHook();
    const [clienteSeleccionado, setClienteSeleccionado] = useState("");
    const [autogenRQ, setAutogenRQ] = useState(false);
    const [showValidationErrors, setShowValidationErrors] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        clearErrors,
        control,
        trigger,
        formState: { errors },
    } = useForm<newRQSchemaType>({
        resolver: zodResolver(newRQSchema),
        reValidateMode: 'onChange',
        defaultValues: {
            idCliente: 0,
            fechaSolicitud: "",
            descripcion: "",
            idEstado: 0,
            lstVacantes: [],
            lstArchivos: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lstVacantes"
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const nuevosArchivos = Array.from(event.target.files).map((file) => ({
                name: file.name,
                size: file.size,
                file,
            }));
            setArchivos((prevArchivos) => [...prevArchivos, ...nuevosArchivos]);
            setValue("lstArchivos", nuevosArchivos, { shouldValidate: true });
        }
    };

    const handleRemoveFile = (index: number) => {
        const updatedArchivos = archivos.filter((_, i) => i !== index);
        setArchivos(updatedArchivos);
        setValue("lstArchivos", updatedArchivos, { shouldValidate: true });
    };

    const handleClienteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedClienteId = Number(event.target.value);
        const selectedClienteText = clientes.find(cliente => cliente.idCliente === Number(selectedClienteId))?.razonSocial || "";
        setClienteSeleccionado(selectedClienteText);
        setValue("idCliente", selectedClienteId);
        clearErrors("idCliente");
    };

    const onSubmit: SubmitHandler<newRQSchemaType> = async (data) => {
        try {
            // 1. Transformar el estado a número
            const idCliente = Number(data.idCliente);

            // 2. Transformar los archivos
            const lstArchivos = await Promise.all(
                data.lstArchivos?.map(async (archivo) => {
                    const base64 = await fileToBase64(archivo.file);
                    const { nombreArchivo, extensionArchivo } = getFileNameAndExtension(archivo.name);
                    const idTipoArchivo = getTipoArchivoId(extensionArchivo);
                    return {
                        string64: base64,
                        nombreArchivo,
                        extensionArchivo,
                        idTipoArchivo,
                    };
                }) || []
            );

            // 3. Crear el objeto final para enviar
            const payload = {
                ...data,
                idCliente: idCliente,
                codigoRQ: autogenRQ ? null : data.codigoRQ,
                cliente: clienteSeleccionado,
                estado: data.idEstado,
                lstArchivos,
            };

            console.log(payload);

            // 4. Enviar los datos al servidor
            // const response = await postData("/fmi/requirement/save", payload);

            // if (response.idTipoMensaje === 2) {
            //     onClose();
            //     updateRQData();
            // }
        } catch (error) {
            console.error("Error al transformar los datos:", error);
        }
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setShowValidationErrors(true);

        const isValid = await trigger();
        if (isValid) {
            await handleSubmit(onSubmit)();
        }
    };

    const hasVacantesErrors = (errors: any) => {
        if (errors.lstVacantes?.message) return true;

        if (errors.lstVacantes && Array.isArray(errors.lstVacantes)) {
            return errors.lstVacantes.some((vacanteError: any) => vacanteError);
        }

        return false;
    };

    const getVacantesErrorMessage = (errors: any) => {
        if (errors.lstVacantes?.message) return errors.lstVacantes.message;
        return "Hay errores en las vacantes. Revise los campos marcados.";
    };

    const allQuantities = useWatch({
        control,
        name: 'lstVacantes',
        defaultValue: []
    });

    const totalVacantes = useMemo(() => {
        return (allQuantities || []).reduce(
            (total, vacante) => total + (vacante?.cantidad || 0),
            0
        );
    }, [allQuantities]);

    const circleClass = useMemo(() => {
        if (totalVacantes > 99) return 'w-8 h-8 text-xs';
        if (totalVacantes > 9) return 'w-7 h-7 text-sm';
        return 'w-6 h-6 text-sm';
    }, [totalVacantes]);

    return (
        <>
            {(postloading) && (<Loading overlayMode={true} />)}
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
                <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[90%] lg:w-[1000px] min-h-[570px] overflow-y-auto relative">
                    <h2 className="text-lg font-bold mb-2">Agregar Nuevo RQ</h2>
                    <button type="button" onClick={onClose} className="absolute top-4 right-4 focus:outline-none">
                        <img src="/assets/ic_close_x_fmi.svg" alt="icon close" className="w-6 h-6" />
                    </button>
                    <Tabs
                        showErrors={showValidationErrors}
                        tabs={[
                            {
                                label: "Datos RQ",
                                children: <form onSubmit={handleFormSubmit} className="space-y-4">
                                    <div className="max-h-[42vh] overflow-y-auto pr-2">
                                        <div className="space-y-4 flex-1">
                                            {/* Cliente */}
                                            <div className="flex items-center">
                                                <label className="w-1/3 text-sm font-medium text-gray-700">Cliente:</label>
                                                <select
                                                    {...register("idCliente", { valueAsNumber: true })}
                                                    onChange={handleClienteChange}
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                                                >
                                                    {clientes.map((cliente) => (
                                                        <option key={cliente.idCliente} value={cliente.idCliente}>
                                                            {cliente.razonSocial}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.idCliente && (
                                                <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.idCliente.message}</p>
                                            )}

                                            {/* Código RQ */}
                                            <div className="flex items-center">
                                                <label className="w-1/3 text-sm font-medium text-gray-700">Código RQ:</label>
                                                <input
                                                    {...register("codigoRQ")}
                                                    disabled={autogenRQ}
                                                    className={`w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5] ${autogenRQ ? "text-zinc-500" : ""}`}
                                                />
                                            </div>
                                            {errors.codigoRQ && (
                                                <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.codigoRQ.message}</p>
                                            )}

                                            {/* Auto Gen RQ */}
                                            <div className="flex items-center">
                                                <label className="w-1/3 text-sm font-medium text-gray-700">Autogenerar RQ:</label>
                                                <input
                                                    {...register("autogenRQ")}
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        setAutogenRQ(e.target.checked);
                                                        clearErrors("codigoRQ");
                                                    }}
                                                    className="input-checkbox"
                                                />
                                            </div>
                                            {errors.autogenRQ && (
                                                <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.autogenRQ.message}</p>
                                            )}

                                            {/* Fecha de Solicitud */}
                                            <div className="flex items-center">
                                                <label className="w-1/3 text-sm font-medium text-gray-700">Fecha de Solicitud:</label>
                                                <input
                                                    type="date"
                                                    {...register("fechaSolicitud")}
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                                                />
                                            </div>
                                            {errors.fechaSolicitud && (
                                                <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.fechaSolicitud.message}</p>
                                            )}

                                            {/* Descripción */}
                                            <div className="flex items-center">
                                                <label className="w-1/3 text-sm font-medium text-gray-700">Descripción:</label>
                                                <textarea
                                                    {...register("descripcion")}
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5] resize-none"
                                                />
                                            </div>
                                            {errors.descripcion && (
                                                <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.descripcion.message}</p>
                                            )}

                                            {/* Estado */}
                                            <div className="flex items-center">
                                                <label className="w-1/3 text-sm font-medium text-gray-700">Estado:</label>
                                                <select
                                                    {...register("idEstado", { valueAsNumber: true })}
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                                                >
                                                    {estadoOptions.map((option) => (
                                                        <option key={option.num1} value={option.num1}>
                                                            {option.string1}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.idEstado && (
                                                <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.idEstado.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Archivos */}
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">Archivos elegidos:</label>
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById("fileInput")?.click()}
                                                className="btn btn-text"
                                            >
                                                Elegir archivos
                                            </button>
                                        </div>

                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="fileInput"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        />

                                        <div className="mt-2 max-h-20 overflow-y-auto">
                                            {archivos.map((archivo, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-md mb-1"
                                                >
                                                    <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                                                        {archivo.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile(index)}
                                                        className="text-red-500 hover:text-red-600 focus:outline-none"
                                                    >
                                                        <img src="/assets/ic_remove_fmi.svg" alt="icon close" className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.lstArchivos && (
                                            <p className="text-red-500 text-sm mt-1">{errors.lstArchivos.message}</p>
                                        )}
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex justify-end space-x-4 mt-6">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            Agregar RQ
                                        </button>
                                    </div>
                                </form>
                            },
                            {
                                label: (
                                    <p className="flex items-center gap-2">
                                        Vacantes
                                        <span className={`inline-flex items-center justify-center rounded-full bg-[var(--color-blue)] text-white ${circleClass}`}>
                                            {totalVacantes}
                                        </span>
                                    </p>
                                ),
                                hasError: hasVacantesErrors(errors) || fields.length === 0,
                                errorMessage: fields.length === 0
                                    ? "Debe agregar 1 vacante como mínimo"
                                    : getVacantesErrorMessage(errors),
                                children: (
                                    <div className="p-1">
                                        <div className="table-container">
                                            <div className="table-wrapper">
                                                <table className="table">
                                                    <thead>
                                                        <tr className="table-header">
                                                            <th scope="col" className="table-header-cell">Perfil profesional</th>
                                                            <th scope="col" className="table-header-cell">Cantidad</th>
                                                            <th scope="col" className="table-header-cell"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {fields.length <= 0 ? (
                                                            <tr>
                                                                <td colSpan={3} className="table-empty">
                                                                    No hay vacantes disponibles.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            fields.map((field, index) => (
                                                                <tr key={field.id} className="table-row">
                                                                    <td className="table-cell">
                                                                        <select
                                                                            {...register(`lstVacantes.${index}.idPerfil`, { valueAsNumber: true })}
                                                                            className="h-10 px-4 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                                                                            defaultValue={field.idPerfil}
                                                                        >
                                                                            <option value={0}>Seleccione un perfil</option>
                                                                            {perfiles.map((perfil) => (
                                                                                <option key={perfil.num1} value={perfil.num1}>
                                                                                    {perfil.string1}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        {errors.lstVacantes?.[index]?.idPerfil && (
                                                                            <p className="text-red-500 text-xs mt-1">
                                                                                {errors.lstVacantes[index]?.idPerfil?.message}
                                                                            </p>
                                                                        )}
                                                                    </td>
                                                                    <td className="table-cell">
                                                                        <div className="flex">
                                                                            <div className="flex flex-col gap-1 relative">
                                                                                <NumberInput<newRQSchemaType>
                                                                                    register={register}
                                                                                    control={control}
                                                                                    name={`lstVacantes.${index}.cantidad`}
                                                                                    defaultValue={1}
                                                                                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                                                                                />
                                                                                {errors.lstVacantes?.[index]?.cantidad && (
                                                                                    <p className="text-red-500 text-xs mt-1 absolute -bottom-5">
                                                                                        {errors.lstVacantes[index]?.cantidad?.message}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                className="ms-4 text-xl text-red-500 hover:text-red-700"
                                                                                onClick={() => remove(index)}
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="my-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-blue"
                                                    onClick={() => append({ idPerfil: 0, cantidad: 1 })}
                                                >
                                                    Agregar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>
            </div>
        </>
    );
};