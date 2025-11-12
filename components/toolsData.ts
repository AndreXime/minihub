import { Fuel, Lock, LucideIcon } from 'lucide-react';

export const toolCategories: ToolCategory[] = [
    {
        id: 'math-finance',
        name: 'Matemática e Finanças',
        tools: [{ title: 'Gerador de Orçamento de Combustível', icon: Fuel }],
    },
    {
        id: 'productivity',
        name: 'Produtividade',
        tools: [],
    },
    {
        id: 'web-dev-utils',
        name: 'Utilitários Web e Dev',
        tools: [{ title: 'Gerador de Senhas', icon: Lock }],
    },
];

export const ToolColorMap = {
    'math-finance': {
        header: { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-800' },
        tool: {
            text: 'text-green-700',
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: 'text-green-500',
            focus: 'focus:ring-green-500 focus:border-green-500',
        },
        primary: {
            bg: 'bg-green-600',
            hover: 'hover:bg-green-700',
            ring: 'focus:ring-green-500',
            border: 'focus:border-green-500',
        },
    },
    productivity: {
        header: { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-800' },
        tool: {
            text: 'text-blue-700',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: 'text-blue-500',
            focus: 'focus:ring-blue-500 focus:border-blue-500',
        },
        primary: {
            bg: 'bg-blue-600',
            hover: 'hover:bg-blue-700',
            ring: 'focus:ring-blue-500',
            border: 'focus:border-blue-500',
        },
    },
    'web-dev-utils': {
        header: { border: 'border-indigo-500', bg: 'bg-indigo-100', text: 'text-indigo-800' },
        tool: {
            text: 'text-indigo-700',
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
            icon: 'text-indigo-500',
            focus: 'focus:ring-indigo-500 focus:border-indigo-500',
        },
        primary: {
            bg: 'bg-indigo-600',
            hover: 'hover:bg-indigo-700',
            ring: 'focus:ring-indigo-500',
            border: 'focus:border-indigo-500',
        },
    },
} as const;

export const getToolInfo = (name: string): (ToolListItem & { colors: ToolColorSchema }) | null => {
    for (const category of toolCategories) {
        const tool = category.tools.find((t) => t.title === name);
        if (tool) {
            const colors = ToolColorMap[category.id];

            return { ...tool, colors };
        }
    }
    return null;
};

export type ToolColorSchema = (typeof ToolColorMap)[keyof typeof ToolColorMap];

interface ToolListItem {
    title: string;
    icon: LucideIcon;
}

interface ToolCategory {
    id: keyof typeof ToolColorMap;
    name: string;
    tools: ToolListItem[];
}
