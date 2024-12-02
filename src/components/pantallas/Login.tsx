import { FC } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import useLogin from '../../hooks/useLogin';
import Loading from '../loading/Loading';

const Login: FC = () => {
  const {
    usernameRef,
    passwordRef,
    onLoginSubmit,
    loading
  } = useLogin();

  return (
    <>
      {loading && <Loading />}
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="border p-4" style={{ maxWidth: '400px', width: '100%' }}>
          <h2 className="text-center mb-4">AutFMI</h2>
          <div className="form-group">
            <label htmlFor="usuario">Usuario:</label>
            <input
              type="text"
              id="usuario"
              className="form-control"
              ref={usernameRef}
            />
          </div>
          <div className="form-group mt-3">
            <label htmlFor="contrasena">Contraseña:</label>
            <input
              type="password"
              id="contrasena"
              className="form-control"
              ref={passwordRef}
            />
          </div>
          <button className="btn btn-primary w-100 mt-4" onClick={onLoginSubmit}>
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
