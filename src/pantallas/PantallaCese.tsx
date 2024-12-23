import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TalentoType } from '../models/type/TalentoType';
import { OutFormSchema, OutFormType } from '../models/schema/OutFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import useFetchParams from '../hooks/useFetchParams';
import { usePostHook } from '../hooks/usePostHook';
import { MODALIDAD_LOC_SERVICIOS, MOTIVO_CESE, UNIDAD } from '../utils/config';
import Loading from '../components/loading/Loading';
import { DropdownForm, InputForm } from '../components/forms';
import BackButton from '../components/ui/BackButton';

const PantallaCese = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { talento } = location.state as { talento: TalentoType } || {};

    const { postData, postloading } = usePostHook();
    const { params, paramLoading } = useFetchParams(`${UNIDAD}, ${MOTIVO_CESE}`);

    const unitValues = params?.filter((param) => param.idMaestro === Number(UNIDAD));
    const reasonValues = params?.filter((param) => param.idMaestro === Number(MOTIVO_CESE));

    const goBack = () => navigate(-1);

    const { control, handleSubmit, formState: { errors, isDirty }, reset } = useForm<OutFormType>({
        resolver: zodResolver(OutFormSchema),
        mode: "onTouched",
        defaultValues: {
            nombres: "",
            apellidos: "",
            idUnidad: 0,
            empresa: "",
            idMotivo: 0,
            fchCese: ""
        }
    });

    useEffect(() => {
        if (talento) {
            reset({
                nombres: talento?.nombres || "",
                apellidos: talento?.apellidos || "",
            });
        }
    }, [talento, reset]);

    const onSubmit: SubmitHandler<OutFormType> = async (data) => {
        const response = await postData("/fmi/employee/contractTermination", {
            idUsuarioTalento: talento.idUsuarioTalento,
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
            <div className="w-[65%] h-screen m-auto p-4 border-2 rounded-lg">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                    {/* Talent Data */}
                    <h3 className="text-2xl font-semibold flex gap-2">
                        <BackButton backClicked={goBack} />
                        Datos del talento
                    </h3>
                    <hr className="my-2" />
                    <InputForm name="nombres" control={control} label="Nombres" error={errors.nombres} />
                    <InputForm name="apellidos" control={control} label="Apellidos" error={errors.apellidos} />

                    <DropdownForm name="idUnidad" control={control} label="Unidad" error={errors.idUnidad}
                        options={unitValues?.map((unit) => ({ value: unit.num1, label: unit.string1 })) || []}
                    />

                    {talento.modalidad === MODALIDAD_LOC_SERVICIOS && (<InputForm name="empresa" control={control} label="Empresa" error={errors.empresa} />)}

                    {/* CESE */}
                    <DropdownForm name="idMotivo" control={control} label="Motivo de cese" error={errors.idMotivo}
                        options={reasonValues?.map((reason) => ({ value: reason.num1, label: reason.string1 })) || []} />

                    <InputForm name="fchCese" control={control} label="Fecha de cese" error={errors.fchCese} type="date" />

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

export default PantallaCese;
