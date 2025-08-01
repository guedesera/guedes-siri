// index.js
// Arquivo principal do servidor Express
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Carrega as variáveis de ambiente no início
dotenv.config();

// Importa a rota que processa o texto, busca os gastos e agora o cadastro manual
const textoRouter = require('./routes/texto');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rota para o dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Rota para a página de cadastro
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'cadastro.html'));
});

// Usa a rota para processar o texto, buscar gastos e o cadastro manual
app.use('/texto', textoRouter);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
