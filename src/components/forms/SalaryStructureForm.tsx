import { Control, Controller, FieldError } from "react-hook-form";

interface InputItem {
    label: string;
    name: string;
    type?: string;
    error?: FieldError;
}

interface Props {
    control: Control<any>;
    mainLabel: string;
    inputs: InputItem[];
}

const SalaryStructureForm = ({ control, mainLabel, inputs }: Props) => {
    return (
        <div className="flex items-start justify-between gap-4 mt-4">
            <div className="flex items-center flex-shrink-0 flex-grow">
                <label className="text-lg font-semibold">{mainLabel}</label>
            </div>

            <div className="flex w-fit flex-wrap gap-7">
                {inputs.map((input) => (
                    <div key={input.name} className="flex flex-col items-end gap-2">
                        <div className="flex self-start gap-2 mb-2 w-fit">
                            <input
                                type="checkbox"
                                id={`checkbox-${input.name}`}
                                className="w-5 h-5 accent-blue-500"
                                onChange={(e) => {
                                    const inputElement = document.getElementById(input.name) as HTMLInputElement;
                                    inputElement.disabled = !e.target.checked;
                                }}
                            />
                            <label htmlFor={input.name} className="text-sm font-medium">
                                {input.label}
                            </label>
                        </div>

                        <Controller
                            name={input.name}
                            control={control}
                            render={({ field }) => (
                                <input
                                    disabled
                                    id={input.name}
                                    {...field}
                                    type={input.type !== undefined ? input.type : "text"}
                                    onChange={(e) =>
                                        input.type === "number"
                                            ? field.onChange(Number(e.target.value))
                                            : field.onChange(e.target.value)
                                    }
                                    className={`w-fit sm:w-[11rem] outline-none px-2 ring-1 ring-slate-400 rounded-lg h-10 ${input.error ? "ring-red-400" : ""
                                        }`}
                                />
                            )}
                        />
                        {input.error && (<p className="text-red-400 bg-transparent text-sm w-fit">{input.error.message}</p>)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SalaryStructureForm;
