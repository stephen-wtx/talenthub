const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware para processar dados de formulários e JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir arquivos estáticos (HTML, CSS, JS) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal (Home/Início)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Simulação de Banco de Dados com JSON ---

const DATA_FILE = './data.json';

// Função auxiliar para ler dados
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ usuarios: [], servicos: [] }));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE));
};

// Função auxiliar para salvar dados
const saveData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Exemplo de Rota de API para Cadastro (usaremos mais adiante)
app.post('/api/cadastro', (req, res) => {
    const novoUsuario = req.body;
    const data = readData();
    
    data.usuarios.push(novoUsuario);
    saveData(data);
    
    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`--- TalentHub Online ---`);
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
    console.log(`Pressione CTRL+C para parar.`);
});