import { useState } from "react";
import { UseFormRegister, Path } from "react-hook-form";

type NumberType = "int" | "float";

interface NumberInputProps<T extends Record<string, any>> {
    register: UseFormRegister<T>;
    name: Path<T>;
    type?: NumberType;
    className?: string;
    disabled?: boolean;
    defaultValue?: string;
}

export const NumberInput = <T extends Record<string, any>>({
    register,
    name,
    type = "int",
    className = "h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]",
    disabled = false,
    defaultValue
}: NumberInputProps<T>) => {
    const [value, setValue] = useState(defaultValue || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;

        if (type === "int") {
            inputValue = inputValue.replace(/\D/g, "");
        } else {
            inputValue = inputValue.replace(/[^0-9.]/g, "");

            const parts = inputValue.split(".");
            if (parts.length > 2) {
                inputValue = parts[0] + "." + parts.slice(1).join("");
            }

            if (parts.length === 2) {
                parts[1] = parts[1].slice(0, 2);
                inputValue = parts.join(".");
            }
        }

        setValue(inputValue);
    };

    return (
        <input
            type="text"
            {...register(name, { valueAsNumber: true })}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={className}
        />
    );
};