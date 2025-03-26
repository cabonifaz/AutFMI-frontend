import { Control, Controller, FieldError } from "react-hook-form";

interface Props {
    name: string;
    control: Control<any>;
    label?: string;
    options: { label: string; value: number }[];
    error?: FieldError;
    word_wrap?: boolean;
    flex?: boolean;
    required?: boolean;
}

const DropdownForm = ({ name, control, label, options, error, word_wrap = false, flex = false, required = false  }: Props) => {
    return (
            <div className={`${flex ? "flex-1" : "flex flex-1"}`}>
                {label && <label htmlFor={name} className={`${word_wrap ? "w-[9rem]" : "min-w-[9rem]"}`}>
                    {label}
                    {label && required && <span className="text-red-500">*</span>}
                </label>}
                
                <div className={`${label ? "flex-[1.95]" : "basis-80"} `}>
                    <Controller
                        name={name}
                        control={control}
                        render={({ field }) => (
                            <select
                                id={name}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className={`dropdown px-2 h-10 w-full ${error ? "input-error" : ""}`}
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
                    {error && 
                        <div className="relative w-full">
                            <p className="error-message absolute top-0 left-0 w-full break-words whitespace-pre-wrap">{error.message}</p>
                        </div>    
                    }
                </div>
            </div>
    );
};

export default DropdownForm;
