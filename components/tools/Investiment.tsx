import { useEffect, useState } from 'react';
import { ToolColorSchema } from '../toolsData';

async function getServerApiData() {
    let inflacao = 4.7 / 100;
    let cdi = 11.0 / 100;

    try {
        const responseTaxas = await fetch('https://brasilapi.com.br/api/taxas/v1', {
            next: { revalidate: 3600 },
        });

        if (!responseTaxas.ok) {
            const errorText = await responseTaxas.text();
            console.error('Falha ao buscar Taxas no Servidor! Status:', responseTaxas.status, errorText);
            throw new Error('Falha ao buscar Taxas');
        }

        const dataTaxas = await responseTaxas.json();

        // Buscar IPCA
        const ipcaObj = dataTaxas.find((t: any) => t.nome === 'IPCA');
        if (ipcaObj) {
            inflacao = ipcaObj.valor / 100;
        } else {
            console.warn('IPCA não encontrado na API, usando fallback.');
        }

        // Buscar CDI (Taxa DI)
        const cdiObj = dataTaxas.find((t: any) => t.nome === 'CDI');
        if (cdiObj) {
            cdi = cdiObj.valor / 100; // Taxa CDI anual
        } else {
            console.warn('CDI não encontrado na API, usando fallback.');
        }
    } catch (error) {
        console.error('Erro ao buscar Taxas (IPCA/CDI):', error);
    }

    return {
        inflacaoAcumulada: inflacao,
        taxaCDI: cdi,
    };
}

function formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface ResultadoCalculado {
    capitalNecessario: number;
    metaRendaMensal: number;
    ganhoRealLiquidoGlobal: number;
    taxaRealBrutaInput: number; // A taxa que o usuário digitou
    taxaMinimaLCI: number; // Taxa nominal p/ LCI bater o Tesouro
    taxaMinimaCDB: number; // Taxa nominal p/ CDB bater o Tesouro
    taxaMinimaPercCDI: number; // % CDI p/ CDB bater o Tesouro
}

