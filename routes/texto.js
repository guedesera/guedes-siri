// routes/texto.js
// Rota para o endpoint que recebe o texto da Siri e insere no Supabase
// Nova rota para o dashboard que busca os gastos no Supabase

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { extractFinancialData } = require('../utils/gemini');

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Rota POST para processar o texto e inserir gastos
router.post('/', async (req, res) => {
    const { conteudo } = req.body;

    if (!conteudo) {
        return res.status(400).json({ error: 'Campo "conteudo" não encontrado no corpo da requisição.' });
    }

    try {
        const { descricao, valor, categoria } = await extractFinancialData(conteudo);

        // Obter a data atual no formato YYYY-MM-DD
        const dataAtual = new Date().toISOString().split('T')[0];

        // Insere os dados, incluindo a data, na tabela 'gastos' do Supabase
        const { data, error } = await supabase
            .from('gastos')
            .insert({ data: dataAtual, descricao, valor, categoria });

        if (error) {
            console.error('Erro ao inserir dados no Supabase:', error);
            return res.status(500).json({ error: 'Erro ao salvar o gasto no banco de dados.' });
        }

        return res.status(201).json({
            message: 'Gasto registrado com sucesso!',
            data: { data: dataAtual, descricao, valor, categoria }
        });
    } catch (error) {
        console.error('Erro no processamento da requisição:', error.message);
        return res.status(500).json({ error: 'Erro ao processar a frase. Por favor, tente novamente.' });
    }
});

// Nova rota GET para buscar todos os gastos para o dashboard
router.get('/gastos', async (req, res) => {
    try {
        // Extrai os parâmetros de query para mês e ano
        const { mes, ano } = req.query;

        let query = supabase
            .from('gastos')
            .select('*')
            .order('data', { ascending: false })
            .order('id', { ascending: false });

        // Adiciona um filtro de mês e ano se os parâmetros existirem
        if (mes && ano) {
            const dataInicial = `${ano}-${String(mes).padStart(2, '0')}-01`;
            const dataFinal = `${ano}-${String(mes).padStart(2, '0')}-${new Date(ano, mes, 0).getDate()}`;
            query = query.gte('data', dataInicial).lte('data', dataFinal);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar gastos no Supabase:', error);
            return res.status(500).json({ error: 'Erro ao buscar os gastos.' });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Erro ao buscar dados para o dashboard:', error.message);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;
