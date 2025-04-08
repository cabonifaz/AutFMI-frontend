import './App.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import ProtectedRoute from './components/ui/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { PantallaCese, PantallaDatos, PantallaIngreso, PantallaListaTalentos, PantallaLogin, PantallaMovimiento } from './pantallas';
import PantallaSolicitarEquipo from './pantallas/PantallaSolicitarEquipo';
import { PantallaRequerimientos } from './pantallas/PantallaRequerimientos';
import { MenuProvider } from './context/MenuContext';
import TalentTable from './pantallas/PantallaAsignarTalento';
import { ParamsProvider } from './context/ParamsContext';

function App() {

  return (
    <ParamsProvider>
      <AuthProvider>
        <MenuProvider>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: 'top', horizontal: 'center', }}
            transitionDuration={{ enter: 300, exit: 500 }}
            autoHideDuration={4000}>
            <Router>
              <Routes>
                <Route path="/" element={<PantallaLogin />} />
                <Route path="/*" element={<ProtectedRoute><PantallaListaTalentos /></ProtectedRoute>} />
                <Route path="/listaTalentos" element={<ProtectedRoute><PantallaListaTalentos /></ProtectedRoute>} />
                <Route path="/formIngreso" element={<ProtectedRoute><PantallaIngreso /></ProtectedRoute>} />
                <Route path="/formDatos" element={<ProtectedRoute><PantallaDatos /></ProtectedRoute>} />
                <Route path="/formMovimiento" element={<ProtectedRoute><PantallaMovimiento /></ProtectedRoute>} />
                <Route path="/formCese" element={<ProtectedRoute><PantallaCese /></ProtectedRoute>} />
                <Route path="/formSolicitarEquipo" element={<ProtectedRoute><PantallaSolicitarEquipo /></ProtectedRoute>} />
                <Route path="/requerimientos" element={<ProtectedRoute><PantallaRequerimientos /></ProtectedRoute>} />
                <Route path="/tableAsignarTalento" element={<ProtectedRoute><TalentTable /></ProtectedRoute>} />
              </Routes>
            </Router>
          </SnackbarProvider>
        </MenuProvider>
      </AuthProvider>
    </ParamsProvider>
  );
}

export default App;
