import React, { useState, useEffect } from 'react';
import {
  GraficoBarraReceitaPendenciasVendas,
  GraficoPizzaMensalidades,
  GraficoFluxoCaixa,          // << novo: linha de fluxo
} from './GraficosFinanceiro';
import FiltrosFinanceiro from './FiltrosFinanceiro';

const PERIODOS = ['diario', 'semanal', 'mensal'];

/* ---------- COMPONENTE CARD KPI ---------- */
function CardKpi({ title, value, color = 'text-gray-800' }) {
  return (
    <div className="flex flex-col bg-white rounded shadow p-4 w-full sm:w-40">
      <span className="text-xs text-gray-500">{title}</span>
      <span className={`text-xl font-bold ${color}`}>
        R$ {Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}
/* ----------------------------------------- */

export default function FinanceiroDashboard() {
  const [periodo, setPeriodo] = useState('mensal');

  /** filtros vindos do componente FiltrosFinanceiro */
  const [filtros, setFiltros] = useState({
    dataInicial: '',
    dataFinal: '',
    tipoDados: 'todos',
    status: 'todos',
  });

  /** dados vindos do backend ------------------- */
  const [dadosMensalidades, setDadosMensalidades] = useState([]);
  const [dadosVendas,       setDadosVendas]       = useState([]);
  const [fluxoCaixa,        setFluxoCaixa]        = useState([]);   // linha
  const [kpis,              setKpis]              = useState(null); // cards

  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState(null);

  /* ----------- troca de período --------------- */
  function mudarPeriodo(p) {
    setPeriodo(p);
    // zera datas para não conflitar
    setFiltros(prev => ({
      ...prev,
      dataInicial: '',
      dataFinal : '',
      tipoDados : 'todos',
      status    : 'todos',
    }));
  }

  /* ----------- busca de dados ----------------- */
  useEffect(() => {
    async function buscarDados() {
      setLoading(true);
      setErro(null);

      try {
        /* monta query-string de filtros */
        const qs = new URLSearchParams();
        if (filtros.dataInicial) qs.append('data_inicial', filtros.dataInicial);
        if (filtros.dataFinal)   qs.append('data_final',   filtros.dataFinal);
        if (filtros.status !== 'todos') qs.append('status', filtros.status);

        /* 1. KPIs & fluxo (sempre traz) ---------- */
        const [resKpis, resFluxo] = await Promise.all([
          fetch(`http://localhost:3001/financeiro/resumo?periodo=${periodo}&${qs}`),
          fetch(`http://localhost:3001/financeiro/fluxo?dias=30&${qs}`)
        ]);
        if (!resKpis.ok)  throw new Error('Erro ao buscar KPIs');
        if (!resFluxo.ok) throw new Error('Erro ao buscar fluxo de caixa');

        const jsonKpis   = await resKpis.json();
        const jsonFluxo  = await resFluxo.json();
        setKpis(jsonKpis);
        setFluxoCaixa(jsonFluxo);   // [{id:'Entradas',data:[{x:'01/05',y:800},…]}, …]

        /* 2. Dados detalhados (filtráveis) ------- */
        if (filtros.tipoDados === 'mensalidades' || filtros.tipoDados === 'todos') {
          const res = await fetch(`http://localhost:3001/financeiro/mensalidades?${qs}`);
          if (!res.ok) throw new Error('Erro ao buscar mensalidades');
          setDadosMensalidades(await res.json());
        } else { setDadosMensalidades([]); }

        if (filtros.tipoDados === 'vendas' || filtros.tipoDados === 'todos') {
          const res = await fetch(`http://localhost:3001/financeiro/vendas-produtos?${qs}`);
          if (!res.ok) throw new Error('Erro ao buscar vendas');
          setDadosVendas(await res.json());
        } else { setDadosVendas([]); }
      } catch (e) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    }
    buscarDados();
  }, [filtros, periodo]);

  /* --------- cálculos para os gráficos -------- */
  const totalRecebido = dadosMensalidades.reduce(
    (acc, m) => acc + (m.status === 'pago' ? Number(m.valor_cobrado) || 0 : 0), 0);
  const totalPendentes = dadosMensalidades.reduce(
    (acc, m) => acc + (m.status === 'em_aberto' ? Number(m.valor_cobrado) || 0 : 0), 0);
  const totalVendas = dadosVendas.reduce(
    (acc, v) => acc + ((v.quantidade || 0) * (v.preco_unitario || 0)), 0);

  const barData = [{
    periodo: periodo.charAt(0).toUpperCase() + periodo.slice(1),
    Receita    : Number(totalRecebido.toFixed(2)),
    Pendencias : Number(totalPendentes.toFixed(2)),
    Vendas     : Number(totalVendas.toFixed(2)),
  }];

  const pieData = [
    { id:'Recebido', label:'Recebido', value:Number(totalRecebido.toFixed(2)), color:'green' },
    { id:'Pendente', label:'Pendente', value:Number(totalPendentes.toFixed(2)), color:'red'   },
  ];

  /* ------------------ UI ---------------------- */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Dashboard Financeiro</h1>

      {/* PERÍODO */}
      <div className="mb-4">
        <label className="font-semibold mr-4">Período:</label>
        {PERIODOS.map(p => (
          <button
            key={p}
            onClick={() => mudarPeriodo(p)}
            className={`px-3 py-1 mr-2 rounded ${periodo===p ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >{p.charAt(0).toUpperCase()+p.slice(1)}</button>
        ))}
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="flex flex-wrap gap-4 mb-6">
          <CardKpi title="Receita Mês"          value={kpis.totalVendasMes + kpis.mensalidades.receita_recebida} color="text-green-600" />
          <CardKpi title="Pendências"           value={kpis.mensalidades.pendencias}                  color="text-red-600"   />
          <CardKpi title="Vendas (Mês)"         value={kpis.totalVendasMes}                          color="text-blue-600"  />
          <CardKpi title="Alunos em Débito"     value={kpis.totalMensalidadesPendentes}              color="text-orange-500"/>
        </div>
      )}

      {/* FILTROS AVANÇADOS */}
      <FiltrosFinanceiro onAplicarFiltros={setFiltros} />

      {loading && <p>Carregando dados...</p>}
      {erro    && <p className="text-red-600">Erro: {erro}</p>}

      {/* GRÁFICOS */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-96 mt-6 bg-white p-4 rounded shadow">
            <div>
              <h2 className="mb-2 font-semibold">Receitas × Pendências × Vendas</h2>
              <GraficoBarraReceitaPendenciasVendas data={barData} periodo={periodo} />
            </div>

            <div>
              <h2 className="mb-2 font-semibold">Mensalidades Pagas × Pendentes</h2>
              <GraficoPizzaMensalidades data={pieData} />
            </div>
          </div>

          {/* Fluxo de caixa linha */}
          <div className="mt-8 bg-white p-4 rounded shadow h-80">
            <h2 className="mb-2 font-semibold">Fluxo de Caixa (últimos 30 dias)</h2>
            <GraficoFluxoCaixa data={fluxoCaixa} />
          </div>
        </>
      )}
    </div>
  );
}
