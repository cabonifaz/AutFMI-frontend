import { useLocation, useNavigate } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { DataFormSchema, DataFormType } from "../models/schema/DataFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { DropdownForm, FormRow, InputForm } from "../components/forms";
import { TalentoType } from "../models/type/TalentoType";
import useFetchTalento from "../hooks/useFetchTalento";
import Loading from "../components/loading/Loading";
import { useEffect } from "react";
import { usePostHook } from "../hooks/usePostHook";
import useFetchParams from "../hooks/useFetchParams";
import { TIPO_MODALIDAD, TIPO_MONEDA, TIPO_TIEMPO } from "../utils/config";
import { formatDateToDMY } from "../utils/util";
import BackButton from "../components/ui/BackButton";

const PantallaDatos = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { postData, postloading } = usePostHook();
    const { params, paramLoading } = useFetchParams(`${TIPO_TIEMPO}, ${TIPO_MONEDA}, ${TIPO_MODALIDAD}`);

    const timeValues = params?.filter((param) => param.idMaestro === Number(TIPO_TIEMPO));
    const currencyValues = params?.filter((param) => param.idMaestro === Number(TIPO_MONEDA));
    const modalityValues = params?.filter((param) => param.idMaestro === Number(TIPO_MODALIDAD));

    const { talento } = location.state as { talento: TalentoType } || {};
    const { talentoDetails, loading } = useFetchTalento(talento.idTalento);

    const goBack = () => navigate(-1);

    const { control, handleSubmit, formState: { errors, isDirty }, reset } = useForm<DataFormType>({
        resolver: zodResolver(DataFormSchema),
        mode: "onTouched",
        defaultValues: {
            nombres: "",
            apellidos: "",
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
                apellidos: talentoDetails?.apellidos || "",
                telefono: talentoDetails?.telefono || "",
                dni: talentoDetails?.dni || "",
                email: talentoDetails?.email || "",
                tiempoContrato: talentoDetails?.tiempoContrato || 0,
                idTiempoContrato: talentoDetails?.idTiempoContrato || 0,
                fechaInicioLabores: formatDateToDMY(talentoDetails?.fechaInicioLabores),
                cargo: talentoDetails?.cargo || "",
                remuneracion: talentoDetails?.remuneracion || 0,
                idMoneda: talentoDetails?.idMoneda || 0,
                idModalidad: talentoDetails?.idModalidad || 0,
                ubicacion: talentoDetails?.ubicacion || ""
            });
        }
    }, [talentoDetails, reset]);

    const saveData: SubmitHandler<DataFormType> = async (data) => {
        await postData("/fmi/talent/save", { idTalento: talento.idTalento, ...data });
    }

    return (
        <>
            {paramLoading && (<Loading />)}
            {loading && (<Loading />)}
            {postloading && (<Loading />)}
            <div className="w-2/4 h-screen m-auto p-4 border-2 rounded-lg">
                <h3 className="text-2xl font-semibold flex gap-2">
                    <BackButton backClicked={goBack} />
                    Datos Personales
                </h3>
                <hr className="my-4" />
                {/* Data form */}
                <form onSubmit={handleSubmit(saveData)} className="flex flex-col gap-8">
                    <InputForm name="nombres" control={control} label="Nombres" error={errors.nombres} />
                    <InputForm name="apellidos" control={control} label="Apellidos" error={errors.apellidos} />
                    <InputForm name="telefono" control={control} label="Contacto" error={errors.telefono} />
                    <InputForm name="dni" control={control} label="DNI" type="text" error={errors.dni} />
                    <InputForm name="email" control={control} label="Correo personal" error={errors.email} />

                    <FormRow>
                        <InputForm name="tiempoContrato" control={control} label="Tiempo contrato" type="number" isWide={true} error={errors.tiempoContrato} />
                        <DropdownForm name="idTiempoContrato" control={control} error={errors.idTiempoContrato}
                            options={timeValues?.map((time) => ({ value: time.num1, label: time.string1 })) || []}
                        />
                    </FormRow>

                    <InputForm name="fechaInicioLabores" control={control} label="Inicio de labores" type="date" error={errors.fechaInicioLabores} />
                    <InputForm name="cargo" control={control} label="Cargo" type="text" error={errors.cargo} />

                    <FormRow>
                        <InputForm name="remuneracion" control={control} label="Remuneración" type="number" isWide={true} error={errors.remuneracion} />
                        <DropdownForm name="idMoneda" control={control} error={errors.idMoneda}
                            options={currencyValues?.map((currency) => ({ value: currency.num1, label: currency.string1 })) || []}
                        />
                    </FormRow>

                    <DropdownForm name="idModalidad" control={control} label="Modalidad" error={errors.idModalidad}
                        options={modalityValues?.map((modality) => ({ value: modality.num1, label: modality.string1 })) || []}
                    />
                    <InputForm name="ubicacion" control={control} label="Ubicación" error={errors.ubicacion} />

                    {/* Form options */}
                    <hr />
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

export default PantallaDatos;
