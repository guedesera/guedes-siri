// index.js
// Arquivo principal do servidor Express

const express = require('express');
const dotenv = require('dotenv');
const textoRouter = require('./routes/texto');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor do Chatbot Finanças está funcionando!');
});

app.use('/texto', textoRouter);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
