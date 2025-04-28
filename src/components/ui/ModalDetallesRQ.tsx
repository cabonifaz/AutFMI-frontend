import { useEffect, useMemo, useState } from "react";
import { ParamType } from "../../models/type/ParamType";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePostHook } from "../../hooks/usePostHook";
import { Tabs } from "./Tabs";
import { RequirementItem } from "../../models/type/RequirementItemType";
import { useFetchRequirement } from "../../hooks/useFetchRequirement";
import { format } from 'date-fns';
import { ClientType } from "../../models/type/ClientType";
import { useDeleteHook } from "../../hooks/useDeleteHook";
import { addFilesSchema, AddFilesSchemaType } from "../../models/schema/AddFileSchema";
import { fileToBase64, getFileNameAndExtension, getTipoArchivoId } from "../../utils/util";
import { Loading } from "./Loading";
import { UpdateBaseRQSchema, UpdateBaseRQSchemaType } from "../../models/schema/UpdateBaseRQSchema";
import { ReqContacto } from "../../models/type/ReqContacto";
import { ModalRQContact } from "./ModalRQContact";
import { DropdownForm } from "../forms";
import { NumberInput } from "../forms/NumberInput";
import { useParams } from "../../context/ParamsContext";
import { DURACION_RQ, MODALIDAD_RQ } from "../../utils/config";

interface Archivo {
    idRequerimientoArchivo: number;
    name: string;
    size: number;
    file: File;
}

interface Props {
    onClose: () => void;
    updateRQData: () => void;
    RQ: RequirementItem | null;
    estadoOptions: ParamType[];
    clientes: ClientType[];
}

