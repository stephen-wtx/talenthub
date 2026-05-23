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

// CHAVE MESTRA
const CHAVE_MESTRA_SISTEMA = "UCM2026"; 

document.getElementById('adminForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const chaveDigitada = document.getElementById('masterKey').value;
    const btn = document.getElementById('btnAcao');

    // Validação de Segurança
    if (chaveDigitada !== CHAVE_MESTRA_SISTEMA) {
        Swal.fire({
            icon: 'error',
            title: 'Chave Inválida!',
            text: 'Você não tem permissão para realizar esta operação administrativa.',
            background: '#1e293b',
            color: '#fff',
            confirmButtonColor: '#ef4444'
        });
        return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    btn.disabled = true;

    const novoAdmin = {
        nome: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim(),
        senha: document.getElementById('senha').value,
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
            background: '#1e293b',
            color: '#fff',
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
            background: '#1e293b',
            color: '#fff'
        });
        btn.innerHTML = '<i class="fas fa-user-plus"></i> CRIAR CONTA ADMIN';
        btn.disabled = false;
    });
});