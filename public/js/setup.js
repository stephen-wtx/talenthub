// Configuração Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBET-amWuWJ0l5_7kGF7jTSw3eRmUB2D8s",
    authDomain: "talenthub-3301.firebaseapp.com",
    databaseURL: "https://talenthub-3301-default-rtdb.firebaseio.com",
    projectId: "talenthub-3301",
    storageBucket: "talenthub-3301.firebasestorage.app",
    messagingSenderId: "182103061774",
    appId: "1:182103061774:web:9820e812dabcb7a65d135f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Forçar início no topo ao carregar
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// CHAVE MESTRA
const CHAVE_MESTRA_SISTEMA = "UCM2026"; 

document.getElementById('adminForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const chaveDigitada = document.getElementById('masterKey').value.trim();
    const btn = document.getElementById('btnAcao');
    const nomeInput = document.getElementById('nome').value.trim();
    const emailInput = document.getElementById('email').value.trim().toLowerCase();
    const senhaInput = document.getElementById('senha').value;

    // Validação de Segurança
    if (chaveDigitada !== CHAVE_MESTRA_SISTEMA) {
        Swal.fire({
            icon: 'error',
            title: 'Chave Inválida!',
            text: 'Você não tem permissão para realizar esta operação administrativa.',
            background: '#ffffff',
            color: '#000000',
            confirmButtonColor: '#ef4444'
        });
        return;
    }

    if (nomeInput.split(' ').length < 2) {
        Swal.fire({
            icon: 'info',
            title: 'Nome Incompleto',
            text: 'Por favor, insira o nome completo do gestor.',
            background: '#ffffff',
            color: '#000000',
            confirmButtonColor: '#000000'
        });
        return;
    }

    if (senhaInput.length < 6) {
        Swal.fire({
            icon: 'warning',
            title: 'Senha Fraca',
            text: 'A senha de acesso administrativo deve conter no mínimo 6 caracteres.',
            background: '#ffffff',
            color: '#000000',
            confirmButtonColor: '#000000'
        });
        return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    btn.disabled = true;

    const novoAdmin = {
        nome: nomeInput,
        email: emailInput,
        senha: senhaInput,
        tipo: "admin", 
        status: "ativo",
        dataCriacao: new Date().toLocaleString()
    };

    // Salvar no Banco de Dados
    db.ref('usuarios').push(novoAdmin)
    .then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Acesso Criado!',
            text: 'A nova conta administrativa foi registada com sucesso.',
            background: '#ffffff',
            color: '#000000',
            showConfirmButton: false,
            timer: 2000
        }).then(() => {
            window.location.href = 'login.html';
        });
    })
    .catch(err => {
        Swal.fire({
            icon: 'error',
            title: 'Erro de Sistema',
            text: err.message,
            background: '#ffffff',
            color: '#000000',
            confirmButtonColor: '#000000'
        });
        btn.innerHTML = '<i class="fas fa-user-plus"></i> CRIAR CONTA ADMIN';
        btn.disabled = false;
    });
});