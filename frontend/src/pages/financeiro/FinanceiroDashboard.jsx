import React, { useEffect, useState } from 'react';
import { getDashboardKPIs } from '../../services/dashboardService';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

export default function FinanceiroDashboard() {
  const [kpis, setKpis] = useState({
    despesas_top5: [],
    receitas_categoria: []
  });
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState('mensal');

  useEffect(() => {
    carregarKPIs(periodo);
  }, [periodo]);

  async function carregarKPIs(periodoSelecionado) {
    setLoading(true);
    setErro(null);
    try {
      const dados = await getDashboardKPIs({ periodo: periodoSelecionado });
      setKpis({
        ...dados,
        despesas_top5: dados.despesas_top5 || [],
        receitas_categoria: dados.receitas_categoria || []
      });
    } catch (err) {
      setErro('Falha ao carregar dashboard.');
    } finally {
      setLoading(false);
    }
  }

  const formatoReal = (valor) =>
    valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';

  const periodos = ['diario', 'semanal', 'mensal'];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard Financeiro</h2>

      {/* Botões de filtro período */}
      <div className="flex gap-2 mb-4">
        {periodos.map((p) => (
          <button
            key={p}
            className={`px-4 py-2 rounded ${
              periodo === p ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setPeriodo(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div className="text-center">Carregando...</div>}
      {erro && <div className="text-center text-red-600">{erro}</div>}

      {!loading && !erro && (
        <>
          {/* KPIs principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardKPI titulo="Receita Real" valor={formatoReal(kpis.receita_real)} cor="green" />
            <CardKPI titulo="Despesas Pagas" valor={formatoReal(kpis.despesas_pagas)} cor="red" />
            <CardKPI
              titulo="Lucro Real"
              valor={formatoReal(kpis.lucro_real)}
              cor={kpis.lucro_real >= 0 ? 'green' : 'red'}
            />
          </div>

          {/* KPIs adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardKPI titulo="Saldo Atual" valor={formatoReal(kpis.saldo_atual)} />
            <CardKPI titulo="Receitas a Receber" valor={formatoReal(kpis.a_receber)} />
            <CardKPI titulo="Despesas a Pagar" valor={formatoReal(kpis.a_pagar)} />
          </div>

          {/* Clientes e Variação mensal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardKPI titulo="Clientes Pendentes" valor={kpis.clientes_pendentes} />
            <CardKPI
              titulo="Variação Receita Mensal"
              valor={`${kpis.variacao_receita_mensal?.toFixed(2)}%`}
            >
              {kpis.variacao_receita_mensal >= 0 ? (
                <TrendingUp className="text-green-500" />
              ) : (
                <TrendingDown className="text-red-500" />
              )}
            </CardKPI>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card titulo="Despesas por Categoria (Top 5)">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={kpis.despesas_top5}
                    dataKey="total"
                    nameKey="categoria"
                    label
                  >
                    {kpis.despesas_top5.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={`hsl(${idx * 72}, 70%, 50%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card titulo="Receitas por Categoria">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kpis.receitas_categoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// Componentes auxiliares
const CardKPI = ({ titulo, valor, cor = 'black', children }) => (
  <div className="shadow-sm bg-white rounded p-4">
    <p className="text-gray-500">{titulo}</p>
    <div className="flex items-center gap-2">
      <span className={`text-2xl font-bold text-${cor}-500`}>{valor}</span>
      {children}
    </div>
  </div>
);

const Card = ({ titulo, children }) => (
  <div className="shadow-sm bg-white rounded p-4">
    <h3 className="text-lg font-semibold mb-2">{titulo}</h3>
    {children}
  </div>
);
