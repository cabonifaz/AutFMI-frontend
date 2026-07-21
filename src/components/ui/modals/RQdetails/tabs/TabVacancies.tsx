import { GraduationCap, Pencil, Trash2, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { UpdateBaseRQSchemaType } from "../../../../../models/schema/UpdateBaseRQSchema";
import { Utils } from "../../../../../utils/utils";
import { Tarifa } from "../../../../../models/type/Tarifa";
import { showWarningSnack } from "../ui.helpers";

import { ModalDetailsVacSkills } from "../../../ModalDetailVacSkill";
import { useModal } from "../../../../../context/ModalContext";
import { enqueueSnackbar } from "notistack";
import { NumberInput } from "../../../../forms/NumberInput";
import { ReqVacante } from "../../../../../models/type/ReqVacante";
import { ModalDetailsVacCarreras } from "../../../ModalUpdateCareer";
import {
  HABILIDADES_TECNICAS,
  MODAL_DETAILS_VAC_SKILLS,
  MODAL_UPDATE_CAREER,
} from "../../../../../utils/config";
import { SearchableSelect } from "../../../SearchableSelect";

enum VacanteEstado {
  INICIAL = 0,
  NUEVO = 1,
  ACTUALIZADO = 2,
  ELIMINADO = 3,
}

interface TabProps {
  tariff: Tarifa[];
  vacancies: ReqVacante[];
  isEditing: boolean;
  availableTechSkills: { id: number; label: string }[];
  availableDegrees: { id: number; label: string }[];
  fetchRequirement: () => void;
  handleToggleEdit: () => void;
  refetchParams: (maestro: string) => void;
}

export const TabVacancies = ({
  tariff,
  vacancies,
  isEditing,
  availableTechSkills,
  availableDegrees,
  fetchRequirement,
  handleToggleEdit,
  refetchParams,
}: TabProps) => {
  // @marker base states
  const [, setVacQuant] = useState<string[]>([]);
  const [originQuant] = useState<string[]>([]);
  const { closeModal, isModalOpen, openModal } = useModal();
  const [idVac, setIdVac] = useState<number | undefined>();

  // @marker form handlers
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
    clearErrors,
    watch,
    control,
  } = useFormContext<UpdateBaseRQSchemaType>();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "lstVacantes",
  });

  useEffect(() => {
    const currentVacancies = getValues("lstVacantes");
    if (!currentVacancies || currentVacancies.length === 0) return;

    currentVacancies.forEach((vacante, index) => {
      if (vacante.idPerfil && tariff.length > 0) {
        const tarifaData = tariff.find(
          (item) => item.idPerfil === vacante.idPerfil
        );

        if (tarifaData) {
          const tarifa = tarifaData.tarifa.toFixed(2);
          const moneda = tarifaData.moneda || "S/.";
          setValue(
            `lstVacantes.${index}.tarifa`,
            `${moneda} ${Utils.formatCoin(Number(tarifa))}`
          );
        }
      }
    });
  }, [tariff, getValues, setValue]);

  const cVacancies = watch("lstVacantes");

  const getAvailableProfiles = () => {
    if (!tariff || tariff.length === 0) return [];
    return tariff;
  };

  const handleProfileChange = (index: number, value: string) => {
    const currentValue = getValues(`lstVacantes.${index}`);

    if (
      currentValue.idRequerimientoVacante > 0 &&
      currentValue.idEstado === 0
    ) {
      setValue(
        `lstVacantes.${index}.idEstado`,
        VacanteEstado.ACTUALIZADO
      );
    }

    const idPerfil = Number(value);

    setValue(`lstVacantes.${index}.idPerfil`, idPerfil);

    // Verificar si hay tarifario disponible
    if (tariff && tariff.length > 0) {
      const tarifa =
        tariff
          .find((item) => item.idPerfil === idPerfil)
          ?.tarifa.toFixed(2) || "-";

      const moneda =
        tariff.find((item) => item.idPerfil === idPerfil)?.moneda ||
        "S/.";

      const tarifaFinal =
        tariff.find((item) => item.idPerfil === idPerfil)?.tarifa ||
        0;

      setValue(`lstVacantes.${index}.tarifaFinal`, tarifaFinal);

      setValue(
        `lstVacantes.${index}.tarifa`,
        `${moneda} ${Utils.formatCoin(Number(tarifa))}`
      );
      setValue(
        `lstVacantes.${index}.tarifaInicial`,
        `${moneda} ${Utils.formatCoin(Number(tarifa))}`
      );
    } else {
      setValue(`lstVacantes.${index}.tarifa`, "S/. -");
    }

    clearErrors(`lstVacantes.${index}.idPerfil`);
  };

  const handleAddVacancy = () => {
    append({
      idPerfil: 0,
      cantidad: 1,
      idEstado: VacanteEstado.NUEVO,
      idRequerimientoVacante: 0,
      tarifaInicial: "-",
    });
    setVacQuant((prev) => [...prev, "1"]);
    clearErrors("lstVacantes");
  };

  const handleRemoveVacante = (index: number) => {
    const vacancies = getValues("lstVacantes").filter(
      (vacante) => vacante.idEstado !== VacanteEstado.ELIMINADO
    );

    if (vacancies.length === 1) {
      showWarningSnack(
        "El Requerimiento debe tener al menos un vacante."
      );
      return;
    }

    const vacancy = getValues(`lstVacantes.${index}`);

    if (vacancy.idRequerimientoVacante > 0) {
      update(index, {
        ...vacancy,
        idEstado: VacanteEstado.ELIMINADO,
      });

      setVacQuant((prev) => {
        const newCantidades = [...prev];
        newCantidades[index] = "0";
        return newCantidades;
      });
    } else {
      remove(index);
      setVacQuant((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const getTotalCareersForVacancy = (vacancyId: number) => {
    const vacancy = vacancies.find(
      (v) => v.idRequerimientoVacante === vacancyId
    );
    if (!vacancy) return 0;
    return vacancy.totalCarreras;
  };

  const getTotalSkillsForVacancy = (vacancyId: number) => {
    const vacancy = vacancies.find(
      (v) => v.idRequerimientoVacante === vacancyId
    );
    if (!vacancy) return 0;
    return vacancy.totalHabilidades;
  };

  const finalTariffChange = (value: string, index: number) => {
    const key =
      `lstVacantes.${index}.tarifaFinal` as keyof UpdateBaseRQSchemaType;
    const numValue = Number(value) || 0;
    const vacancy = getValues(`lstVacantes.${index}`);
    if (
      vacancy.idRequerimientoVacante > 0 &&
      vacancy.idEstado === VacanteEstado.INICIAL
    ) {
      setValue(
        `lstVacantes.${index}.idEstado`,
        VacanteEstado.ACTUALIZADO
      );
      setValue(key, numValue);
    }
    clearErrors(key);
  };

  // @marker skills modal
  /**Modal Skills close */
  const handleCloseModalSkills = () => {
    closeModal(MODAL_DETAILS_VAC_SKILLS);
    setIdVac(undefined);
    fetchRequirement();
  };
  const handleOpenModal = (idVac: number) => {
    if (!idVac || idVac === 0) {
      showWarningSnack(
        "Selecciona una y/o guarda la vacante para agregar habilidades técnicas."
      );
      return;
    }
    setIdVac(idVac);
    openModal(MODAL_DETAILS_VAC_SKILLS);
  };

  // @marker careers modal
  const closeModalCareers = () => {
    setIdVac(undefined);
    closeModal(MODAL_UPDATE_CAREER);
    fetchRequirement();
  };

  const openModalCareers = (idVac: number) => {
    if (!idVac || idVac === 0) {
      showWarningSnack(
        "Selecciona una y/o guarda vacante para agregar habilidades técnicas."
      );
      return;
    }
    setIdVac(idVac);
    openModal(MODAL_UPDATE_CAREER);
  };

  return (
    <>
      {isModalOpen(MODAL_DETAILS_VAC_SKILLS) && (
        <ModalDetailsVacSkills
          onClose={handleCloseModalSkills}
          availableSkills={availableTechSkills}
          refetchAvailableSkills={() =>
            refetchParams(`${HABILIDADES_TECNICAS}`)
          }
          idVac={idVac ?? 0}
        />
      )}
      {isModalOpen(MODAL_UPDATE_CAREER) && (
        <ModalDetailsVacCarreras
          idVac={idVac ?? 0}
          onClose={closeModalCareers}
          availableDegrees={availableDegrees}
        />
      )}
      <div className="flex flex-col h-[calc(570px-120px)]">
        <div className="flex items-center justify-between my-2">
          <button
            type="button"
            onClick={handleToggleEdit}
            className="focus:outline-none ms-2"
          >
            <Pencil className="w-7 h-7" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`focus:outline-none text-sm min-w-24 h-8 rounded-lg py-1 px-2 mx-1 ${
                isEditing ? "btn-blue cursor-pointer" : "btn-disabled"
              }`}
              onClick={handleAddVacancy}
              disabled={!isEditing}
            >
              Agregar
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scroll">
          <div className="table-container h-full">
            <div className="table-wrapper h-full overflow-y-auto custom-scroll">
              <table className="table">
                <thead>
                  <tr className="table-header">
                    <th className="table-header-cell">
                      Perfil profesional
                    </th>
                    <th className="table-header-cell">Cantidad</th>

                    <th className="table-header-cell">Tarifa Act.</th>
                    <th className="table-header-cell">
                      Tarifa inicial
                    </th>
                    <th className="table-header-cell">
                      Tarifa final
                    </th>
                    <th className="table-header-cell">Tipo tarifa</th>

                    <th className="table-header-cell text-center">
                      Otros
                    </th>
                    <th className="table-header-cell"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.length <= 0 ? (
                    <tr>
                      <td colSpan={4} className="table-empty">
                        No hay vacantes disponibles.
                      </td>
                    </tr>
                  ) : (
                    fields.map((field, index) => {
                      if (
                        field.idEstado === VacanteEstado.ELIMINADO
                      ) {
                        return (
                          <tr
                            key={`hidden-${field.id}-${index}`}
                            className="hidden"
                          >
                            {/* Campos ocultos pero presentes en el formulario */}
                            <input
                              type="hidden"
                              {...register(
                                `lstVacantes.${index}.idEstado`
                              )}
                              value={VacanteEstado.ELIMINADO}
                            />
                            <input
                              type="hidden"
                              {...register(
                                `lstVacantes.${index}.idPerfil`
                              )}
                              value={field.idPerfil}
                            />
                            <input
                              type="hidden"
                              {...register(
                                `lstVacantes.${index}.cantidad`
                              )}
                              value={field.cantidad}
                            />
                            {field.idRequerimientoVacante && (
                              <input
                                type="hidden"
                                {...register(
                                  `lstVacantes.${index}.idRequerimientoVacante`
                                )}
                                value={field.idRequerimientoVacante}
                              />
                            )}
                          </tr>
                        );
                      }

                      const availableProfiles = getAvailableProfiles();
                      const currentProfile =
                        cVacancies[index]?.idPerfil;

                      const tipoTarifa =
                        tariff.find(
                          (item) =>
                            item.idPerfil ===
                            getValues(`lstVacantes.${index}.idPerfil`)
                        )?.tipoTarifa || "-";

                      return (
                        <tr key={index} className="table-row">
                          <td className="table-cell">
                            <SearchableSelect
                              options={[
                                {
                                  value: 0,
                                  label: "Seleccione un perfil",
                                },
                                ...availableProfiles.map(
                                  (perfil: Tarifa) => ({
                                    value: perfil.idPerfil,
                                    label: perfil.perfil,
                                  })
                                ),
                              ]}
                              value={currentProfile || 0}
                              onChange={(value) => {
                                handleProfileChange(
                                  index,
                                  value.toString()
                                );
                                setValue(
                                  `lstVacantes.${index}.idPerfil`,
                                  Number(value)
                                );
                              }}
                              placeholder="Seleccione un perfil"
                              disabled={!isEditing}
                            />
                            {errors.lstVacantes?.[index]
                              ?.idPerfil && (
                              <p className="text-red-500 text-xs mt-1">
                                {
                                  errors.lstVacantes[index]?.idPerfil
                                    ?.message
                                }
                              </p>
                            )}
                          </td>
                          <td className="table-cell">
                            <div className="flex">
                              <div className="flex flex-col gap-1 relative w-32 ">
                                <NumberInput<UpdateBaseRQSchemaType>
                                  register={register}
                                  control={control}
                                  name={`lstVacantes.${index}.cantidad`}
                                  defaultValue={Number(
                                    originQuant[index] || 1
                                  )}
                                  disabled={!isEditing}
                                  onChange={(value) => {
                                    const numValue =
                                      Number(value) || 0;
                                    const currentValue = getValues(
                                      `lstVacantes.${index}`
                                    );
                                    if (
                                      currentValue.idRequerimientoVacante >
                                        0 &&
                                      currentValue.idEstado ===
                                        VacanteEstado.INICIAL
                                    ) {
                                      setValue(
                                        `lstVacantes.${index}.idEstado`,
                                        VacanteEstado.ACTUALIZADO
                                      );
                                    }
                                    setVacQuant((prev) => {
                                      const newCantidades = [...prev];
                                      newCantidades[index] =
                                        String(numValue);
                                      return newCantidades;
                                    });
                                    clearErrors(
                                      `lstVacantes.${index}.cantidad`
                                    );
                                  }}
                                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                                />
                                {errors.lstVacantes?.[index]
                                  ?.cantidad && (
                                  <p className="text-red-500 text-xs mt-1 absolute -bottom-5">
                                    {
                                      errors.lstVacantes[index]
                                        ?.cantidad?.message
                                    }
                                  </p>
                                )}
                              </div>
                              <div className="ms-4 flex items-center">
                                {field.idEstado ===
                                VacanteEstado.NUEVO ? (
                                  <span className="text-sm w-fit px-2 py-1 rounded-lg bg-green-100 text-green-700 truncate mr-2">
                                    Nuevo
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          <td className="table-cell">
                            <input
                              {...register(
                                `lstVacantes.${index}.tarifa`
                              )}
                              defaultValue={
                                Utils.formatCoin(
                                  Number(
                                    getValues(
                                      `lstVacantes.${index}.tarifa`
                                    )
                                  )
                                )?.toString() || "-"
                              }
                              type="text"
                              id="v-tarifa"
                              className="input-readonly-text w-32"
                              readOnly
                            />
                          </td>
                          <td className="table-cell">
                            <input
                              {...register(
                                `lstVacantes.${index}.tarifaInicial`
                              )}
                              defaultValue={
                                Utils.formatCoin(
                                  Number(
                                    getValues(
                                      `lstVacantes.${index}.tarifaInicial`
                                    )
                                  )
                                )?.toString() || "-"
                              }
                              type="text"
                              id="v-tarifa"
                              className="input-readonly-text w-32"
                              readOnly
                            />
                          </td>
                          <td className="table-cell">
                            <div className=" flex items-center justify-between gap-2">
                              <span>
                                {`${
                                  tariff.find(
                                    (t) =>
                                      t.idPerfil === currentProfile
                                  )?.moneda || "S/."
                                }`}
                              </span>
                              <div className="w-32 flex flex-col gap-1 relative">
                                <NumberInput<UpdateBaseRQSchemaType>
                                  control={control}
                                  name={`lstVacantes.${index}.tarifaFinal`}
                                  disabled={!isEditing}
                                  register={register}
                                  onChange={(v) =>
                                    finalTariffChange(v, index)
                                  }
                                />
                                {errors.lstVacantes?.[index]
                                  ?.tarifaFinal && (
                                  <p className="text-red-500 text-xs mt-1 absolute -bottom-5">
                                    {
                                      errors.lstVacantes[index]
                                        ?.tarifaFinal?.message
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="table-cell">{tipoTarifa}</td>

                          <td className="table-cell text-center relative group">
                            <div className="flex items-center gap-3 justify-center">
                              <button
                                type="button"
                                className="relative bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                                title="Agregar carreras"
                                onClick={() => {
                                  const idVacante =
                                    field.idRequerimientoVacante;
                                  openModalCareers(idVacante);
                                }}
                              >
                                <GraduationCap className="w-6 h-6" />
                                <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                  {getTotalCareersForVacancy(
                                    field.idRequerimientoVacante
                                  )}
                                </span>
                              </button>
                              <button
                                type="button"
                                className="relative bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                                title="Agregar habilidades"
                                onClick={() => {
                                  const idVacante =
                                    field.idRequerimientoVacante;
                                  handleOpenModal(idVacante);
                                }}
                              >
                                <Wrench className="w-6 h-6" />
                                <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                  {getTotalSkillsForVacancy(
                                    field.idRequerimientoVacante
                                  )}
                                </span>
                              </button>
                            </div>
                          </td>

                          <td className="table-cell">
                            {isEditing && (
                              <button
                                type="button"
                                disabled={!isEditing}
                                className="bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                                onClick={() =>
                                  handleRemoveVacante(index)
                                }
                              >
                                <Trash2 className="w-6 h-6 text-red-500" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="mt-2 self-end">
          <button
            type="submit"
            disabled={!isEditing}
            className={`focus:outline-none text-sm min-w-24 h-8 rounded-lg py-1 px-2 mx-1 ${
              isEditing
                ? "btn-primary cursor-pointer"
                : "btn-disabled"
            }`}
          >
            Actualizar
          </button>
        </div>
      </div>
    </>
  );
};
