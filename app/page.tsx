'use client';
import { toolCategories, ToolColorMap } from '@/components/toolsData';
import { useCallback, useEffect, useState } from 'react';
import { ChevronRight, ArrowLeft, Cog } from 'lucide-react';
import ToolLoader from '@/components/ToolLoader';

export default function MicroHub() {
    const [selectedTool, setSelectedTool] = useState<string>();
    const isListView = !selectedTool;

    const handleSelectTool = useCallback((id: string) => {
        setSelectedTool(id);
    }, []);

    const handleBackToList = useCallback(() => {
        setSelectedTool(undefined);
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [selectedTool]);

    return (
        <div className="flex justify-center items-center bg-gray-100">
            <div className="p-4  min-h-screen flex flex-col items-center  container">
                <header className="text-center mb-10 w-full p-6 rounded-xl border border-gray-200 bg-white shadow-xl">
                    <div className="flex items-center justify-center mb-2">
                        <Cog className="w-9 h-9 text-indigo-600 mr-2" />
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">MiniHub</h1>
                    </div>
                    <p className="text-lg text-gray-500 font-medium">Soluções Diárias Instantâneas</p>
                </header>

                <main className="w-full  bg-white rounded-xl shadow-2xl p-4 sm:p-8">
                    <section id="tool-list-view" className={isListView ? '' : 'hidden'}>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                            Selecione uma Ferramenta
                        </h2>

                        <div className="space-y-6">
                            {toolCategories.map((category) => {
                                const { header, tool: toolColors } = ToolColorMap[category.id];
                                const { text, border, icon } = toolColors;

                                return (
                                    <div key={category.id} className="space-y-3">
                                        <h3
                                            className={`category-header ${header.border} ${header.bg} p-2 rounded-md font-bold ${header.text} text-lg`}
                                        >
                                            {category.name}
                                        </h3>
                                        {category.tools.map((tool) => {
                                            const Icon = tool.icon;
                                            return (
                                                <button
                                                    key={tool.title}
                                                    className={`tool-item w-full text-left p-4 rounded-lg flex items-center justify-between border ${border} bg-white shadow-sm`}
                                                    onClick={() => handleSelectTool(tool.title)}
                                                >
                                                    <span
                                                        className={`text-lg font-semibold ${text} flex items-center flex-1 pr-2`}
                                                    >
                                                        <Icon className={`w-6 h-6 ${icon} mr-2 flex-shrink-0`} />
                                                        {tool.title}
                                                    </span>
                                                    <ChevronRight className={`${icon} h-5 w-5 flex-shrink-0`} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className={isListView ? 'hidden' : ''}>
                        <button
                            onClick={handleBackToList}
                            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition duration-150 hover:cursor-pointer"
                        >
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            Voltar para a Lista
                        </button>

                        {selectedTool && <ToolLoader toolName={selectedTool} />}
                    </section>
                </main>
            </div>
        </div>
    );
}
