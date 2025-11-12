// src/components/tools/FuelCostCard.tsx
import React, { useState, useMemo } from 'react';
import { ToolColorSchema } from '../toolsData';

function calcularCustoCombustivel(
    distanciaTotalDiaria: number,
    kmPorLitroMedio: number,
    precoGasolinaPorLitro: number,
    frequenciaSemanal: number
): {
    litrosDiarios: number;
    custoDiario: number;
    custoSemanal: number;
    custoMensal: number;
} {
    if (
        [distanciaTotalDiaria, kmPorLitroMedio, precoGasolinaPorLitro, frequenciaSemanal].some(
            (val) => !val || val <= 0
        )
    ) {
        return { litrosDiarios: 0, custoDiario: 0, custoSemanal: 0, custoMensal: 0 };
    }

    // 1. Calcular o consumo total diário
    const litrosDiarios = distanciaTotalDiaria / kmPorLitroMedio;

    // 2. Calcular os custos
    const custoDiario = litrosDiarios * precoGasolinaPorLitro;
    const custoSemanal = custoDiario * frequenciaSemanal;

    // Assumimos 4 semanas no mês para uma estimativa padrão
    const custoMensal = custoSemanal * 4;

    return {
        litrosDiarios: Number(litrosDiarios.toFixed(2)),
        custoDiario: Number(custoDiario.toFixed(2)),
        custoSemanal: Number(custoSemanal.toFixed(2)),
        custoMensal: Number(custoMensal.toFixed(2)),
    };
}

interface FuelCostCardProps {
    colors: ToolColorSchema;
}

const FuelCostCard: React.FC<FuelCostCardProps> = ({ colors }) => {
    // Estado para os campos de entrada simplificados
    const [inputs, setInputs] = useState({
        distanciaTotalDiaria: 54, // Ex: Distância total diária em Km
        kmPorLitroMedio: 15.0, // Ex: Consumo médio (cidade + estrada)
        precoGasolinaPorLitro: 6.29,
        frequenciaSemanal: 5, // Ex: 5 dias úteis
    });

    const primaryClasses = colors.primary;
    const resultClasses = colors.tool;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Converte para número e garante que é válido (ou 0 se for NaN)
        let numValue = parseFloat(value);
        numValue = isNaN(numValue) ? 0 : numValue;

        // >>> LÓGICA DE RESTRIÇÃO PRINCIPAL AQUI <<<
        if (name === 'frequenciaSemanal') {
            // Aplica o limite superior: Não permite valores maiores que 7
            if (numValue > 7) {
                numValue = 7;
            }
            // Garante que não é negativo (embora min=1 ajude visualmente)
            if (numValue < 0) {
                numValue = 0;
            }
        } else if (numValue < 0) {
            // Garante que outros campos não sejam negativos
            numValue = 0;
        }

        setInputs((prev) => ({
            ...prev,
            [name]: numValue,
        }));
    };

    // Cálculo otimizado com useMemo
    const resultados = useMemo(() => {
        return calcularCustoCombustivel(
            inputs.distanciaTotalDiaria,
            inputs.kmPorLitroMedio,
            inputs.precoGasolinaPorLitro,
            inputs.frequenciaSemanal
        );
    }, [inputs]);

    const inputClasses = `w-full p-3 border border-gray-300 rounded-lg ${primaryClasses.ring} ${primaryClasses.border} focus:outline-none`;

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-600">
                Calcule o custo de combustível usando o consumo médio do seu veículo.
            </p>

            {/* --- Campos de Entrada --- */}
            <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup
                    label="Distância Diária Total (Km)"
                    name="distanciaTotalDiaria"
                    value={inputs.distanciaTotalDiaria}
                    onChange={handleChange}
                    classes={inputClasses}
                />
                <InputGroup
                    label="Consumo Médio (Km/L)"
                    name="kmPorLitroMedio"
                    value={inputs.kmPorLitroMedio}
                    onChange={handleChange}
                    classes={inputClasses}
                    step="0.1"
                />
                <InputGroup
                    label="Preço do Combustível (R$/L)"
                    name="precoGasolinaPorLitro"
                    value={inputs.precoGasolinaPorLitro}
                    onChange={handleChange}
                    classes={inputClasses}
                    step="0.01"
                />
                <InputGroup
                    label="Frequência Semanal (dias)"
                    name="frequenciaSemanal"
                    value={inputs.frequenciaSemanal}
                    onChange={handleChange}
                    classes={inputClasses}
                    min={1}
                    max={7}
                />
            </div>

            {/* --- Resultados (Box de Destaque) --- */}
            <div className="mt-6 border-t pt-4 space-y-3">
                <h3 className={`text-xl font-bold ${primaryClasses.bg.replace('bg-', 'text-')}`}>
                    Resultados do Cálculo
                </h3>
                <ResultItem
                    label="Litros Diários Necessários"
                    value={`${resultados.litrosDiarios} L`}
                    colorClasses={resultClasses}
                />
                <ResultItem
                    label="Custo Diário Estimado"
                    value={`R$ ${resultados.custoDiario.toFixed(2)}`}
                    colorClasses={resultClasses}
                />
                <ResultItem
                    label="Custo Semanal Estimado"
                    value={`R$ ${resultados.custoSemanal.toFixed(2)}`}
                    colorClasses={resultClasses}
                />
                <ResultItem
                    label="Custo Mensal Estimado"
                    value={`R$ ${resultados.custoMensal.toFixed(2)}`}
                    colorClasses={resultClasses}
                />
            </div>
        </div>
    );
};

export default FuelCostCard;

// --- Componentes Auxiliares para Limpeza do JSX ---

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    value: number;
    classes: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, name, value, classes, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input type="number" id={name} name={name} value={value} className={classes} required {...props} />
    </div>
);

interface ResultItemProps {
    label: string;
    value: string;
    colorClasses: ToolColorSchema['tool'];
    isMonthly?: boolean;
}

const ResultItem: React.FC<ResultItemProps> = ({ label, value, colorClasses, isMonthly }) => (
    <div
        className={`flex justify-between items-center p-3 rounded-lg ${colorClasses.bg} border-l-4 ${colorClasses.border} font-semibold text-base`}
    >
        <span className="text-gray-700">{label}</span>
        <span className={`text-gray-900 ${colorClasses.text}`}>{value}</span>
    </div>
);
