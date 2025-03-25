import { useNavigate } from 'react-router-dom';
import { TalentoType } from '../../models/type/TalentoType';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { DropdownForm } from '../forms';
import { ModalModalidadSchema, ModalModalidadType } from '../../models/schema/ModalModalidadSchema';
import useFetchParams from '../../hooks/useFetchParams';
import { TIPO_MODAL_MODALIDAD } from '../../utils/config';
import { Loading } from './Loading';

interface ModalModalidadProps {
  talento: TalentoType;
  isOpen: boolean;
  onClose: () => void;
}

const ModalModalidad = ({ talento, isOpen, onClose }: ModalModalidadProps) => {
  const navigate = useNavigate();
  const { params, paramLoading } = useFetchParams(`${TIPO_MODAL_MODALIDAD}`);

  const options = params?.filter((param) => param.idMaestro === Number(TIPO_MODAL_MODALIDAD));

  const { control, handleSubmit, formState: { errors } } = useForm<ModalModalidadType>({
    resolver: zodResolver(ModalModalidadSchema),
    mode: "onTouched",
    defaultValues: { idModalidad: 0 }
  });

  const onContinue: SubmitHandler<ModalModalidadType> = (data) => {
    navigate('/formIngreso', { state: { talento, data } });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {paramLoading && <Loading overlayMode={true} />}
      <div className="flex justify-center items-center bg-gray-500 bg-opacity-50 fixed top-0 left-0 w-full h-full z-50">
        <div className="p-4 rounded-lg w-80 bg-white">
          <h3 className="text-center mb-4 text-2xl font-semibold">Modalidad</h3>
          <hr className="my-1" />
          <DropdownForm name="idModalidad" control={control} error={errors.idModalidad}
            options={options?.map((option) => ({ value: option.num1, label: option.string1 })) || []}
          />
          <div className="flex justify-between gap-4 mt-4">
            <button type="button" className="btn btn-outline-gray" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSubmit(onContinue)}>
              Continuar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalModalidad;