export default function ClientPage({ colors }: { colors: ToolColorSchema }) {
    const [metaRenda, setMetaRenda] = useState(1518);
    const [resultado, setResultado] = useState<ResultadoCalculado | null>(null);
    const [taxaRealBruta, setTaxaRealBruta] = useState(0.0795);
    const [apiData, setApiData] = useState<{ taxaCDI: number; inflacaoAcumulada: number }>({
        taxaCDI: 0,
        inflacaoAcumulada: 0,
    });

    useEffect(() => {
        async function fetchData() {
            const response = await getServerApiData();
            setApiData(response);
        }
        fetchData();
    }, []);

    const inflacaoDisplay = (apiData.inflacaoAcumulada * 100).toFixed(2) + '%';
    const cdiDisplay = (apiData.taxaCDI * 100).toFixed(2) + '%'; // Para mostrar no UI se quisermos

    function handleRendaInput(e: React.ChangeEvent<HTMLInputElement>) {
        setMetaRenda(parseFloat(e.currentTarget.value));
        setResultado(null);
    }

    function handleTaxaRealInput(e: React.ChangeEvent<HTMLInputElement>) {
        const taxaEmPorcentagem = parseFloat(e.currentTarget.value);
        setTaxaRealBruta(taxaEmPorcentagem / 100);
        setResultado(null);
    }

    function calcularCapital() {
        if (isNaN(metaRenda) || metaRenda <= 0) {
            alert('Por favor, preencha a Renda Mensal desejada.');
            return;
        }
        if (isNaN(taxaRealBruta) || taxaRealBruta <= 0) {
            alert('Por favor, preencha uma Taxa Real válida.');
            return;
        }

        const ganhoRealLiquidoGlobal = taxaRealBruta * (1 - 0.15);
        const metaRendaAnual = metaRenda * 12;
        const capitalNecessario = metaRendaAnual / ganhoRealLiquidoGlobal;

        const taxaMinimaLCI = (1 + ganhoRealLiquidoGlobal) * (1 + apiData.inflacaoAcumulada) - 1;
        const taxaMinimaCDB = taxaMinimaLCI / (1 - 0.15);
        const taxaMinimaPercCDI = (taxaMinimaCDB / apiData.taxaCDI) * 100;

        setResultado({
            capitalNecessario: capitalNecessario,
            metaRendaMensal: metaRenda,
            ganhoRealLiquidoGlobal: ganhoRealLiquidoGlobal,
            taxaRealBrutaInput: taxaRealBruta,
            taxaMinimaLCI: taxaMinimaLCI,
            taxaMinimaCDB: taxaMinimaCDB,
            taxaMinimaPercCDI: taxaMinimaPercCDI,
        });
    }

    return (
        <div className="grid gap-5">
            <div>
                <div className="mb-5">
                    <label htmlFor="metaRenda" className="block mb-2 font-bold">
                        Quanto você quer ganhar de Renda Passiva por mês?
                    </label>
                    <input
                        type="number"
                        id="metaRenda"
                        placeholder="Ex: 1518.00"
                        value={metaRenda}
                        onInput={handleRendaInput}
                        className="w-full p-3 border rounded-[5px] text-lg"
                    />
                </div>

                <div id="dadosMercado" className="mt-6 pl-5 rounded-[5px] border-l-[5px] border-l-green-600">
                    <h4 className="text-lg font-semibold mb-3">Dados do Mercado:</h4>
                    <div className="mb-5">
                        <label htmlFor="inflacao" className="block mb-2 font-bold">
                            Inflação (IPCA) Acumulada 12 meses (%)
                        </label>
                        <input
                            type="text"
                            id="inflacao"
                            value={inflacaoDisplay}
                            disabled
                            className="w-full p-3 border rounded-[5px] text-lg disabled:text-gray-500 disabled:cursor-not-allowed"
                        />
                        <small className="block mt-[5px]">Buscado automaticamente pela BrasilAPI.</small>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="taxaReal" className="block mb-2 font-bold">
                            Taxa Real Bruta do Título (Ex: IPCA+ X%)
                        </label>
                        <input
                            type="number"
                            id="taxaReal"
                            value={(taxaRealBruta * 100).toFixed(2)}
                            onInput={handleTaxaRealInput}
                            className="w-full p-3 border rounded-[5px] text-lg"
                        />
                        <small className="block mt-[5px]">
                            Digite a taxa real (o "X%") que você encontrou no site do Tesouro.
                        </small>
                    </div>
                </div>

                <button
                    onClick={calcularCapital}
                    className="w-full bg-blue-600 text-white py-3 px-5 rounded-[5px] cursor-pointer text-lg font-bold transition-colors duration-300 ease-in-out hover:bg-blue-800 mt-5"
                >
                    Calcular Capital Necessário
                </button>
            </div>

            {resultado && (
                <div id="resultado" className="p-5 rounded-[5px] border-l-[5px] border-l-blue-600">
                    {/* Removido o H2 do Capital aqui */}
                    <h3 className="text-xl font-semibold mb-4">Estratégia Sugerida:</h3>

                    <div className="fase mt-4 pt-4 border-t border-dashed border-[#444]">
                        <h4 className="text-lg font-bold">FASE 1: ACUMULAÇÃO (Como chegar lá)</h4>
                        <p className="mt-2">
                            <strong>Objetivo:</strong> Atingir {formatarMoeda(resultado.capitalNecessario)} o mais
                            rápido possível.
                        </p>
                        <p className="mt-2">
                            <strong>Estratégia:</strong> Buscar o maior ganho líquido possível, reinvestindo 100% dos
                            rendimentos. O Tesouro IPCA+ que você informou rende{' '}
                            <strong>{(resultado.ganhoRealLiquidoGlobal * 100).toFixed(2)}%</strong> acima da inflação
                            (líquido). Para acelerar, busque opções que rendam mais que isso.
                        </p>
                        <p className="mt-2">
                            <strong>Recomendações (Taxas Mínimas para Superar o Tesouro IPCA+):</strong>
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 pl-4">
                            <li>
                                <strong>LCIs/LCAs Prefixadas (Isentas de IR):</strong> Acima de{' '}
                                <strong>{(resultado.taxaMinimaLCI * 100).toFixed(2)}% ao ano</strong>.
                                <br />
                                <small className="text-gray-600">
                                    Vantagem: Sem imposto, a taxa nominal necessária é menor.
                                </small>
                            </li>
                            <li>
                                <strong>CDBs/Tesouro Prefixado (Com IR de 15%):</strong> Acima de{' '}
                                <strong>{(resultado.taxaMinimaCDB * 100).toFixed(2)}% ao ano</strong>.
                                <br />
                                <small className="text-gray-600">
                                    Desvantagem: Precisa render mais para compensar o imposto.
                                </small>
                            </li>
                            <li>
                                <strong>CDBs Pós-Fixados (Com IR de 15%):</strong> Acima de{' '}
                                <strong>{resultado.taxaMinimaPercCDI.toFixed(0)}% do CDI</strong>.
                                <br />
                                <small className="text-gray-600">
                                    (Considerando CDI de {cdiDisplay}. Se o CDI mudar, esse percentual também muda).
                                </small>
                            </li>
                        </ul>
                    </div>

                    <div className="fase mt-4 pt-4 border-t border-dashed border-[#444]">
                        <h4 className="text-lg font-bold">FASE 2: RENDA (Como viver do capital)</h4>
                        <p className="mt-2">
                            <strong>Objetivo:</strong> Sacar {formatarMoeda(resultado.metaRendaMensal)} por mês sem
                            perder o poder de compra.
                        </p>
                        <p className="mt-2">
                            <strong>Estratégia:</strong> Investir o Capital-Alvo (
                            {formatarMoeda(resultado.capitalNecessario)}) no{' '}
                            <strong>Tesouro IPCA+ com Juros Semestrais</strong> com a taxa real bruta de{' '}
                            <strong>{(resultado.taxaRealBrutaInput * 100).toFixed(2)}%</strong> que você informou.
                        </p>
                        <p className="mt-2">
                            <strong>Recomendação:</strong> Este título automaticamente protege o capital da inflação
                            (IPCA) e deposita seu "salário" (os juros reais) na sua conta a cada 6 meses, já com o IR
                            descontado.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
