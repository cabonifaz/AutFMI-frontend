import useLogin from '../hooks/useLogin';
import Loading from '../components/loading/Loading';
import { InputForm } from '../components/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { LoginFormSchema, LoginFormType } from '../models/schema/LoginFormSchema';

const PantallaLogin = () => {
  const { handleLogin, loading } = useLogin();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormType>({
    resolver: zodResolver(LoginFormSchema),
    mode: "onTouched",
    defaultValues: { username: '', password: '' }
  });

  const login: SubmitHandler<LoginFormType> = (data) => {
    handleLogin(data.username, data.password);
  }

  return (
    <>
      {loading && <Loading />}
      <div className="p-4 w-screen h-screen flex justify-center items-center">
        <form onSubmit={handleSubmit(login)} className="flex flex-col gap-6 w-96 border-2 rounded-lg p-4">
          <h2 className="text-center mb-4 text-2xl font-semibold">AutFMI</h2>
          <InputForm name="username" control={control} orientation='vertical' label="Usuario" error={errors.username} />
          <InputForm name="password" control={control} orientation='vertical' label="Contraseña" type="password" error={errors.password} />
          <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 my-2">{loading ? 'Cargando...' : 'Iniciar sesión'}</button>
        </form>
      </div>
    </>
  );
};

export default PantallaLogin;
