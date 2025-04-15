import { useState, useEffect } from "react";
import { UseFormRegister, Path, Control, useWatch, set } from "react-hook-form";

type NumberType = "int" | "float";

interface NumberInputProps<T extends Record<string, any>> {
    register: UseFormRegister<T>;
    name: Path<T>;
    control: Control<T>;
    type?: NumberType;
    className?: string;
    disabled?: boolean;
    defaultValue?: number;
    onChange?: () => void;
}

export const NumberInput = <T extends Record<string, any>>({
    register,
    name,
    control,
    type = "int",
    className = "h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]",
    disabled = false,
    defaultValue,
    onChange
}: NumberInputProps<T>) => {
    const currentValue = useWatch({
        control,
        name,
    });

    const [inputValue, setInputValue] = useState(
        String(currentValue || (type === "int" ? (defaultValue || 0) : defaultValue || ""))
    );

    useEffect(() => {
        if (currentValue !== undefined && currentValue !== null) {
            setInputValue(String(currentValue));
        }
    }, [currentValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        if (type === "int") {
            newValue = newValue.replace(/\D/g, "");
        } else {
            newValue = newValue.replace(/[^0-9.]/g, "");

            const parts = newValue.split(".");
            if (parts.length > 2) {
                newValue = parts[0] + "." + parts.slice(1).join("");
            }

            if (parts.length === 2) {
                parts[1] = parts[1].slice(0, 2);
                newValue = parts.join(".");
            }
        }

        setInputValue(newValue);
        console.log(newValue);


        if (onChange) {
            onChange();
        }
    };

    return (
        <input
            type="number"
            {...register(name, {
                valueAsNumber: true,
                onChange: handleChange,
            })}
            value={inputValue}
            onWheel={(e) => e.currentTarget.blur()}
            disabled={disabled}
            className={className}
        />
    );
};