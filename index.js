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

// Serve os arquivos estáticos a partir da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));
// Serve o bundle compilado do React a partir da pasta 'dist'
app.use(express.static(path.join(__dirname, 'dist')));

// Rota para o dashboard, que agora serve o HTML de entrada para o React
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Rota para a página de cadastro, que também será um componente React
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

// Usa a rota para processar o texto, buscar gastos e o cadastro manual
app.use('/texto', textoRouter);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
