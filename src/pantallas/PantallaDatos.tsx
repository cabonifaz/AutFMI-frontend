import { useLocation, useNavigate } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { DataFormSchema, DataFormType } from "../models/schema/DataFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { DropdownForm, FormRow, InputForm } from "../components/forms";
import { TalentoType } from "../models/type/TalentoType";
import useFetchTalento from "../hooks/useFetchTalento";
import { useEffect } from "react";
import { usePostHook } from "../hooks/usePostHook";
import { TIPO_MODALIDAD, TIPO_MONEDA, TIPO_TIEMPO } from "../utils/config";
import { formatDateToDMY } from "../utils/util";
import BackButton from "../components/ui/BackButton";
import { Loading } from "../components/ui/Loading";
import { useParams } from "../context/ParamsContext";

const PantallaDatos = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { postData, postloading } = usePostHook();
    const { paramsByMaestro, loading: paramLoading } = useParams(`${TIPO_TIEMPO},${TIPO_MONEDA},${TIPO_MODALIDAD}`);

    const timeValues = paramsByMaestro[TIPO_TIEMPO];
    const currencyValues = paramsByMaestro[TIPO_MONEDA];
    const modalityValues = paramsByMaestro[TIPO_MODALIDAD];

    const { talento } = location.state as { talento: TalentoType } || {};
    const { talentoDetails, loading } = useFetchTalento(talento.idTalento);

    const goBack = () => navigate(-1);

    const { control, handleSubmit, formState: { errors, isDirty }, reset } = useForm<DataFormType>({
        resolver: zodResolver(DataFormSchema),
        mode: "onChange",
        defaultValues: {
            nombres: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            telefono: "",
            dni: "",
            email: "",
            tiempoContrato: 0,
            idTiempoContrato: 0,
            fechaInicioLabores: "",
            cargo: "",
            remuneracion: 0,
            idMoneda: 0,
            idModalidad: 0,
            ubicacion: ""
        }
    });

    useEffect(() => {
        if (talentoDetails) {
            reset({
                nombres: talentoDetails?.nombres || "",
                apellidoPaterno: talentoDetails?.apellidoPaterno || "",
                apellidoMaterno: talentoDetails?.apellidoMaterno || "",
                telefono: talentoDetails?.celular || "",
                dni: talentoDetails?.dni || "",
                email: talentoDetails?.email || "",
                cargo: talentoDetails?.cargo || "",
                remuneracion: talentoDetails?.remuneracion || 0,
                idMoneda: talentoDetails?.idMoneda || 0,
            });
        }
    }, [talentoDetails, reset]);

    const saveData: SubmitHandler<DataFormType> = async (data) => {
        const response = await postData("/fmi/talent/save", { idTalento: talento.idTalento, APELLIDO_PATERNO: talento.apellidoPaterno, ...data });
        if (response.idTipoMensaje === 2) {
            goBack();
        }
    }

    return (
        <>
            {(paramLoading || loading || postloading) && (<Loading overlayMode={true} />)}
            <div className="w-full lg:w-[65%] m-auto p-4 border-2 rounded-lg my-8">
                {/* Data form */}
                <form onSubmit={handleSubmit(saveData)} className="flex flex-col gap-8">
                    <h3 className="text-2xl font-semibold flex gap-2">
                        <BackButton backClicked={goBack} />
                        Datos Personales
                    </h3>
                    <InputForm name="nombres" control={control} label="Nombres" error={errors.nombres} required={true} />
                    <InputForm name="apellidoPaterno" control={control} label="Apellido Paterno" error={errors.apellidoPaterno} required={true} />
                    <InputForm name="apellidoMaterno" control={control} label="Apellido Materno" error={errors.apellidoMaterno} required={false} />
                    <InputForm name="telefono" control={control} label="Contacto" error={errors.telefono} required={true} />
                    <InputForm name="dni" control={control} label="Doc. Identidad" type="text" error={errors.dni} required={true} />
                    <InputForm name="email" control={control} label="Correo personal" error={errors.email} required={true} />

                    <FormRow>
                        <InputForm name="tiempoContrato" control={control} label="Tiempo contrato" type="number" regex={/^\d*$/} error={errors.tiempoContrato} required={true} />
                        <DropdownForm name="idTiempoContrato" control={control} error={errors.idTiempoContrato}
                            options={timeValues?.map((time) => ({ value: time.num1, label: time.string1 })) || []}
                            flex={true}
                            required={true}
                        />
                    </FormRow>

                    <InputForm name="fechaInicioLabores" control={control} label="Inicio de labores" type="date" error={errors.fechaInicioLabores} required={true} />
                    <InputForm name="cargo" control={control} label="Cargo" type="text" error={errors.cargo} required={true} />

                    <FormRow>
                        <InputForm name="remuneracion" control={control} label="Remuneración" type="number" regex={/^\d*(\.\d{0,2})?$/} error={errors.remuneracion} required={true} />
                        <DropdownForm name="idMoneda" control={control} error={errors.idMoneda}
                            options={currencyValues?.map((currency) => ({ value: currency.num1, label: currency.string1 })) || []}
                            flex={true}
                            required={true}
                        />
                    </FormRow>

                    <DropdownForm name="idModalidad" control={control} label="Modalidad" error={errors.idModalidad}
                        options={modalityValues?.map((modality) => ({ value: modality.num1, label: modality.string1 })) || []}
                        required={true}
                    />
                    <InputForm name="ubicacion" control={control} label="Ubicación" error={errors.ubicacion} required={true} />

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

export default PantallaDatos;
