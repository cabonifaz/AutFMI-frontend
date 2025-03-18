import React, { useState } from "react";
import { ParamType } from "../../models/type/ParamType";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newRQSchema, newRQSchemaType } from "../../models/schema/NewRQSchema";
import { fileToBase64, getFileNameAndExtension, getTipoArchivoId } from "../../utils/util";
import { usePostHook } from "../../hooks/usePostHook";
import Loading from "../loading/Loading";

interface Archivo {
    name: string;
    size: number;
    file: File;
}

interface Props {
    onClose: () => void;
    updateRQList: () => void;
    estadoOptions: ParamType[];
}

export const AgregarRQModal = ({ onClose, updateRQList, estadoOptions }: Props) => {
    const [archivos, setArchivos] = useState<Archivo[]>([]);
    const { postData, postloading } = usePostHook();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<newRQSchemaType>({
        resolver: zodResolver(newRQSchema),
        defaultValues: {
            cliente: "",
            fechaSolicitud: "",
            descripcion: "",
            estado: "pendiente",
            vacantes: 0,
            lstArchivos: [],
        },
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

    const onSubmit: SubmitHandler<newRQSchemaType> = async (data) => {
        try {
            // 1. Transformar el estado a número
            const estadoNumber = Number(data.estado);

            // 2. Transformar los archivos
            const lstArchivos = await Promise.all(
                data.lstArchivos.map(async (archivo) => {
                    const base64 = await fileToBase64(archivo.file);
                    const { nombreArchivo, extensionArchivo } = getFileNameAndExtension(archivo.name);
                    const idTipoArchivo = getTipoArchivoId(extensionArchivo);
                    return {
                        string64: base64,
                        nombreArchivo,
                        extensionArchivo,
                        idTipoArchivo,
                    };
                })
            );

            // 3. Crear el objeto final para enviar
            const payload = {
                ...data,
                estado: estadoNumber,
                lstArchivos,
            };

            // 4. Enviar los datos al servidor
            const response = await postData("/fmi/requirement/save", payload);

            if (response.idTipoMensaje === 2) {
                onClose();
                updateRQList();
            }
        } catch (error) {
            console.error("Error al transformar los datos:", error);
        }
    };

    return (
        <>
            {postloading && (<Loading />)}
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Agregar Nuevo RQ</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Cliente */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cliente:</label>
                            <input
                                {...register("cliente")}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.cliente && (
                                <p className="text-red-500 text-sm mt-1">{errors.cliente.message}</p>
                            )}
                        </div>

                        {/* Cod. RG */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Código RQ:</label>
                            <input
                                {...register("codigoRQ")}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.codigoRQ && (
                                <p className="text-red-500 text-sm mt-1">{errors.codigoRQ.message}</p>
                            )}
                        </div>

                        {/* Fecha de Solicitud */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha de Solicitud:</label>
                            <input
                                type="date"
                                {...register("fechaSolicitud")}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.fechaSolicitud && (
                                <p className="text-red-500 text-sm mt-1">{errors.fechaSolicitud.message}</p>
                            )}
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descripción:</label>
                            <textarea
                                {...register("descripcion")}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                            {errors.descripcion && (
                                <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>
                            )}
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Estado:</label>
                            <select
                                {...register("estado")}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                {estadoOptions.map((option) => (
                                    <option key={option.num1} value={option.num1}>
                                        {option.string1}
                                    </option>
                                ))}
                            </select>
                            {errors.estado && (
                                <p className="text-red-500 text-sm mt-1">{errors.estado.message}</p>
                            )}
                        </div>

                        {/* Vacantes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Vacantes:</label>
                            <input
                                type="number"
                                {...register("vacantes", { valueAsNumber: true })}
                                onFocus={(e) => e.target.select()}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.vacantes && (
                                <p className="text-red-500 text-sm mt-1">{errors.vacantes.message}</p>
                            )}
                        </div>

                        {/* Archivos */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Archivos elegidos:</label>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById("fileInput")?.click()}
                                    className="text-blue-500 hover:text-blue-600 focus:outline-none"
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

                            <div className="mt-2 max-h-32 overflow-y-auto">
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
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#009688] text-white rounded-md hover:bg-[#359c92]"
                            >
                                Agregar RQ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};