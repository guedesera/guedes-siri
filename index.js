// index.js
// Arquivo principal do servidor Express
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Importa a rota que processa o texto e agora também a busca por gastos
const textoRouter = require('./routes/texto');

// Carrega as variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Rota para o dashboard
app.get('/dashboard', (req, res) => {
    // Serve o arquivo HTML do dashboard
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Usa a rota para processar o texto e buscar gastos
app.use('/texto', textoRouter);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
