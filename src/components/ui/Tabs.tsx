import { ReactNode, useState } from "react";

interface TabProps {
    label: string | ReactNode;
    children: ReactNode;
    hasError?: boolean;
    errorMessage?: string;
}

interface TabsProps {
    tabs: TabProps[];
    showErrors?: boolean;
    isDataLoading?: boolean;
}

export const Tabs = ({ tabs, showErrors = false, isDataLoading = false }: TabsProps) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="flex flex-col">
            {/* Pestañas */}
            <div className="flex border-b border-gray-200 relative overflow-x-auto">
                {tabs.map((tab, index) => (
                    <div key={index} className="relative">
                        <button
                            type="button"
                            onClick={() => setActiveTab(index)}
                            className={`tab ${activeTab === index ? "tab-active" : "tab-inactive"}
                            ${tab.hasError && showErrors ? "text-red-600" : ""}`}
                        >
                            {tab.label}
                        </button>

                        {/* Mensaje de error fijo (sin hover) */}
                        {tab.hasError && showErrors && tab.errorMessage && (
                            <div className="absolute z-10 px-3 py-2 w-60 text-sm font-medium text-white bg-red-600 rounded-md shadow-lg left-0 top-full mt-1">
                                {tab.errorMessage}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-1">
                {tabs[activeTab].children}
                {isDataLoading && (
                    <div className="absolute inset-0 bg-slate-100 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};