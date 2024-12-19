import { Control, Controller, FieldError } from "react-hook-form";

interface Props {
    name: string;
    control: Control<any>;
    label?: string;
    options: { label: string; value: number }[];
    error?: FieldError;
}

const DropdownForm = ({ name, control, label, options, error }: Props) => {
    return (
        <>
            <div className="flex flex-1">
                {label && <label htmlFor={name} className="flex-1">{label}</label>}
                <div className={`${label ? "flex-[1.95]" : "basis-80"}`}>
                    <Controller
                        name={name}
                        control={control}
                        render={({ field }) => (
                            <select
                                id={name}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className={`w-full ring-1 outline-none px-2 ring-slate-400 rounded-lg h-10 ${error ? "ring-red-500" : ""}`}
                            >
                                <option value={0}>Elige una opción</option>
                                {options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}
                    />
                    {error && <p className="absolute text-red-400 bg-transparent text-sm">{error.message}</p>}
                </div>
            </div>
        </>
    );
};

export default DropdownForm;
