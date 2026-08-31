const categoriasLista = [
    "Eletricista", "Canalizador", "Carpinteiro", "Pedreiro", "Mecânico", 
    "Programador", "Técnico de informática", "Web designer", "Especialista em redes", 
    "Suporte técnico", "Contabilista", "Secretariado", "Digitador", 
    "Assistente virtual", "Designer gráfico", "Fotógrafo", "Editor de vídeo", 
    "Redator", "Professor", "Tutor", "Formador profissional", "Enfermeiro", 
    "Psicólogo", "Personal trainer", "Massagista", "Motorista", "Entregador", 
    "Serviços de mudanças", "Empregada doméstica", "Jardineiro", "Babá", 
    "Advogado", "Consultor", "Engenheiro"
];

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

if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

const usuarioLogado = JSON.parse(localStorage.getItem('usuarioAtual'));
if (!usuarioLogado) {
    window.location.href = 'login.html';
} else {
    document.getElementById('nomeDono').innerText = usuarioLogado.nome;
    document.getElementById('fotoMiniatura').src = usuarioLogado.fotoBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioLogado.nome)}&background=0f172a&color=fff&size=128`;
}

function popularCategorias() {
    const select = document.getElementById('categoria');
    select.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';
    categoriasLista.sort((a, b) => a.localeCompare(b));
    
    categoriasLista.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

window.verificarOutro = function(valor) {
    const campoOutro = document.getElementById('campoOutro');
    const inputOutro = document.getElementById('outraLocalizacao');
    if (valor === 'Outro') {
        campoOutro.style.display = 'block';
        inputOutro.required = true;
    } else {
        campoOutro.style.display = 'none';
        inputOutro.required = false;
        inputOutro.value = '';
    }
};

function limparTexto(texto) {
    return texto.replace(/[^a-zA-ZÀ-ÿ0-9\s,.!?]/g, '');
}

document.getElementById('publicarForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('btnEnviar');
    const valorInput = document.getElementById('valor').value;

    if (valorInput.length > 6) {
        Swal.fire({ 
            icon: 'warning', 
            title: 'Valor Alto', 
            text: 'O valor não pode exceder 6 dígitos.', 
            background: '#ffffff', 
            color: '#000000',
            confirmButtonColor: '#000000'
        });
        return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
    btn.disabled = true;

    let localizacaoFinal = document.getElementById('localizacaoSelect').value;
    const inputOutro = document.getElementById('outraLocalizacao').value;

    if (localizacaoFinal === 'Outro') {
        localizacaoFinal = limparTexto(inputOutro);
    }

    const novoServico = {
        emailPrestador: usuarioLogado.email,
        nomePrestador: usuarioLogado.nome,
        categoria: document.getElementById('categoria').value,
        descricao: limparTexto(document.getElementById('descricao').value),
        valor: valorInput,
        localizacao: localizacaoFinal,
        dataPublicacao: new Date().toLocaleString()
    };

    db.ref('servicos').push(novoServico)
    .then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Anúncio Publicado!',
            text: 'Seu serviço já está disponível para Pemba.',
            background: '#ffffff',
            color: '#000000',
            showConfirmButton: false,
            timer: 2000
        }).then(() => {
            window.location.href = 'meus-servicos.html';
        });
    })
    .catch((error) => {
        Swal.fire({ 
            icon: 'error', 
            title: 'Erro', 
            text: error.message, 
            background: '#ffffff', 
            color: '#000000',
            confirmButtonColor: '#000000' 
        });
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar Serviço';
        btn.disabled = false;
    });
});

popularCategorias();