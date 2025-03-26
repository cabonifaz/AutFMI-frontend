import { Control, Controller, FieldError } from "react-hook-form";

interface Props {
    name: string;
    control: Control<any>
    label: string;
    type?: string;
    isPasswordField?: boolean;
    passwordVisible?: boolean;
    togglePasswordVisibility?: () => void;
    isWide?: boolean;
    orientation?: "horizontal" | "vertical";
    error?: FieldError;
    disabled?: boolean;
    word_wrap?: boolean;
    isTable?: boolean;
    required?: boolean;
}

const InputForm = ({ name, control, label, type, isWide, orientation, passwordVisible, togglePasswordVisibility, isPasswordField, error, disabled, word_wrap = false, isTable = false, required = false }: Props) => {
    return (
        <div className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row"} min-w-0`}>
            <label 
                htmlFor={name} 
                className={`${word_wrap ? "w-[9rem]" : isTable ? "" : "min-w-[9rem]"} flex items-center`}
            >
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex-[2] min-w-0 flex flex-col">
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <div className="relative">
                            <input
                                id={name}
                                type={type ? type : "text"}
                                {...field}
                                onChange={(e) => type === 'number' ? field.onChange(Number(e.target.value)) : field.onChange(e.target.value)}
                                disabled={disabled}
                                className={`input w-full px-2 h-10 ${type === 'number' ? "max-md:w-[50px]" : ""} ${error ? "border-red-400 ring-1 ring-red-400 focus:border-red-400" : ""}`}
                            />
                            {isPasswordField && (
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                                >
                                    {passwordVisible ? (
                                        <img src="/assets/see_pass.svg" alt="show pass" />
                                    ) : (
                                        <img src="/assets/not_see_pass.svg" alt="hide pass" />
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                />
                {error && (
                    <div className="relative w-full">
                        <p className="error-message absolute top-0 left-0 w-full break-words whitespace-pre-wrap">
                            {error.message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputForm;