import { Suspense } from 'react';
import { getToolInfo, ToolColorSchema } from './toolsData';
import { Loader2Icon } from 'lucide-react';
import dynamic from 'next/dynamic';
type DynamicToolComponent = React.FC<{ colors: ToolColorSchema }>;

export default function ToolLoader({ toolName }: { toolName: string }) {
    let importPath: string | undefined;

    switch (toolName) {
        case 'Gerador de Senhas':
            importPath = './tools/Password';
            break;
        case 'Gerador de Orçamento de Combustível':
            importPath = './tools/FuelCost';
            break;
        case 'Calculadora de renda passiva':
            importPath = './tools/Investiment';
            break;
        case 'Calculos de porcentagem':
            importPath = "./tools/PercentageCalculator"
            break;
        default:
            importPath = undefined;
    }

    const tool = getToolInfo(toolName);

    if (!tool || !importPath) {
        return <div className="p-6 text-center text-red-500 font-bold text-2xl">Ferramenta desconhecida.</div>;
    }

    const LazyToolCard = dynamic<React.ComponentProps<DynamicToolComponent>>(
        () => import(importPath).then((mod) => mod.default) as Promise<DynamicToolComponent>,
        {
            loading: () => (
                <div className="flex justify-center items-center w-full h-[100px]">
                    <Loader2Icon className="animate-spin" size={40} />
                </div>
            ),
            ssr: false,
        }
    );

    const IconComponent = tool.icon;
    const colors = tool.colors;

    return (
        <div className="tool-card space-y-4">
            <h2 className={`text-2xl font-bold ${colors.tool.text} mb-4 flex items-center`}>
                <IconComponent className={`w-6 h-6 ${colors.tool.icon} mr-2 flex-shrink-0`} />
                {tool.title}
            </h2>
            <LazyToolCard colors={colors} />
        </div>
    );
}
