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

const usuarioLogado = JSON.parse(localStorage.getItem('usuarioAtual'));
if (!usuarioLogado) window.location.href = 'login.html';

let servicoSendoAvaliado = null;
let notaSelecionada = 0;

const categoriasLista = ["Eletricista", "Canalizador", "Carpinteiro", "Pedreiro", "Mecânico", "Programador", "Técnico de informática", "Web designer", "Especialista em redes", "Suporte técnico", "Contabilista", "Secretariado", "Digitador", "Assistente virtual", "Designer gráfico", "Fotógrafo", "Editor de vídeo", "Redator", "Professor", "Tutor", "Formador profissional", "Enfermeiro", "Psicólogo", "Personal trainer", "Massagista", "Motorista", "Entregador", "Serviços de mudanças", "Empregada doméstica", "Jardineiro", "Babá", "Advogado", "Consultor", "Engenheiro"];

// Setup Inicial
document.getElementById('nomeUsuario').innerText = usuarioLogado.nome;
const badge = document.getElementById('tipoUsuarioBadge');

if (usuarioLogado.tipo === 'prestador') {
    badge.innerText = "Modo Profissional";
    document.getElementById('btnContainer').innerHTML = `<a href="prestador.html" class="btn-nav" style="border-color:var(--accent); margin: auto;"><i class="fas fa-briefcase"></i> Meu Painel</a>`;
} else {
    badge.innerText = "Modo Cliente";
}

function popularCategoriasFiltro() {
    const select = document.getElementById('filtroCategoria');
    categoriasLista.sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function obterMedia(emailPrestador, todasAvaliacoes) {
    const notas = todasAvaliacoes.filter(a => a.prestador === emailPrestador);
    if (notas.length === 0) return "Novo Talento";
    const soma = notas.reduce((acc, curr) => acc + curr.nota, 0);
    return `★ ${(soma / notas.length).toFixed(1)} (${notas.length})`;
}

function carregarServicos() {
    const grid = document.getElementById('listaPrestadores');
    db.ref('/').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const servicos = Object.values(data.servicos || {});
        const usuarios = Object.values(data.usuarios || {});
        const avaliacoes = Object.values(data.avaliacoes || {});
        
        const texto = document.getElementById('filtroTexto').value.toLowerCase();
        const categoriaFiltro = document.getElementById('filtroCategoria').value;
        const bairroFiltro = document.getElementById('filtroBairroSelect').value;
        const inputOutro = document.getElementById('filtroOutroBairro').value.toLowerCase();
        const bairroReal = bairroFiltro === 'Outro' ? inputOutro : bairroFiltro.toLowerCase();

        grid.innerHTML = '';
        servicos.filter(s => {
            const dono = usuarios.find(u => u.email === s.emailPrestador);
            const ativo = dono && dono.status !== 'bloqueado' && s.emailPrestador !== usuarioLogado.email;
            const matchText = s.nomePrestador.toLowerCase().includes(texto) || s.descricao.toLowerCase().includes(texto);
            const matchCat = categoriaFiltro === "" || s.categoria === categoriaFiltro;
            const matchBairro = bairroReal === "" || s.localizacao.toLowerCase().includes(bairroReal);
            return ativo && matchText && matchCat && matchBairro;
        }).reverse().forEach(s => {
            const dono = usuarios.find(u => u.email === s.emailPrestador);
            const foto = dono.fotoBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.nomePrestador)}&background=0f172a&color=fff`;

            grid.innerHTML += `
                <div class="card-prestador">
                    <div class="rating-avg">${obterMedia(s.emailPrestador, avaliacoes)}</div>
                    <img src="${foto}" class="profile-img-card">
                    <div class="servico-tag">${s.categoria}</div>
                    <h4 style="margin: 5px 0;">${s.nomePrestador}</h4>
                    <p style="font-size: 0.8em; opacity: 0.6; margin-bottom: 10px;">📍 ${s.localizacao}</p>
                    <div class="preco">${s.valor} MT</div>
                    <button class="btn-detalhes" onclick='verPerfil(${JSON.stringify(s)})'>Ver Detalhes</button>
                    <a href="https://wa.me/${dono ? dono.telefone : ''}" target="_blank" class="btn-whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                </div>`;
        });
    });
}

window.marcarEstrelas = function(n) {
    notaSelecionada = n;
    const estrelas = document.querySelectorAll('.star');
    estrelas.forEach((s, i) => s.classList.toggle('active', i < n));
}

window.verPerfil = function(s) {
    servicoSendoAvaliado = s;
    notaSelecionada = 0;
    marcarEstrelas(0);
    document.getElementById('comentarioAvaliacao').value = "";
    
    document.getElementById('detalhePerfil').innerHTML = `
        <h2 style="color:var(--accent); margin:0;">${s.categoria}</h2>
        <p style="font-weight:bold; color: #94a3b8; margin-bottom: 15px;">${s.nomePrestador}</p>
        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; border-left: 4px solid var(--accent);">
            <p style="margin:0;"><strong>Valor:</strong> ${s.valor} MT</p>
            <p style="margin:5px 0 0 0;"><strong>Zona:</strong> ${s.localizacao}</p>
        </div>
        <p style="margin-top: 15px; line-height: 1.6; font-style: italic; opacity: 0.9;">"${s.descricao}"</p>
    `;
    document.getElementById('modalPerfil').style.display = "block";
}

document.getElementById('btnEnviarAvaliacao').onclick = function() {
    if (notaSelecionada === 0) {
        Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Selecione uma nota clicando nas estrelas.', background: '#1e293b', color: '#fff' });
        return;
    }
    
    const novaAvaliacao = {
        cliente: usuarioLogado.email,
        prestador: servicoSendoAvaliado.emailPrestador,
        nota: notaSelecionada,
        comentario: document.getElementById('comentarioAvaliacao').value.trim(),
        data: new Date().toLocaleDateString()
    };

    db.ref('avaliacoes').push(novaAvaliacao).then(() => {
        Swal.fire({ icon: 'success', title: 'Sucesso!', text: 'Sua avaliação foi registrada.', background: '#1e293b', color: '#fff', timer: 2000, showConfirmButton: false });
        fecharModal();
    });
}

window.confirmarSair = function() {
    Swal.fire({
        title: 'Sair da conta?',
        icon: 'question',
        background: '#1e293b',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: '#38bdf8',
        confirmButtonText: 'Sair agora'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('usuarioAtual');
            window.location.href = 'login.html';
        }
    });
}

window.fecharModal = () => document.getElementById('modalPerfil').style.display = "none";
window.onclick = e => { if (e.target.className === 'modal') fecharModal(); }

window.alternarCampoOutro = function(v) {
    document.getElementById('filtroOutroBairro').style.display = v === 'Outro' ? 'block' : 'none';
    carregarServicos();
}

popularCategoriasFiltro();
carregarServicos();