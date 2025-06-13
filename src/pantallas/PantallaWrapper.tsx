import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMenu } from "../context/MenuContext";

interface Props {
    children: ReactNode;
}

export const PantallaWrapper = ({ children }: Props) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { isMenuOpen, toggleMenu } = useMenu();

    return (
        <div className="flex min-h-screen">
            {/* Overlay para móviles */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden transition-opacity duration-300 ${isMenuOpen ? "opacity-50 visible" : "opacity-0 invisible"
                    }`}
                onClick={toggleMenu}
            />

            {/* Barra lateral */}
            <aside
                className={`fixed h-screen bg-white border-r border-gray-300 z-20 transition-all duration-300
                    ${isMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    w-64 lg:w-16 xl:w-44
                `}
            >
                <ul className="flex flex-col h-full py-2 px-2 justify-between">
                    <div>
                        <li className='py-4 lg:hidden'>
                            <button
                                onClick={toggleMenu}
                                className="flex flex-col space-y-1 cursor-pointer"
                                aria-label="Toggle menu"
                            >
                                <div className="w-6 h-1 bg-gray-600 rounded-lg"></div>
                                <div className="w-6 h-1 bg-gray-600 rounded-lg"></div>
                                <div className="w-6 h-1 bg-gray-600 rounded-lg"></div>
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={() => navigate("/listaTalentos")}
                                className='flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 w-full'
                            >
                                <img src="/assets/ic_home_fmi.svg" alt="Inicio" className="w-6 h-6" />
                                <span className="lg:hidden xl:inline text-sm">Inicio</span>
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={() => navigate("/requerimientos")}
                                className='flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 w-full'
                            >
                                <img src="/assets/ic_requirements_fmi.svg" alt="Requerimientos" className="w-6 h-6" />
                                <span className="lg:hidden xl:inline text-sm">Requerimientos</span>
                            </button>
                        </li>
                    </div>

                    <li>
                        <button
                            onClick={logout}
                            className='flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 w-full'
                        >
                            <img src="assets/ic_logout.svg" alt="Cerrar sesión" className="w-5 h-5" />
                            <span className="lg:hidden xl:inline text-sm">Cerrar sesión</span>
                        </button>
                    </li>
                </ul>
            </aside>

            {/* Contenido principal */}
            <main className={`flex-1 transition-all duration-300 ${isMenuOpen ? "lg:ml-16 xl:ml-44" : "lg:ml-16 xl:ml-44"
                }`}>
                <div>
                    {children}
                </div>
            </main>
        </div>
    );
};