import React, { useState, useMemo } from 'react';
import { ToolColorSchema } from '../toolsData'; // Assumindo que ToolColorSchema está disponível

// --- Funções de Cálculo Core (Mantidas) ---

function calculatePercentageOfValue(x: number, y: number): number {
    return (x / 100) * y;
}

function calculatePercentOfTotal(y: number, z: number): number {
    if (z === 0) return 0;
    return (y / z) * 100;
}

function calculateDiscountOrIncrease(x: number, y: number, isDiscount: boolean): { finalValue: number; changeAmount: number } {
    const amount = calculatePercentageOfValue(x, y);
    const finalValue = isDiscount ? y - amount : y + amount;
    return { finalValue, changeAmount: amount };
}

// Função utilitária para formatar o resultado
function formatResult(value: number | null | undefined, unit: string = '', fallback: string = 'Aguardando valores...'): string {
    
    // 2. Checagem imediata para null ou undefined
    if (value === null || value === undefined) {
        return fallback;
    }
    
    // 3. Mantemos a checagem para NaN e valores não finitos
    if (isNaN(value) || !isFinite(value)) {
        return fallback;
    }
    
    // 4. Se chegamos aqui, 'value' é garantidamente um número válido
    return `${value.toFixed(4).replace(/\.?0+$/, '')}${unit}`;
}

// --- Componente Principal ---

