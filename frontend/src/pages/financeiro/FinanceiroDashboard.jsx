<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import {
  GraficoBarraReceitaPendenciasVendas,
  GraficoPizzaMensalidades,
  GraficoFluxoCaixa,
} from './modals/GraficosFinanceiro';
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

// Função para formatar data dd/mm/yyyy para yyyy-mm-dd (ISO)
function formataDataISO(dataStr) {
  if (!dataStr) return '';
  const [dia, mes, ano] = dataStr.split('/');
  if (!dia || !mes || !ano) return '';
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

export default function FinanceiroDashboard() {
  const [periodo, setPeriodo] = useState('mensal');

  const [filtros, setFiltros] = useState({
    dataInicial: '',
    dataFinal: '',
    tipoDados: 'todos',
    status: 'todos',
  });

  const [dadosMensalidades, setDadosMensalidades] = useState([]);
  const [dadosVendas, setDadosVendas] = useState([]);
  const [fluxoCaixa, setFluxoCaixa] = useState([]);
  const [kpis, setKpis] = useState(null);
  

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  function mudarPeriodo(p) {
    setPeriodo(p);
    setFiltros(prev => ({
      ...prev,
      dataInicial: '',
      dataFinal: '',
      tipoDados: 'todos',
      status: 'todos',
    }));
  }

  useEffect(() => {
    async function buscarDados() {
      setLoading(true);
      setErro(null);

      try {
        // Buscar KPIs
        const resKpis = await fetch(`http://localhost:3001/financeiro/indicadores?periodo=${periodo}`);
        if (!resKpis.ok) throw new Error('Erro ao buscar KPIs');
        const jsonKpis = await resKpis.json();
        setKpis(jsonKpis);

        // Montar query-string com datas formatadas
        const qs = new URLSearchParams();
        if (filtros.dataInicial) qs.append('data_inicial', formataDataISO(filtros.dataInicial));
        if (filtros.dataFinal) qs.append('data_final', formataDataISO(filtros.dataFinal));
        if (filtros.status !== 'todos') qs.append('status', filtros.status);

        // Fluxo de caixa
        const resFluxo = await fetch(`http://localhost:3001/financeiro/fluxo?dias=30&${qs}`);
        if (!resFluxo.ok) throw new Error('Erro ao buscar fluxo de caixa');
        const jsonFluxo = await resFluxo.json();
        setFluxoCaixa(jsonFluxo);

        // Dados detalhados mensalidades
        if (filtros.tipoDados === 'mensalidades' || filtros.tipoDados === 'todos') {
          const res = await fetch(`http://localhost:3001/financeiro/mensalidades?${qs}`);
          if (!res.ok) throw new Error('Erro ao buscar mensalidades');
          setDadosMensalidades(await res.json());
        } else {
          setDadosMensalidades([]);
        }

        // Dados detalhados vendas
        if (filtros.tipoDados === 'vendas' || filtros.tipoDados === 'todos') {
          const res = await fetch(`http://localhost:3001/financeiro/vendas-produtos?${qs}`);
          if (!res.ok) throw new Error('Erro ao buscar vendas');
          setDadosVendas(await res.json());
        } else {
          setDadosVendas([]);
        }
      } catch (e) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    }
    buscarDados();
  }, [filtros, periodo]);

  const totalRecebido = dadosMensalidades.reduce(
    (acc, m) => acc + (m.status === 'pago' ? Number(m.valor_cobrado) || 0 : 0), 0);
  const totalPendentes = dadosMensalidades.reduce(
    (acc, m) => acc + (m.status === 'em_aberto' ? Number(m.valor_cobrado) || 0 : 0), 0);
  const totalVendas = dadosVendas.reduce(
    (acc, v) => acc + ((v.quantidade || 0) * (v.preco_unitario || 0)), 0);

  const barData = [{
    periodo: periodo.charAt(0).toUpperCase() + periodo.slice(1),
    Receita: Number(totalRecebido.toFixed(2)),
    Pendencias: Number(totalPendentes.toFixed(2)),
    Vendas: Number(totalVendas.toFixed(2)),
  }];

  const pieData = [
    { id: 'Recebido', label: 'Recebido', value: Number(totalRecebido.toFixed(2)), color: 'green' },
    { id: 'Pendente', label: 'Pendente', value: Number(totalPendentes.toFixed(2)), color: 'red' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Dashboard Financeiro</h1>

      {/* Períodos sem cursor pointer nem hover */}
      <div className="mb-4">
        <label className="font-semibold mr-4">Período:</label>
        {PERIODOS.map(p => (
          <button
            key={p}
            onClick={() => mudarPeriodo(p)}
            className={`px-3 py-1 mr-2 rounded ${periodo === p ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            style={{ cursor: 'default' }}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Cards KPIs */}
      {kpis && (
        <div className="flex flex-wrap gap-4 mb-6">
          <CardKpi title="Receita Total" value={kpis.receita_total} color="text-green-600" />
          <CardKpi title="Despesas" value={kpis.despesas_total} color="text-red-600" />
          <CardKpi title="Saldo Atual" value={kpis.saldo_atual} color="text-blue-600" />
          <CardKpi title="Pendências" value={kpis.pendencias} color="text-orange-500" />
        </div>
      )}

      <FiltrosFinanceiro onAplicarFiltros={setFiltros} />

      {loading && <p>Carregando dados...</p>}
      {erro && <p className="text-red-600">Erro: {erro}</p>}

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

          <div className="mt-8 bg-white p-4 rounded shadow h-80">
            <h2 className="mb-2 font-semibold">Fluxo de Caixa (últimos 30 dias)</h2>
            <GraficoFluxoCaixa data={fluxoCaixa} />
          </div>
        </>
      )}
=======
import React, { useEffect, useState } from "react";
import KpiCard from "../../components/financeiro/KpiCard";
import ApexLineChart from "../../components/financeiro/ApexLineChart";
import ApexPieChart from "../../components/financeiro/ApexPieChart";

export default function FinanceiroDashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [fluxo, setFluxo] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Filtros (padrão mensal)
  const [periodo, setPeriodo] = useState("mensal");

  useEffect(() => {
    setLoading(true);
    // Supondo que você tenha endpoints: /financeiro-erp/kpis, /financeiro-erp/fluxo, /financeiro-erp/categorias
    Promise.all([
      fetch(`/financeiro-erp/kpis?periodo=${periodo}`).then(r => r.json()),
      fetch(`/financeiro-erp/fluxo?periodo=${periodo}`).then(r => r.json()),
      fetch(`/financeiro-erp/categorias?periodo=${periodo}`).then(r => r.json())
    ])
      .then(([kpis, fluxo, categorias]) => {
        setKpis(kpis);
        setFluxo(fluxo);
        setCategorias(categorias);
      })
      .catch(e => {
        setKpis(null);
        setFluxo([]);
        setCategorias([]);
      })
      .finally(() => setLoading(false));
  }, [periodo]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-4">
        <KpiCard title="Faturamento Recebido" value={kpis?.faturamento_recebido} loading={loading} />
        <KpiCard title="Faturamento Presumido" value={kpis?.faturamento_presumido} loading={loading} />
        <KpiCard title="Total em Clientes (Pendente)" value={kpis?.total_clientes_pendentes} loading={loading} />
        <KpiCard title="Despesas Pagas" value={kpis?.despesas_pagas} loading={loading} />
        <KpiCard title="Lucro Real" value={kpis?.lucro_real} loading={loading} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ApexLineChart title="Fluxo de Caixa" data={fluxo} loading={loading} />
        <ApexPieChart title="Receita por Categoria" data={categorias} loading={loading} />
      </div>
>>>>>>> 8417fe8 (atualizacao de componentes)
    </div>
  );
}
