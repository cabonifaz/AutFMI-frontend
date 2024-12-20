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
        <div className="flex mt-4 justify-between">
            <div className="flex items-center mb-2">
                <label className="flex-1">{mainLabel}</label>
            </div>

            <div className="flex flex-wrap gap-4">
                {inputs.map((input) => (
                    <div key={input.name} className="flex items-start gap-2 w-full sm:w-auto">
                        <div className="flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-2">
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
                                        onChange={(e) => (input.type === "number" ? field.onChange(Number(e.target.value)) : field.onChange(e.target.value))}
                                        className={`w-[11rem] outline-none px-2 ring-1 ring-slate-400 rounded-lg h-10 ${input.error ? " ring-red-400" : ""}`}
                                    />
                                )}
                            />
                            {input.error && <p className="text-red-400 bg-transparent text-sm">{input.error.message}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SalaryStructureForm;
