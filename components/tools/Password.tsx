import React, { useState, useMemo, useCallback } from 'react';
import { ToolColorSchema } from '../toolsData';

// Constantes para os conjuntos de caracteres
const CHARS = {
    LOWER: 'abcdefghijklmnopqrstuvwxyz',
    UPPER: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    NUMBERS: '01234456789',
    SYMBOLS: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
};

/**
 * Função para gerar a senha com base nas configurações.
 * @param length Comprimento da senha.
 * @param options Configurações dos tipos de caracteres.
 * @returns Senha gerada.
 */
function generatePassword(
    length: number,
    options: {
        includeUpper: boolean;
        includeNumbers: boolean;
        includeSymbols: boolean;
        includeLower: boolean;
    }
): string {
    let allChars = '';

    if (options.includeLower) allChars += CHARS.LOWER;
    if (options.includeUpper) allChars += CHARS.UPPER;
    if (options.includeNumbers) allChars += CHARS.NUMBERS;
    if (options.includeSymbols) allChars += CHARS.SYMBOLS;

    if (allChars.length === 0 || length < 1) {
        return ''; // Retorna vazio se não houver caracteres ou o comprimento for inválido
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }

    return password;
}

function PasswordCard({ colors }: { colors: ToolColorSchema }) {
    const primaryClasses = colors.primary;
    const resultClasses = colors.tool;

    // Estado para o comprimento da senha
    const [length, setLength] = useState(16);
    // Estado para as opções de inclusão de caracteres
    const [options, setOptions] = useState({
        includeLower: true,
        includeUpper: true,
        includeNumbers: true,
        includeSymbols: false,
    });
    // Estado para a senha gerada
    const [password, setPassword] = useState('');
    // Estado de feedback de cópia
    const [copyFeedback, setCopyFeedback] = useState('');

    // Função para gerar uma nova senha
    const generateNewPassword = useCallback(() => {
        const newPassword = generatePassword(length, options);
        setPassword(newPassword);
        setCopyFeedback(''); // Limpa o feedback ao gerar nova senha
    }, [length, options]);

    // Efeito para gerar a senha inicial no primeiro render
    useMemo(() => {
        generateNewPassword();
    }, [generateNewPassword]);

    // Função para lidar com a mudança das opções (checkboxes)
    const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setOptions((prev) => {
            const newOptions = { ...prev, [name]: checked };

            // Garante que pelo menos uma opção esteja sempre marcada
            const atLeastOneChecked = Object.values(newOptions).some((val) => val === true);

            if (!atLeastOneChecked) {
                // Se o usuário desmarcar a última opção, forçamos a atual a ficar marcada
                return { ...prev };
            }

            // Se tudo estiver OK, atualizamos e geramos uma nova senha
            setTimeout(() => {
                const updatedPassword = generatePassword(length, newOptions);
                setPassword(updatedPassword);
                setCopyFeedback('');
            }, 0);

            return newOptions;
        });
    };

    // Função para copiar a senha para o clipboard
    const copyToClipboard = () => {
        if (!password) return;

        // Usando document.execCommand('copy') como fallback para ambientes restritos (como iframes)
        const tempInput = document.createElement('textarea');
        tempInput.value = password;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
            document.execCommand('copy');
            setCopyFeedback('Copiada!');
        } catch (err) {
            console.error('Falha ao copiar:', err);
            setCopyFeedback('Erro ao copiar.');
        }
        document.body.removeChild(tempInput);

        setTimeout(() => setCopyFeedback(''), 1500);
    };

    // Verifica se alguma opção está marcada para habilitar a geração
    const isGenerateButtonDisabled = !Object.values(options).some((val) => val === true) || length < 1;

    const inputClasses = `rounded ${primaryClasses.ring.replace('focus:ring-', 'text-').replace('500', '600')} mr-2`;

    return (
        <div className="space-y-6 p-4 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800">Gerador de Senhas</h2>

            {/* --- Seção de Comprimento --- */}
            <div className="pt-2">
                <label htmlFor="password-length" className="block text-gray-700 font-medium mb-2">
                    Comprimento da Senha:
                </label>
                <input
                    type="range"
                    min="8"
                    max="32"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 ${primaryClasses.ring} bg-gray-200`}
                    id="password-length"
                />
                <span className={`block text-right text-lg font-extrabold ${resultClasses.text}`}>{length}</span>
            </div>

            {/* --- Seção de Opções --- */}
            <div className="grid grid-cols-2 gap-4 text-gray-700">
                <label className="flex items-center text-sm">
                    <input
                        type="checkbox"
                        name="includeUpper"
                        checked={options.includeUpper}
                        onChange={handleOptionChange}
                        className={inputClasses}
                    />{' '}
                    Maiúsculas (A-Z)
                </label>
                <label className="flex items-center text-sm">
                    <input
                        type="checkbox"
                        name="includeNumbers"
                        checked={options.includeNumbers}
                        onChange={handleOptionChange}
                        className={inputClasses}
                    />{' '}
                    Números (0-9)
                </label>
                <label className="flex items-center text-sm">
                    <input
                        type="checkbox"
                        name="includeSymbols"
                        checked={options.includeSymbols}
                        onChange={handleOptionChange}
                        className={inputClasses}
                    />{' '}
                    Símbolos (!@#$)
                </label>
                <label className="flex items-center text-sm">
                    <input
                        type="checkbox"
                        name="includeLower"
                        checked={options.includeLower}
                        onChange={handleOptionChange}
                        className={inputClasses}
                    />{' '}
                    Minúsculas (a-z)
                </label>
            </div>

            {/* --- Botão Gerar --- */}
            <button
                onClick={generateNewPassword}
                disabled={isGenerateButtonDisabled}
                className={`w-full text-white p-3 rounded-lg font-semibold transition duration-150 shadow-md transform hover:scale-[1.01] ${
                    isGenerateButtonDisabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : `${primaryClasses.bg} ${primaryClasses.hover}`
                }`}
            >
                Gerar Nova Senha
            </button>

            {/* --- Resultado e Cópia --- */}
            <div
                className={`flex items-center justify-between p-4 ${resultClasses.bg} border-l-4 ${resultClasses.border} rounded-lg shadow-inner cursor-pointer transition duration-150 hover:shadow-md`}
                onClick={copyToClipboard}
                title="Clique para Copiar"
            >
                <span className={`font-mono text-lg font-bold text-gray-800 overflow-hidden break-words mr-4`}>
                    {password || 'Selecione as opções'}
                </span>
                <span
                    className={`text-sm font-semibold whitespace-nowrap transition duration-300 ${
                        copyFeedback === 'Copiada!' ? 'text-green-600' : 'text-gray-500'
                    }`}
                >
                    {copyFeedback || 'Copiar'}
                </span>
            </div>
        </div>
    );
}

export default PasswordCard;
