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
        <>
            <div className="flex">
                <div className={`bg-black absolute top-0 left-20 bottom-0 right-0 z-10 opacity-50 lg:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-[125%]'} transition-transform duration-300`}
                    onClick={toggleMenu}>
                </div>
                <div className={`w-20 lg:w-44 h-screen fixed border-r border-gray-300 bg-white lg:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-20'} transition-transform duration-300`}>
                    <ul className="text-gray-700 flex flex-col h-screen py-2 list-none m-0 ps-2 justify-between">
                        <div >
                            <li className='flex flex-col items-center py-4'>
                                <div className="space-y-1 cursor-pointer ms-1 md:hidden" onClick={toggleMenu}>
                                    <div className="w-6 h-1 bg-gray-600 rounded-lg"></div>
                                    <div className="w-6 h-1 bg-gray-600 rounded-lg"></div>
                                    <div className="w-6 h-1 bg-gray-600 rounded-lg"></div>
                                </div>
                            </li>

                            <li>
                                <button type="button" onClick={() => navigate("/listaTalentos")} className='flex gap-2 max-h-12 items-center rounded-lg justify-center lg:justify-start py-2 hover:bg-slate-100 w-full'>
                                    <img src="/assets/ic_home_fmi.svg" alt="icon home fmi" className="max-h-8" />
                                    <span className="hidden lg:inline">Inicio</span>
                                </button>
                            </li>

                            <li>
                                <button type="button" onClick={() => navigate("/requerimientos")} className='flex gap-2 max-h-12 items-center rounded-lg justify-center lg:justify-start py-2 hover:bg-slate-100 w-full'>
                                    <img src="/assets/ic_requirements_fmi.svg" alt="icon requirements fmi" className="max-h-8" />
                                    <span className="hidden lg:inline">Requerimientos</span>
                                </button>
                            </li>
                        </div>

                        <li>
                            <button onClick={logout} type='button' className='flex gap-2 max-h-12 items-center rounded-lg justify-center lg:justify-start py-2 hover:bg-slate-100 w-full'>
                                <img src="assets/ic_logout.svg" alt="logout icon" className="max-h-8" />
                                <span className="hidden lg:inline">Cerrar sesión</span>
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="w-full p-4 lg:ms-44">
                    {children}
                </div>
            </div>
        </>
    );
};