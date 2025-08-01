// Importa as bibliotecas necessárias do React e do Chart.js
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Adiciona uma verificação para a URL da API
const API_BASE_URL = window.location.origin;
const API_URL = `${API_BASE_URL}/texto/gastos`;

const App = () => {
  const [gastos, setGastos] = useState([]);
  const [gastosFiltrados, setGastosFiltrados] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [totalGastos, setTotalGastos] = useState(0);
  const [numGastos, setNumGastos] = useState(0);
  const [mediaGastos, setMediaGastos] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [gastoSelecionado, setGastoSelecionado] = useState(null);
  
  const categoriasUnicas = [
    "Alimentação", "Transporte", "Moradia", "Lazer", "Contas",
    "Saúde", "Educação", "Compras", "Investimentos", "Outros"
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Falha ao buscar os dados.');
        }
        const data = await response.json();
        setGastos(data);
        setGastosFiltrados(data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (gastosFiltrados.length > 0) {
      const total = gastosFiltrados.reduce((sum, gasto) => sum + parseFloat(gasto.valor), 0);
      setTotalGastos(total);
      setNumGastos(gastosFiltrados.length);
      setMediaGastos(total / gastosFiltrados.length);
    } else {
      setTotalGastos(0);
      setNumGastos(0);
      setMediaGastos(0);
    }
  }, [gastosFiltrados]);

  const handleFiltroChange = (e) => {
    const categoria = e.target.value;
    setFiltroCategoria(categoria);
    if (categoria === '') {
      setGastosFiltrados(gastos);
    } else {
      const filtrados = gastos.filter(gasto => gasto.categoria === categoria);
      setGastosFiltrados(filtrados);
    }
  };

  const mostrarTodosGastos = () => {
    setFiltroCategoria('');
    setGastosFiltrados(gastos);
  };

  const showGastoDetails = (gasto) => {
    setGastoSelecionado(gasto);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setGastoSelecionado(null);
  };
  
  const getChartData = () => {
    const categorias = {};
    gastosFiltrados.forEach(gasto => {
      if (categorias[gasto.categoria]) {
        categorias[gasto.categoria] += parseFloat(gasto.valor);
      } else {
        categorias[gasto.categoria] = parseFloat(gasto.valor);
      }
    });

    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
      '#3b82f6', '#8b5cf6', '#ec4899', '#f472b6', '#6b7280'
    ];
    
    return {
      labels: Object.keys(categorias),
      datasets: [
        {
          data: Object.values(categorias),
          backgroundColor: Object.keys(categorias).map((_, i) => colors[i % colors.length]),
          hoverOffset: 4,
        },
      ],
    };
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-900 text-gray-300 min-h-screen">
      <div className="max-w-7xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Dashboard de Gastos</h1>
          <a href="/cadastro" className="text-white bg-green-600 hover:bg-green-700 p-3 rounded-full shadow-lg transition-colors duration-200" title="Cadastrar novo gasto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </a>
        </header>

        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <label htmlFor="categoria-filtro" className="font-semibold text-gray-300 whitespace-nowrap">Filtrar por Categoria:</label>
            <select
              id="categoria-filtro"
              value={filtroCategoria}
              onChange={handleFiltroChange}
              className="bg-gray-700 text-white rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-auto"
            >
              <option value="">Todas as Categorias</option>
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button
            onClick={mostrarTodosGastos}
            className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md shadow-lg hover:bg-indigo-500 transition-colors duration-200 w-full sm:w-auto"
          >
            Mostrar Todos
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-sm font-semibold text-gray-400">Total de Gastos</p>
            <p id="total-gastos" className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalGastos)}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-sm font-semibold text-gray-400">Número de Gastos</p>
            <p id="num-gastos" className="text-2xl font-bold text-white mt-1">{numGastos}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-sm font-semibold text-gray-400">Média de Gastos</p>
            <p id="media-gastos" className="text-2xl font-bold text-white mt-1">{formatCurrency(mediaGastos)}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-sm font-semibold text-gray-400">Mês Selecionado</p>
            <p id="mes-selecionado" className="text-2xl font-bold text-white mt-1">Atual</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center">
            {gastosFiltrados.length > 0 ? (
              <Doughnut data={getChartData()} />
            ) : (
              <p className="text-gray-400">Sem dados para o gráfico.</p>
            )}
          </div>

          <div className="lg:col-span-2 overflow-x-auto bg-gray-800 rounded-lg shadow-md">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Data</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Descrição</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Categoria</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {gastosFiltrados.length > 0 ? (
                  gastosFiltrados.map((gasto) => (
                    <tr 
                      key={gasto.id} 
                      className="hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                      onClick={() => showGastoDetails(gasto)}
                    >
                      <td className="px-4 py-3">{formatDate(gasto.data)}</td>
                      <td className="px-4 py-3">{gasto.descricao}</td>
                      <td className="px-4 py-3">{gasto.categoria}</td>
                      <td className="px-4 py-3 font-semibold text-red-300">{formatCurrency(gasto.valor)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-center text-gray-400">Nenhum gasto registrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && gastoSelecionado && (
        <div id="modal-gasto" className="modal fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-8 m-4 max-w-sm w-full shadow-lg relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={closeModal}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-2xl font-bold mb-4 text-white">Detalhes do Gasto</h3>
            <div className="space-y-2 text-gray-300">
              <p><strong>Data:</strong> {formatDate(gastoSelecionado.data)}</p>
              <p><strong>Descrição:</strong> {gastoSelecionado.descricao}</p>
              <p><strong>Valor:</strong> {formatCurrency(gastoSelecionado.valor)}</p>
              <p><strong>Categoria:</strong> {gastoSelecionado.categoria}</p>
              <p><strong>ID:</strong> <span className="text-xs">{gastoSelecionado.id}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Ponto de entrada do React
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

export default App;
