
import { GraduationCap, Trash2, Wrench } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { newRQSchemaType } from "../../../../../models/schema/NewRQSchema";
import { Utils } from "../../../../../utils/utils";
import { useEffect, useState } from "react";
import { Tarifa } from "../../../../../models/type/Tarifa";
import {
  BaseSkillProps,
  TechSkillsModal,
} from "../../../ModalAddTechSkill";

import { enqueueSnackbar } from "notistack";
import {
  HABILIDADES_TECNICAS,
  MODAL_ADD_CAREER,
  MODAL_ADD_TECH_SKILL,
} from "../../../../../utils";
import { useModal } from "../../../../../context/ModalContext";
import { NumberInputV2 } from "../../../../forms/NumberInputV2";
import { AddCareerModal, CareerProps } from "../../../ModalAddCareer";
import { SearchableSelect } from "../../../SearchableSelect";

type SkillsPayload = BaseSkillProps & {
  tempVacancyId: string;
};

type VacancyCareerPayload = CareerProps & {
  tempVacancyId: string;
};

interface TabProps {
  tarifario: Tarifa[];
  techSkills: { id: number; label: string }[];
  availableDegrees: { id: number; label: string }[];
  refetchParams: (idMasters: string) => Promise<void>;
}

const generateTempVacancyId = () => crypto.randomUUID();

