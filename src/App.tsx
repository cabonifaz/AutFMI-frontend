import './App.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/pantallas/Login';
import ListaUsuarios from './components/pantallas/ListaUsuarios';
import PantallaIngreso from './components/pantallas/PantallaIngreso';
import PantallaDatos from './components/pantallas/PantallaDatos';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './components/AuthContext';
import PantallaMovimiento from './components/pantallas/PantallaMovimiento';
import PantallaCese from './components/pantallas/PantallaCese';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <AuthProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'center', }}
        transitionDuration={{ enter: 300, exit: 500 }}
        autoHideDuration={4000}>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/listaUsuarios" element={<ProtectedRoute><ListaUsuarios /></ProtectedRoute>} />
            <Route path="/pantallaIngreso" element={<ProtectedRoute><PantallaIngreso /></ProtectedRoute>} />
            <Route path="/pantallaDatos" element={<ProtectedRoute><PantallaDatos /></ProtectedRoute>} />
            <Route path="/pantallaMovimiento" element={<ProtectedRoute><PantallaMovimiento /></ProtectedRoute>} />
            <Route path="/pantallaCese" element={<ProtectedRoute><PantallaCese /></ProtectedRoute>} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
