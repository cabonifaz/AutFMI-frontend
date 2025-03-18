import React, { useEffect, useState } from "react";
import { ParamType } from "../../models/type/ParamType";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newRQSchema, newRQSchemaType } from "../../models/schema/NewRQSchema";
import { fileToBase64, getFileNameAndExtension, getTipoArchivoId } from "../../utils/util";
import { usePostHook } from "../../hooks/usePostHook";
import { Tabs } from "./Tabs";
import { RequirementItem } from "../../models/type/RequirementItemType";
import { useFetchRequirement } from "../../hooks/useFetchRequirement";
import Loading from "../loading/Loading";
import { format } from 'date-fns';

interface Archivo {
    name: string;
    size: number;
    file: File;
}

interface Props {
    onClose: () => void;
    RQ: RequirementItem | null;
    estadoOptions: ParamType[];
}

export const ModalDetallesRQ = ({ onClose, estadoOptions, RQ }: Props) => {
    const [archivos, setArchivos] = useState<Archivo[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    const { postData, postloading } = usePostHook();
    const { requirement, loading } = useFetchRequirement(RQ?.idRequerimiento || null);

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

    useEffect(() => {
        if (requirement) {
            setValue("cliente", requirement.requerimiento.cliente);
            setValue("codigoRQ", requirement.requerimiento.codigoRQ);
            setValue("fechaSolicitud", format(new Date(requirement.requerimiento.fechaSolicitud), 'yyyy-MM-dd'));
            setValue("descripcion", requirement.requerimiento.descripcion);
            setValue("estado", requirement.requerimiento.estado.toString());
            setValue("vacantes", requirement.requerimiento.vacantes);

            const archivosFormateados = requirement.requerimiento.lstRqArchivo.map((archivo) => ({
                name: archivo.nombreArchivo,
                size: 0,
                file: new File([], archivo.nombreArchivo),
            }));
            setArchivos(archivosFormateados);
            setValue("lstArchivos", archivosFormateados);
        }
    }, [requirement, setValue]);

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
            const estadoNumber = Number(data.estado);

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

            const payload = {
                ...data,
                estado: estadoNumber,
                lstArchivos,
            };

            console.log("Datos transformados:", payload);

            // const response = await postData("/fmi/requirement/save", payload);

            // if (response.idTipoMensaje === 2) {
            //     onClose();
            // }
        } catch (error) {
            console.error("Error al transformar los datos:", error);
        }
    };

    const handleEditClick = () => {
        setIsEditing((prev) => !prev);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        onClose();
    };

    return (
        <>
            {loading && <Loading />}
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full md:w-[90%] lg:w-[800px] h-[720px] overflow-y-auto">
                    <Tabs
                        tabs={[
                            {
                                label: "Detalles RQ",
                                children: (
                                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleEditClick}
                                                className="focus:outline-none"
                                            >
                                                <img src="/assets/ic_edit.svg" alt="Editar" className="w-7 h-7" />
                                            </button>
                                        </div>

                                        {/* Campos del formulario */}
                                        <div className="space-y-4 flex-1">
                                            {/* Cliente */}
                                            <div className="flex items-center">
                                                <label className="w-1/3 text-sm font-medium text-gray-700">Cliente:</label>
                                                <input
                                                    {...register("cliente")}
                                                    disabled={!isEditing}
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            {errors.cliente && (
                                                <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.cliente.message}</p>
                                            )}

                                            {/* Código RQ */}
                                            <div className="flex items-center">
                                                <label className="w-1/3 text-sm font-medium text-gray-700">Código RQ:</label>
                                                <input
                                                    {...register("codigoRQ")}
                                                    disabled={!isEditing}
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            {errors.codigoRQ && (
                                                <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.codigoRQ.message}</p>
                                            )}

                                            {/* Fecha de Solicitud */}
                                            <div className="flex items-center">
                                                <label className="w-1/3 text-sm font-medium text-gray-700">Fecha de Solicitud:</label>
                                                <input
                                                    type="date"
                                                    {...register("fechaSolicitud")}
                                                    disabled={!isEditing}
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                                    disabled={!isEditing}
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                />
                                            </div>
                                            {errors.descripcion && (
                                                <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.descripcion.message}</p>
                                            )}

                                            {/* Estado */}
                                            <div className="flex items-center">
                                                <label className="w-1/3 text-sm font-medium text-gray-700">Estado:</label>
                                                <select
                                                    {...register("estado")}
                                                    disabled={!isEditing}
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    {estadoOptions.map((option) => (
                                                        <option key={option.num1} value={option.num1}>
                                                            {option.string1}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.estado && (
                                                <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.estado.message}</p>
                                            )}

                                            {/* Vacantes */}
                                            <div className="flex items-center">
                                                <label className="w-1/3 text-sm font-medium text-gray-700">Vacantes:</label>
                                                <input
                                                    type="number"
                                                    {...register("vacantes", { valueAsNumber: true })}
                                                    disabled={!isEditing}
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            {errors.vacantes && (
                                                <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.vacantes.message}</p>
                                            )}
                                        </div>

                                        {/* Lista de archivos */}
                                        <div className="mt-4 flex-1">
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
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="flex justify-end space-x-4 mt-4">
                                            <button
                                                type="button"
                                                onClick={handleCancelClick}
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 hover:text-white"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!isEditing}
                                                className="px-4 py-2 bg-[#009688] text-white rounded-md hover:bg-[#359c92]"
                                            >
                                                Actualizar
                                            </button>
                                        </div>
                                    </form>
                                ),
                            },
                            {
                                label: "Postulantes",
                                children: (
                                    <div className="p-4">
                                        <p>Lista de postulantes.</p>
                                    </div>
                                ),
                            },
                            {
                                label: "Otros",
                                children: (
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-center">
                                            <label className="w-1/3 text-sm font-medium text-gray-700">PPto:</label>
                                            <input
                                                type="text"
                                                placeholder="PPto"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                disabled
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="w-1/3 text-sm font-medium text-gray-700">Duración:</label>
                                            <input
                                                type="text"
                                                placeholder="Duración"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                disabled
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="w-1/3 text-sm font-medium text-gray-700">Moneda:</label>
                                            <input
                                                type="text"
                                                placeholder="Moneda"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>
            </div>
        </>
    );
};