export const ModalDetallesRQ = ({ onClose, updateRQData, estadoOptions, RQ, clientes }: Props) => {
    const [archivos, setArchivos] = useState<Archivo[]>([]);
    const [isEditingRQData, setIsEditingRQData] = useState(false);
    const [isEditingGestionData, setIsEditingGestionData] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState("");

    const { postData, postloading } = usePostHook();
    const { requirement, loading: reqLoading, fetchRequirement } = useFetchRequirement(RQ?.idRequerimiento || null);
    const { deleteData, deleteLoading } = useDeleteHook();

    const [isModalRQContactOPen, setIsModalRQContactOPen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [contactToEdit, setContactToEdit] = useState<ReqContacto | null>(null);

    const { paramsByMaestro, loading: paramLoading } = useParams(`${DURACION_RQ}, ${MODALIDAD_RQ}`);

    const duracionRQ = paramsByMaestro[DURACION_RQ] || [];
    const modalidadRQ = paramsByMaestro[MODALIDAD_RQ] || [];

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        clearErrors,
        control,
        formState: { errors },
    } = useForm<UpdateBaseRQSchemaType>({
        resolver: zodResolver(UpdateBaseRQSchema),
        defaultValues: {
            idCliente: 0,
            fechaSolicitud: "",
            descripcion: "",
            idEstado: 0,
            lstVacantes: [],
            lstArchivos: [],
        },
    });

    const {
        handleSubmit: handleSubmitFiles,
        setValue: setValueFiles,
    } = useForm<AddFilesSchemaType>({
        resolver: zodResolver(addFilesSchema),
        defaultValues: {
            lstArchivos: [],
        },
    });

    useEffect(() => {
        if (requirement) {
            setValue("idCliente", requirement.requerimiento.idCliente);
            setValue("codigoRQ", requirement.requerimiento.codigoRQ);
            setValue("fechaSolicitud", format(new Date(requirement.requerimiento.fechaSolicitud), 'yyyy-MM-dd'));
            setValue("fechaVencimiento", format(new Date(requirement.requerimiento.fechaVencimiento), 'yyyy-MM-dd'));
            setValue("duracion", String(requirement.requerimiento.duracion));
            setValue("idDuracion", requirement.requerimiento.idDuracion);
            setValue("idModalidad", requirement.requerimiento.idModalidad);
            setValue("descripcion", requirement.requerimiento.descripcion);
            setValue("idEstado", requirement.requerimiento.idEstado);
            setClienteSeleccionado(requirement.requerimiento.cliente);

            const archivosFormateados = requirement.requerimiento.lstRqArchivo.map((archivo) => ({
                idRequerimientoArchivo: archivo.idRequerimientoArchivo,
                name: archivo.nombreArchivo,
                size: 0,
                file: new File([], archivo.nombreArchivo),
            }));

            setArchivos(archivosFormateados);
            setValueFiles("lstArchivos", archivosFormateados);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requirement, setValue, setValueFiles]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const nuevosArchivos = Array.from(event.target.files).map((file) => ({
                idRequerimientoArchivo: 0,
                name: file.name,
                size: file.size,
                file,
            }));

            setArchivos((prevArchivos) => [...prevArchivos, ...nuevosArchivos]);
            setValueFiles("lstArchivos", nuevosArchivos, { shouldValidate: true });
        }
    };

    const handleRemoveFile = async (index: number, idArchivo: number) => {
        const updatedArchivos = archivos.filter((_, i) => i !== index);

        if (idArchivo !== 0) {
            const deleteResponse = await deleteData(`/fmi/requirement/file/remove?idRqFile=${idArchivo}`);

            if (deleteResponse.idTipoMensaje === 2) {
                fetchRequirement();
            }
            return;
        }
        setArchivos(updatedArchivos);
        setValueFiles("lstArchivos", updatedArchivos, { shouldValidate: true });
    };

    const handleClienteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedClienteId = Number(event.target.value);
        const selectedClienteText = clientes.find(cliente => cliente.idCliente === Number(selectedClienteId))?.razonSocial || "";
        setClienteSeleccionado(selectedClienteText);
        setValue("idCliente", selectedClienteId);
        fetchRequirement();
    };

    const onSubmitAddFiles: SubmitHandler<AddFilesSchemaType> = async (data) => {
        if (RQ) {
            // new files only
            const nuevosArchivos = data.lstArchivos.filter((archivo) => archivo.idRequerimientoArchivo === 0);

            const lstArchivos = await Promise.all(
                nuevosArchivos.map(async (archivo) => {
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

            const payload = {
                idRequerimiento: RQ.idRequerimiento,
                lstArchivos,
            }

            const response = await postData("/fmi/requirement/file/save", payload);
            if (response.idTipoMensaje === 2) {
                fetchRequirement();
            }
        }
    };

    const onSubmit: SubmitHandler<UpdateBaseRQSchemaType> = async (data) => {
        try {
            const idCliente = Number(data.idCliente);

            const { lstArchivos, lstVacantes, autogenRQ, ...cleanData } = data;

            if (RQ) {
                const payload = {
                    ...cleanData,
                    idRequerimiento: RQ.idRequerimiento,
                    idCliente: idCliente,
                    cliente: clienteSeleccionado,
                    estado: data.idEstado,
                    duracion: Number(data.duracion),
                };

                const response = await postData("/fmi/requirement/update", payload);

                if (response.idTipoMensaje === 2) {
                    onClose();
                    updateRQData();
                }
            }
        } catch (error) {
            console.error("Error al transformar los datos:", error);
        }
    };

    const handleEditClick = () => {
        setIsEditingRQData((prev) => !prev);
    };

    const handleEditGestionClick = () => {
        setIsEditingGestionData((prev) => !prev);
    }

    const handleCancelClick = () => {
        setIsEditingRQData(false);
        onClose();
    };

    const newFiles = archivos.some((archivo) => archivo.idRequerimientoArchivo === 0);
    const totalVacantes = requirement?.requerimiento.lstRqVacantes.reduce((total, vacante) => total + (vacante?.cantidad || 0), 0) || 0;

    const circleClass = useMemo(() => {
        if (totalVacantes > 99) return 'w-8 h-8 text-xs';
        if (totalVacantes > 9) return 'w-7 h-7 text-sm';
        return 'w-6 h-6 text-sm';
    }, [totalVacantes]);

    const handleContactAdded = () => {
        fetchRequirement();
        setIsModalRQContactOPen(false);
        setContactToEdit(null);
        setModalMode("add");
    }

    const handleContactUpdated = () => {
        fetchRequirement();
        setIsModalRQContactOPen(false);
        setContactToEdit(null);
        setModalMode("add");
    }

    const handleAddContact = () => {
        setModalMode("add");
        setContactToEdit(null);
        setIsModalRQContactOPen(true);
    }

    const handleEditContact = (contact: ReqContacto) => {
        setModalMode("edit");
        setContactToEdit(contact);
        setIsModalRQContactOPen(true);
    }

    return (
        <>
            {(postloading || deleteLoading) && <Loading overlayMode={true} />}
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
                <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[90%] lg:w-[1000px] h-[530px] overflow-y-auto relative">
                    <h2 className="text-lg font-bold mb-2">Detalles RQ</h2>
                    <button type="button" onClick={onClose} className="absolute top-4 right-4 focus:outline-none">
                        <img src="/assets/ic_close_x_fmi.svg" alt="icon close" className="w-6 h-6" />
                    </button>
                    <Tabs
                        isDataLoading={reqLoading}
                        tabs={[
                            {
                                label: "Datos RQ",
                                children: (
                                    <div>
                                        {reqLoading ? (<p className="text-gray-500 text-center">Cargando Requerimiento...</p>) : (
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
                                                    {/* Código RQ */}
                                                    <div className="flex items-center">
                                                        <label className="w-1/3 text-sm font-medium text-gray-700">Código RQ:</label>
                                                        <input
                                                            {...register("codigoRQ")}
                                                            disabled={!isEditingRQData}
                                                            className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
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
                                                            disabled={!isEditingRQData}
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
                                                            disabled={!isEditingRQData}
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
                                                            {...register("idEstado")}
                                                            disabled={!isEditingRQData}
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

                                                    {/* Fecha Vencimiento */}
                                                    <div className="flex items-center">
                                                        <label className="w-1/3 text-sm font-medium text-gray-700">Fecha Vencimiento:</label>
                                                        <input
                                                            type="date"
                                                            {...register("fechaVencimiento")}
                                                            id="fechaVencimiento"
                                                            className="input w-2/3"
                                                            disabled={!isEditingRQData}
                                                        />
                                                    </div>
                                                    {errors.fechaVencimiento && (
                                                        <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.fechaVencimiento.message}</p>
                                                    )}
                                                </div>

                                                {/* Botones de acción */}
                                                <div className="flex justify-end space-x-4 mt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={!isEditingRQData && !isEditingGestionData}
                                                        className={`btn ${isEditingRQData || isEditingGestionData ? "btn-primary" : "btn-disabled"}`}
                                                    >
                                                        Actualizar
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>

                                ),
                            },
                            {
                                label: "Cliente",
                                children: (
                                    <>
                                        {/* Cliente */}
                                        <div className="flex items-center">
                                            <label className="text-sm font-medium text-gray-700">Cliente:</label>
                                            <select
                                                {...register("idCliente", { valueAsNumber: true })}
                                                disabled={true}
                                                aria-readonly={true}
                                                className="px-3 py-2 border-none outline-none appearance-none"
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

                                        <div className="flex items-center justify-between">
                                            <h2 className="text-sm font-medium text-gray-700">Lista de contactos</h2>
                                            <button
                                                type="button"
                                                onClick={handleAddContact}
                                                disabled={getValues("idCliente") === 0}
                                                className={`btn text-sm font-medium ${getValues("idCliente") === 0 ? "btn-disabled" : "btn-blue"}`}>
                                                Añadir contacto
                                            </button>
                                        </div>

                                        <div className="mt-4 max-h-[30vh] overflow-y-auto">
                                            <div className="table-container">
                                                <div className="table-wrapper">
                                                    <table className="table">
                                                        <thead>
                                                            <tr className="table-header">
                                                                <th scope="col" className="table-header-cell">ID</th>
                                                                <th scope="col" className="table-header-cell">Nombres</th>
                                                                <th scope="col" className="table-header-cell">Apellidos</th>
                                                                <th scope="col" className="table-header-cell">Celular</th>
                                                                <th scope="col" className="table-header-cell">Correo</th>
                                                                <th scope="col" className="table-header-cell">Cargo</th>
                                                                <th scope="col" className="table-header-cell">Asignado</th>
                                                                <th scope="col" className="table-header-cell"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(requirement?.requerimiento?.lstRqContactos || []).length <= 0 ? (
                                                                <tr>
                                                                    <td colSpan={8} className="table-empty">
                                                                        No hay contactos disponibles.
                                                                    </td>
                                                                </tr>
                                                            ) : (requirement?.requerimiento?.lstRqContactos?.map((contacto) => (
                                                                <tr key={contacto.idClienteContacto} className="table-row">
                                                                    <td className="table-cell">{contacto.idClienteContacto}</td>
                                                                    <td className="table-cell">{contacto.nombre}</td>
                                                                    <td className="table-cell">{contacto.apellidoPaterno + ' ' + contacto.apellidoMaterno}</td>
                                                                    <td className="table-cell">{contacto.telefono}</td>
                                                                    <td className="table-cell">{contacto.correo}</td>
                                                                    <td className="table-cell">{contacto.cargo}</td>
                                                                    <td className="table-cell">
                                                                        <input
                                                                            type="checkbox"
                                                                            name="contact-asig"
                                                                            id="contact-asig"
                                                                            checked={contacto.asignado === 1}
                                                                            readOnly={true}
                                                                            className="input-checkbox-readonly"
                                                                        />
                                                                    </td>
                                                                    <td className="table-cell">
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleEditContact(contacto)}
                                                                                className="w-7 h-7">
                                                                                <img src="/assets/ic_edit.svg" alt="edit icon" />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )
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
                                children: (
                                    <div className="p-1">
                                        <div className="table-container">
                                            <div className="table-wrapper">
                                                <table className="table">
                                                    <thead>
                                                        <tr className="table-header">
                                                            <th scope="col" className="table-header-cell">ID</th>
                                                            <th scope="col" className="table-header-cell">Perfil profesional</th>
                                                            <th scope="col" className="table-header-cell">Cantidad</th>
                                                            <th scope="col" className="table-header-cell"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {requirement?.requerimiento.lstRqVacantes.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} className="table-empty">
                                                                    No hay vacantes disponibles.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            requirement?.requerimiento.lstRqVacantes.map((vacante) => (
                                                                <tr key={vacante.idRequerimientoVacante} className="table-row">
                                                                    <td className="table-cell">{vacante.idRequerimientoVacante}</td>
                                                                    <td className="table-cell">{vacante.perfilProfesional}</td>
                                                                    <td className="table-cell">{vacante.cantidad}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                label: "Archivos",
                                children: (
                                    <div className="p-4 ">
                                        {/* Lista de archivos */}
                                        <div>
                                            <form onSubmit={handleSubmitFiles(onSubmitAddFiles)} className="flex flex-col">
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
                                                <div className="mt-2 max-h-80 overflow-y-auto">
                                                    {archivos.map((archivo, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-md mb-1"
                                                        >
                                                            <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                                                                {archivo.name}
                                                            </span>
                                                            {archivo.idRequerimientoArchivo === 0 && (
                                                                <span className="text-sm w-fit px-2 py-1 rounded-lg bg-green-100 text-green-700 truncate mr-2">
                                                                    Nuevo
                                                                </span>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveFile(index, archivo.idRequerimientoArchivo)}
                                                                className="text-red-500 hover:text-red-600 focus:outline-none"
                                                            >
                                                                <img src="/assets/ic_remove_fmi.svg" alt="icon close" className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={!newFiles}
                                                    className={`btn w-fit self-end mt-4 ${newFiles ? "btn-primary" : "btn-disabled"
                                                        }`}>
                                                    Agregar archivos nuevos
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                label: "Postulantes",
                                children: (
                                    <div className="p-1">
                                        <div className="table-container">
                                            <div className="table-wrapper">
                                                <table className="table">
                                                    <thead>
                                                        <tr className="table-header">
                                                            <th scope="col" className="table-header-cell">Nombres</th>
                                                            <th scope="col" className="table-header-cell">Apellidos</th>
                                                            <th scope="col" className="table-header-cell">Doc. Identidad</th>
                                                            <th scope="col" className="table-header-cell">Celular</th>
                                                            <th scope="col" className="table-header-cell">Email</th>
                                                            <th scope="col" className="table-header-cell">Situación</th>
                                                            <th scope="col" className="table-header-cell">Estado</th>
                                                            <th scope="col" className="table-header-cell">Perfil</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {requirement?.requerimiento.lstRqTalento.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={7} className="table-empty">
                                                                    No hay postulantes disponibles.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            requirement?.requerimiento.lstRqTalento.map((talento) => (
                                                                <tr key={talento.idTalento} className="table-row">
                                                                    <td className="table-cell">{talento.nombresTalento}</td>
                                                                    <td className="table-cell">{talento.apellidosTalento}</td>
                                                                    <td className="table-cell">{talento.dni}</td>
                                                                    <td className="table-cell">{talento.celular}</td>
                                                                    <td className="table-cell">{talento.email}</td>
                                                                    <td className="table-cell">{talento.situacion}</td>
                                                                    <td className="table-cell">
                                                                        <span className={`badge ${talento.estado?.toUpperCase() === 'ACEPTADO' ? 'badge-green' :
                                                                            talento.estado?.toUpperCase() === 'OBSERVADO' ? 'badge-yellow' :
                                                                                ''
                                                                            }`}>
                                                                            {(talento.estado || (talento.idEstado === 1 ? 'ACEPTADO' : 'OBSERVADO')).toUpperCase()}
                                                                        </span>
                                                                    </td>
                                                                    <td className="table-cell">{talento.perfil}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                label: "Gestión",
                                children: (
                                    <div className="px-4">
                                        <div className="flex justify-end mb-1">
                                            <button
                                                type="button"
                                                onClick={handleEditGestionClick}
                                                className="focus:outline-none"
                                            >
                                                <img src="/assets/ic_edit.svg" alt="Editar" className="w-7 h-7" />
                                            </button>
                                        </div>
                                        {/* <div className="flex items-center">
                                            <label className="w-1/3 text-sm font-medium text-gray-700">PPto:</label>
                                            <input
                                                type="text"
                                                placeholder="PPto"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                disabled
                                            />
                                        </div> */}
                                        <div className="flex items-center mb-6">
                                            <label className="w-1/3 text-sm font-medium text-gray-700">Duración:</label>
                                            <div className="flex gap-4 w-2/3">
                                                <div className="flex flex-col gap-1">
                                                    <NumberInput<UpdateBaseRQSchemaType>
                                                        register={register}
                                                        control={control}
                                                        name="duracion"
                                                        type="float"
                                                        defaultValue={1}
                                                        decimalPlaces={1}
                                                        disabled={!isEditingGestionData}
                                                        onChange={() => clearErrors(`duracion`)}
                                                        className="flex-1 max-h-12 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                                                    />
                                                    {errors.duracion && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.duracion.message}</p>
                                                    )}
                                                </div>
                                                <DropdownForm
                                                    name="idDuracion"
                                                    control={control}
                                                    error={errors.idDuracion}
                                                    required={false}
                                                    flex={true}
                                                    disabled={!isEditingGestionData}
                                                    options={duracionRQ.map((duracion) => ({ value: duracion.num1, label: duracion.string1 }))}
                                                />
                                            </div>

                                        </div>
                                        <div className="flex items-center">
                                            <label className="w-1/3 text-sm font-medium text-gray-700">Modalidad:</label>
                                            <DropdownForm
                                                name="idModalidad"
                                                control={control}
                                                error={errors.idModalidad}
                                                required={false}
                                                flex={true}
                                                disabled={!isEditingGestionData}
                                                options={modalidadRQ.map((modalidad) => ({ value: modalidad.num1, label: modalidad.string1 }))}
                                            />
                                        </div>
                                    </div>
                                )
                            },
                        ]}
                    />
                </div>
            </div>

            {
                isModalRQContactOPen && (
                    <ModalRQContact
                        onClose={() => setIsModalRQContactOPen(false)}
                        RQState="existing"
                        onContactAdded={handleContactAdded}
                        onContactUpdated={handleContactUpdated}
                        modalMode={modalMode}
                        contact={contactToEdit}
                        idRQ={RQ?.idRequerimiento}
                        idCliente={getValues("idCliente")}
                    />
                )
            }
        </>
    );
};