function PercentageCalculatorCard({ colors }: { colors: ToolColorSchema }) {
    const primaryClasses = colors.primary;
    const resultClasses = colors.tool;

    // Estado unificado para todos os inputs
    const [inputs, setInputs] = useState({
        percentOfX: '',
        totalOfY: '',
        partOfY: '',
        totalOfZ: '',
        rateX: '',
        priceY: '',
    });

    const [isDiscount, setIsDiscount] = useState(true);

    // Classes de estilo
    const baseInputClasses = 'inline-block w-24 sm:w-32 p-1 text-center font-bold text-gray-800 border-b-2 bg-transparent appearance-none transition duration-150 focus:outline-none';
    const inputClasses = `${baseInputClasses} ${primaryClasses.ring.replace('focus:ring-', 'focus:border-').replace('500', '600')}`;
    const resultBoxClasses = `p-3 ${resultClasses.bg} border-l-4 ${resultClasses.border} rounded-lg shadow-inner`;
    const resultTextClasses = `text-2xl font-extrabold ${resultClasses.text} break-words`;
    const radioClasses = `mr-2 ${colors.header.text.replace('text-', 'accent-')}`;

    // Lida com a mudança nos inputs de texto
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Permite apenas números e um ponto decimal
        if (/^[\d.]*$/.test(value)) {
            setInputs((prev) => ({ ...prev, [name]: value }));
        }
    };

    // --- CÁLCULO 1: X% de Y ---
    const result1 = useMemo(() => {
        const x = parseFloat(inputs.percentOfX);
        const y = parseFloat(inputs.totalOfY);
        if (isNaN(x) || isNaN(y)) return null;
        return calculatePercentageOfValue(x, y);
    }, [inputs.percentOfX, inputs.totalOfY]);

    // --- CÁLCULO 2: Y é quantos % de Z ---
    const result2 = useMemo(() => {
        const y = parseFloat(inputs.partOfY);
        const z = parseFloat(inputs.totalOfZ);
        if (isNaN(y) || isNaN(z)) return null;
        return calculatePercentOfTotal(y, z);
    }, [inputs.partOfY, inputs.totalOfZ]);

    // --- CÁLCULO 3: Desconto/Aumento de X% sobre Y ---
    const result3 = useMemo(() => {
        const x = parseFloat(inputs.rateX);
        const y = parseFloat(inputs.priceY);
        if (isNaN(x) || isNaN(y)) return null;
        return calculateDiscountOrIncrease(x, y, isDiscount);
    }, [inputs.rateX, inputs.priceY, isDiscount]);

    // --- Renderização dos Componentes de Linha de Cálculo ---
    const CalculationPhraseRow = ({ title, children, result }: { title: string; children: React.ReactNode; result: number | null }) => (
        <div className="border border-gray-200 p-4 rounded-xl shadow-sm space-y-4">
            <div className="text-xl font-light text-gray-700 leading-relaxed flex flex-wrap items-center">
                {children}
                <div className='flex justify-center items-center ml-4'>
                    <p className="text-gray-600">Resultado:</p>
                    {"  "}
                    {formatResult(result as number, '', '...')}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">            
            <div className="space-y-6">

                {/* --- 1. Quanto é X% de Y --- */}
                <CalculationPhraseRow
                    title="1. Porcentagem de um Valor"
                    result={result1}
                >
                    Quanto é
                    <input
                        type="text"
                        name="percentOfX"
                        value={inputs.percentOfX}
                        onChange={handleInputChange}
                        placeholder="10"
                        className={inputClasses}
                        inputMode="decimal"
                    />
                    % de
                    <input
                        type="text"
                        name="totalOfY"
                        value={inputs.totalOfY}
                        onChange={handleInputChange}
                        placeholder="500"
                        className={inputClasses}
                        inputMode="decimal"
                    />
                    ?
                </CalculationPhraseRow>

                {/* --- 2. Y é quantos % de Z --- */}
                <CalculationPhraseRow
                    title="2. Porcentagem da Parte"
                    result={result2}
                >
                    O número
                    <input
                        type="text"
                        name="partOfY"
                        value={inputs.partOfY}
                        onChange={handleInputChange}
                        placeholder="25"
                        className={inputClasses}
                        inputMode="decimal"
                    />
                    representa quantos % do total
                    <input
                        type="text"
                        name="totalOfZ"
                        value={inputs.totalOfZ}
                        onChange={handleInputChange}
                        placeholder="100"
                        className={inputClasses}
                        inputMode="decimal"
                    />
                    ?
                </CalculationPhraseRow>

                {/* --- 3. Desconto/Aumento de X% sobre Y --- */}
                <div className="border border-gray-200 p-4 rounded-xl shadow-sm space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">3. Cálculo de Desconto ou Aumento</h4>
                    
                    {/* Botões de Ação */}
                    <div className="flex justify-start space-x-4">
                        <label className="flex items-center text-base font-medium text-gray-700">
                            <input
                                type="radio"
                                name="discountMode"
                                checked={isDiscount}
                                onChange={() => setIsDiscount(true)}
                                className={radioClasses}
                            />
                            **Desconto**
                        </label>
                        <label className="flex items-center text-base font-medium text-gray-700">
                            <input
                                type="radio"
                                name="discountMode"
                                checked={!isDiscount}
                                onChange={() => setIsDiscount(false)}
                                className={radioClasses}
                            />
                            **Aumento**
                        </label>
                    </div>

                    {/* Frase de Cálculo */}
                    <div className="text-xl font-light text-gray-700 leading-relaxed flex flex-wrap items-center">
                        Qual o valor final após um {isDiscount ? 'desconto' : 'aumento'} de
                        <input
                            type="text"
                            name="rateX"
                            value={inputs.rateX}
                            onChange={handleInputChange}
                            placeholder="10"
                            className={inputClasses}
                            inputMode="decimal"
                        />
                        % no preço
                        <input
                            type="text"
                            name="priceY"
                            value={inputs.priceY}
                            onChange={handleInputChange}
                            placeholder="99.99"
                            className={inputClasses}
                            inputMode="decimal"
                        />
                        ?
                    </div>

                    {/* Resultados */}
                    {result3 !== null ? (
                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2`}>
                            <div className={resultBoxClasses}>
                                <p className="text-gray-600 font-medium mb-1">Valor Final:</p>
                                <span className={resultTextClasses}>{formatResult(result3.finalValue)}</span>
                            </div>
                            <div className={resultBoxClasses}>
                                <p className="text-gray-600 font-medium mb-1">
                                    Valor {isDiscount ? 'Economizado' : 'Adicionado'}:
                                </p>
                                <span className={resultTextClasses}>{formatResult(result3.changeAmount)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className={resultBoxClasses}>
                            <p className="text-gray-600 font-medium mb-1">Aguardando inputs...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PercentageCalculatorCard;