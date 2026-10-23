import { useLocation, useNavigate } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { DataFormSchema, DataFormType } from "../models/schema/DataFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputForm } from "../components/forms";
import { TalentoType } from "../models/type/TalentoType";
import useFetchTalento from "../hooks/useFetchTalento";
import { useEffect } from "react";
import { usePostHook } from "../hooks/usePostHook";
import BackButton from "../components/ui/BackButton";
import { Loading } from "../components/ui/Loading";

/**
 * Datos personales del talento observado en AsignarTalento. Los datos de
 * colaborador (contrato, remuneración, modalidad, ubicación) no se piden aquí:
 * se completan en el modal de confirmación.
 */
const PantallaDatos = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { postData, postloading } = usePostHook();

  const { talento } = (location.state as { talento: TalentoType }) || {};
  const { talentoDetails, loading } = useFetchTalento(talento.idTalento);

  const goBack = () => navigate(-1);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DataFormType>({
    resolver: zodResolver(DataFormSchema),
    mode: "onChange",
    defaultValues: {
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      telefono: "",
      dni: "",
      email: "",
      ubicacion: "",
    },
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
        ubicacion: talentoDetails?.ubicacion || "",
      });
    }
  }, [talentoDetails, reset]);

  const saveData: SubmitHandler<DataFormType> = async (data) => {
    const response = await postData("/fmi/talent/save", {
      idTalento: talento.idTalento,
      APELLIDO_PATERNO: talento.apellidoPaterno,
      ...data,
    });
    if (response.idTipoMensaje === 2) {
      goBack();
    }
  };

  return (
    <>
      {(loading || postloading) && <Loading overlayMode={true} />}
      <div className="w-full lg:w-[65%] m-auto p-4 border-2 rounded-lg my-8">
        {/* Data form */}
        <form onSubmit={handleSubmit(saveData)} className="flex flex-col gap-8">
          <h3 className="text-2xl font-semibold flex gap-2">
            <BackButton backClicked={goBack} />
            Datos Personales
          </h3>
          <InputForm
            name="nombres"
            control={control}
            label="Nombres"
            error={errors.nombres}
            required={true}
          />
          <InputForm
            name="apellidoPaterno"
            control={control}
            label="Apellido Paterno"
            error={errors.apellidoPaterno}
            required={true}
          />
          <InputForm
            name="apellidoMaterno"
            control={control}
            label="Apellido Materno"
            error={errors.apellidoMaterno}
            required={false}
          />
          <InputForm
            name="telefono"
            control={control}
            label="Contacto"
            error={errors.telefono}
            required={true}
          />
          <InputForm
            name="dni"
            control={control}
            label="Doc. Identidad"
            type="text"
            error={errors.dni}
            required={true}
          />
          <InputForm
            name="email"
            control={control}
            label="Correo personal"
            error={errors.email}
            required={true}
          />
          <InputForm
            name="ubicacion"
            control={control}
            label="Ubicación"
            error={errors.ubicacion}
            required={true}
          />

          {/* Form options */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              className="btn btn-outline-gray"
              onClick={goBack}
            >
              Cancelar
            </button>
            {/* Sin exigir cambios: un talento con datos personales completos que
                estaba Observado solo por los de colaborador pasa a Datos Completos al guardar */}
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PantallaDatos;
