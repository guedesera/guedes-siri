// utils/gemini.js
// Funções para interagir com a API do Google AI (Gemini)

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { categorias } = require('../config/categorias');

const apiKey = process.env.GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(apiKey);

async function extractFinancialData(text) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash-latest',
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: 'OBJECT',
                properties: {
                    'descricao': { 'type': 'STRING' },
                    'valor': { 'type': 'NUMBER' },
                    'categoria': {
                        'type': 'STRING',
                        'enum': categorias
                    }
                },
                'propertyOrdering': ['descricao', 'valor', 'categoria']
            }
        }
    });

    const prompt = `Extraia a descrição, o valor e a categoria de gasto da seguinte frase. 
    A descrição deve ser um texto curto, o valor um número e a categoria deve ser uma das seguintes: ${categorias.join(', ')}.
    
    Exemplos:
    - "Gastei 50 reais no café hoje" -> {"descricao": "Café", "valor": 50, "categoria": "Alimentação"}
    - "Paguei 1500 de aluguel" -> {"descricao": "Aluguel", "valor": 1500, "categoria": "Moradia"}
    - "Comprei um livro por R$ 45,90" -> {"descricao": "Livro", "valor": 45.9, "categoria": "Educação"}
    - "Uber para o trabalho 35 reais" -> {"descricao": "Uber", "valor": 35, "categoria": "Transporte"}
    
    Frase a ser analisada: "${text}"`;

    try {
        const result = await model.generateContent(prompt);
        const responseJson = JSON.parse(result.response.text());
        return responseJson;
    } catch (error) {
        console.error('Erro ao chamar a API do Google AI:', error.message);
        throw new Error('Falha ao extrair os dados financeiros.');
    }
}

module.exports = { extractFinancialData };
