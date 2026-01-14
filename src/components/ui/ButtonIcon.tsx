import React from "react";

interface ButtonIconProps {
  onClick: () => void;
  iconSrc: string;
  alt: string;
  title?: string;
  size?: number;
  className?: string;
}

const ButtonIcon: React.FC<ButtonIconProps> = ({
  onClick,
  iconSrc,
  alt,
  title,
  size = 24,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`hover:scale-110 transition-transform duration-200 p-1 ${className}`}
    >
      <img
        src={iconSrc}
        alt={alt}
        style={{ width: size, height: size }}
      />
    </button>
  );
};

export default ButtonIcon;