export const TabVacancies = ({
  tarifario,
  techSkills,
  availableDegrees,
  refetchParams,
}: TabProps) => {
  const { openModal, isModalOpen, closeModal } = useModal();

  const [selectedTechSkills, setSelectedTechSkills] = useState<
    Record<string, SkillsPayload[]>
  >({});

  const [selectedCareers, setSelectedCareers] = useState<
    Record<string, VacancyCareerPayload[]>
  >({});

  const [currentVacancyId, setCurrentVacancyId] = useState<string | null>(null);

  const [careerVacancyId, setCareerVacancyId] = useState<string | null>(null);

  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
    getValues,
    control,
    watch,
  } = useFormContext<newRQSchemaType>();

  const currentVacantes = watch("lstVacantes");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lstVacantes",
  });

  useEffect(() => {
    const lstVacanteSkills = Object.entries(selectedTechSkills).flatMap(
      ([tempVacancyId, skills]) => {
        const vacancy = currentVacantes.find(
          (v) => v.tempVacancyId === tempVacancyId
        );

        if (!vacancy) return [];

        return skills.map((skill) => ({
          tempVacancyId,
          idPerfil: vacancy.idPerfil,
          idSkill: skill.id,
          anios: skill.years,
          isOptional: skill.isOptional,
        }));
      }
    );

    setValue("lstVacanteSkills", lstVacanteSkills, {
      shouldValidate: false,
    });
  }, [selectedTechSkills, currentVacantes, setValue]);

  useEffect(() => {
    const lstCarreras = Object.entries(selectedCareers).flatMap(
      ([tempVacancyId, careers]) => {
        const vacancy = currentVacantes.find(
          (v) => v.tempVacancyId === tempVacancyId
        );

        if (!vacancy) return [];

        return careers.map((career) => ({
          tempVacancyId,
          idPerfil: vacancy.idPerfil,
          carrera: career.label,
          idGrado: career.degreeId,
          isOptional: career.isOptional,
        }));
      }
    );

    setValue("lstCarreras", lstCarreras, {
      shouldValidate: false,
    });
  }, [selectedCareers, currentVacantes, setValue]);

  const handleAddVacante = () => {
    const clientId = getValues("idCliente");

    if (!clientId || clientId === 0) {
      enqueueSnackbar({
        message: "Primero selecciona un cliente",
        variant: "warning",
      });
      return;
    }

    append({
      tempVacancyId: generateTempVacancyId(),
      idPerfil: 0,
      cantidad: 1,
      tarifaFinal: 0,
    });

    clearErrors("lstVacantes");
  };

  const handleRemoveVacante = (index: number) => {
    const tempVacancyId = getValues(
      `lstVacantes.${index}.tempVacancyId`
    );

    remove(index);

    setSelectedTechSkills((prev) => {
      const next = { ...prev };
      delete next[tempVacancyId];
      return next;
    });

    setSelectedCareers((prev) => {
      const next = { ...prev };
      delete next[tempVacancyId];
      return next;
    });
  };

  const getAvailableProfiles = () => {
    if (getValues("idCliente") === 0) return [];
    return tarifario;
  };

  const handleProfileChange = (index: number, value: string) => {
    const idPerfil = Number(value);

    setValue(`lstVacantes.${index}.idPerfil`, idPerfil);

    const tarifa =
      tarifario
        .find((item) => item.idPerfil === idPerfil)
        ?.tarifa.toFixed(2) || "-";

    const moneda =
      tarifario.find((item) => item.idPerfil === idPerfil)?.moneda ||
      "S/.";

    const tarifaFinal =
      tarifario.find((item) => item.idPerfil === idPerfil)?.tarifa ||
      0;

    setValue(`lstVacantes.${index}.tarifaFinal`, tarifaFinal);

    setValue(
      `lstVacantes.${index}.tarifa`,
      `${moneda} ${Utils.formatCoin(Number(tarifa))}`
    );

    clearErrors(`lstVacantes.${index}.idPerfil`);
  };

  const handleOpenModal = (tempVacancyId: string, profileId: number) => {
    if (!profileId || profileId === 0) {
      enqueueSnackbar({
        message:
          "Selecciona un perfil para agregar habilidades técnicas.",
        variant: "warning",
      });
      return;
    }

    setCurrentVacancyId(tempVacancyId);
    openModal(MODAL_ADD_TECH_SKILL);
  };

  const openModalAddCareer = (
    tempVacancyId: string,
    profileId: number
  ) => {
    if (!profileId || profileId === 0) {
      enqueueSnackbar({
        message: "Selecciona una vacante para continuar",
        variant: "warning",
      });
      return;
    }

    setCareerVacancyId(tempVacancyId);
    openModal(MODAL_ADD_CAREER);
  };

  const handleSaveTechSkills = (skills: BaseSkillProps[]) => {
    if (!currentVacancyId) return;

    const vacancySkills: SkillsPayload[] = skills.map((skill) => ({
      tempVacancyId: currentVacancyId,
      id: skill.id,
      years: skill.years,
      label: skill.label,
      isOptional: skill.isOptional,
    }));

    setSelectedTechSkills((prev) => ({
      ...prev,
      [currentVacancyId]: vacancySkills,
    }));
  };

  const handleSaveCarrers = (careers: CareerProps[]) => {
    if (!careerVacancyId) return;

    const formattedCareers: VacancyCareerPayload[] = careers.map(
      (career) => ({
        ...career,
        tempVacancyId: careerVacancyId,
      })
    );

    setSelectedCareers((prev) => ({
      ...prev,
      [careerVacancyId]: formattedCareers,
    }));
  };

  const getInitialSkills = (tempVacancyId: string) => {
    return selectedTechSkills[tempVacancyId] || [];
  };

  const getInitialCareers = (tempVacancyId: string) => {
    return selectedCareers[tempVacancyId] || [];
  };

  const getTotalSkillsForVacancy = (tempVacancyId: string) => {
    return selectedTechSkills[tempVacancyId]?.length || 0;
  };

  const getTotalCareersForVacancy = (tempVacancyId: string) => {
    return selectedCareers[tempVacancyId]?.length || 0;
  };

  const closeModalSkills = () => {
    setCurrentVacancyId(null);
    closeModal(MODAL_ADD_TECH_SKILL);
  };

  const closeModalCareers = () => {
    setCareerVacancyId(null);
    closeModal(MODAL_ADD_CAREER);
  };

  const availableProfiles = getAvailableProfiles();

  return (
    <>
      {isModalOpen(MODAL_ADD_TECH_SKILL) && (
        <TechSkillsModal
          onClose={closeModalSkills}
          availableSkills={techSkills}
          onSave={handleSaveTechSkills}
          initialSkills={
            currentVacancyId
              ? getInitialSkills(currentVacancyId)
              : []
          }
          refetchAvailableSkills={() =>
            refetchParams(`${HABILIDADES_TECNICAS}`)
          }
        />
      )}

      {isModalOpen(MODAL_ADD_CAREER) && (
        <AddCareerModal
          degreeOptions={availableDegrees}
          initialCareers={
            careerVacancyId
              ? getInitialCareers(careerVacancyId)
              : []
          }
          onSave={handleSaveCarrers}
          onClose={closeModalCareers}
        />
      )}

      <div className="flex flex-col h-[calc(570px-120px)]">
        <div className="mb-1 text-end">
          <button
            type="button"
            className="btn btn-blue"
            onClick={handleAddVacante}
          >
            Agregar
          </button>
        </div>

        <div className="p-1 flex-1 overflow-y-auto">
          <div className="table-container h-full">
            <div className="table-wrapper h-full overflow-y-auto custom-scroll">
              <table className="table">
                <thead>
                  <tr className="table-header">
                    <th className="table-header-cell">
                      Perfil profesional
                    </th>
                    <th className="table-header-cell">Cantidad</th>
                    <th className="table-header-cell">Tarifa</th>
                    <th className="table-header-cell">
                      Tarifa Final
                    </th>
                    <th className="table-header-cell">
                      Tipo Tarifa
                    </th>
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
                      const rowProfileId =
                        currentVacantes[index]?.idPerfil;

                      const tempVacancyId =
                        currentVacantes[index]?.tempVacancyId;

                      const tipoTarifa =
                        tarifario.find(
                          (item) =>
                            item.idPerfil ===
                            getValues(`lstVacantes.${index}.idPerfil`)
                        )?.tipoTarifa || "-";

                      return (
                        <tr key={field.id} className="table-row">
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
                              value={rowProfileId || 0}
                              onChange={(value) => {
                                handleProfileChange(
                                  index,
                                  value.toString()
                                );
                              }}
                              placeholder="Seleccione un perfil"
                              disabled={false}
                            />
                          </td>

                          <td className="table-cell">
                            <NumberInputV2<newRQSchemaType>
                              control={control}
                              name={`lstVacantes.${index}.cantidad`}
                              error={
                                errors.lstVacantes?.[index]?.cantidad
                                  ?.message
                              }
                            />
                          </td>

                          <td className="table-cell">
                            <input
                              {...register(
                                `lstVacantes.${index}.tarifa`
                              )}
                              type="text"
                              className="input-readonly-text w-32"
                              readOnly
                            />
                          </td>

                          <td className="table-cell">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold">
                                {`${
                                  tarifario.find(
                                    (t) =>
                                      t.idPerfil === rowProfileId
                                  )?.moneda || "S/."
                                }`}
                              </span>

                              <NumberInputV2<newRQSchemaType>
                                control={control}
                                name={`lstVacantes.${index}.tarifaFinal`}
                                error={
                                  errors.lstVacantes?.[index]
                                    ?.tarifaFinal?.message
                                }
                              />
                            </div>
                          </td>

                          <td className="table-cell">
                            {tipoTarifa}
                          </td>

                          <td className="table-cell text-center relative group">
                            <div className="flex items-center gap-3 justify-center">
                              <button
                                type="button"
                                className="relative bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                                title="Agregar carreras"
                                onClick={() =>
                                  openModalAddCareer(
                                    tempVacancyId,
                                    rowProfileId
                                  )
                                }
                              >
                                <GraduationCap className="w-6 h-6" />

                                <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                  {getTotalCareersForVacancy(
                                    tempVacancyId
                                  )}
                                </span>
                              </button>

                              <button
                                type="button"
                                className="relative bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                                title="Agregar habilidades"
                                onClick={() =>
                                  handleOpenModal(
                                    tempVacancyId,
                                    rowProfileId
                                  )
                                }
                              >
                                <Wrench className="w-6 h-6" />

                                <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                  {getTotalSkillsForVacancy(
                                    tempVacancyId
                                  )}
                                </span>
                              </button>
                            </div>
                          </td>

                          <td className="table-cell">
                            <button
                              type="button"
                              title="Eliminar vacante"
                              className="bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                              onClick={() =>
                                handleRemoveVacante(index)
                              }
                            >
                              <Trash2 className="w-6 h-6 text-red-500" />
                            </button>
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
      </div>
    </>
  );
};


