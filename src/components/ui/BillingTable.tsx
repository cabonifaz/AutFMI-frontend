import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { newRQSchemaType } from "../../models/schema/NewRQSchema";

interface BillingTableProps {
  index: number;
  title: string;
  modalidadId: number;
  isEditable?: boolean;
}

export const BillingTable: React.FC<BillingTableProps> = ({
  index,
  title,
  modalidadId,
  isEditable = true,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<newRQSchemaType>();

  // Configuración de campos de montos
  const montoFields = [
    { name: "minBaseAmount", label: "M. Básico Min" },
    { name: "maxBaseAmount", label: "M. Básico Max" },

    { name: "minTravelAllowance", label: "M. Movilidad Min" },
    { name: "maxTravelAllowance", label: "M. Movilidad Max" },

    { name: "minMonthlyAmount", label: "M. Mensual Min" },
    { name: "maxMonthlyAmount", label: "M. Mensual Max" },

    { name: "minQuarterlyAmount", label: "M. Trimestral Min" },
    { name: "minQuarterlyAmount", label: "M. Trimestral Max" },

    { name: "minSemiAnnualAmount", label: "M. Semestral Min" },
    { name: "maxSemiAnnualAmount", label: "M. Semestral Max" },
  ] as const;

  const universalFields = ["minBaseAmount", "maxBaseAmount"];

  return (
    <div className={"border border-gray-300 rounded-lg p-4"}>
      {/* Header de la tabla */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {title}
        </h3>
      </div>

      {/* Tabla de montos */}
      <div className="space-y-4">
        {montoFields.map((montoField) => {
          const isUniversalField = universalFields.includes(
            montoField.name
          );

          // 2. Un campo es visible si
          const isVisible = isUniversalField || modalidadId !== 1;

          return (
            <div key={montoField.name}>
              <div
                className={`flex items-center space-x-4 ${
                  !isVisible ? "hidden" : ""
                }`}
              >
                {/* Label del concepto */}
                <div className="flex">
                  <label className="text-sm font-medium text-gray-700">
                    {montoField.label}
                  </label>
                </div>

                {/* Input del valor */}
                <div className="w-32">
                  <Controller
                    name={
                      `lstFacturacion.${index}.${montoField.name}` as any
                    }
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        disabled={!isEditable}
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        value={field.value}
                      />
                    )}
                  />
                  {errors.lstFacturacion?.[index]?.[
                    montoField.name
                  ] && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {
                        errors.lstFacturacion?.[index]?.[
                          montoField.name
                        ]?.message
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
