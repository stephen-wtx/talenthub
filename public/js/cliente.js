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

// ============================================================
// LÓGICA DE DETEÇÃO DE MODO VISITANTE (GUEST)
// ============================================================
const urlParams = new URLSearchParams(window.location.search);
const isGuest = urlParams.get('mode') === 'guest';
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioAtual'));

// Se não for visitante E não estiver logado, redireciona para login
if (!isGuest && !usuarioLogado) {
    window.location.href = 'login.html';
}

let servicoSendoAvaliado = null;
let notaSelecionada = 0;

const categoriasLista = [
  // Construção e manutenção
  "Eletricista",
  "Canalizador",
  "Carpinteiro",
  "Pedreiro",
  "Pintor",
  "Serralheiro",
  "Soldador",
  "Técnico de ar condicionado",
  "Técnico de refrigeração",
  "Técnico de energia solar",
  "Mecânico",
  "Bate-chapas",
  "Jardineiro",

  // Tecnologia
  "Programador",
  "Técnico de informática",
  "Web designer",
  "Designer UI/UX",
  "Especialista em redes",
  "Suporte técnico",
  "Técnico de CCTV",
  "Técnico de eletrónica",
  "Técnico de telemóveis",

  // Administração e negócios
  "Contabilista",
  "Secretariado",
  "Digitador",
  "Assistente virtual",
  "Consultor",
  "Gestor de projetos",
  "Recursos humanos",
  "Revisor de texto",

  // Design e criatividade
  "Designer gráfico",
  "Ilustrador",
  "Fotógrafo",
  "Editor de vídeo",
  "Videógrafo",
  "Animador",
  "Redator",
  "Copywriter",
  "Poeta",
  "Escritor",

  // Música e entretenimento
  "Cantor",
  "Músico",
  "DJ",
  "Dançarino",
  "Coreógrafo",
  "Ator",
  "Comediante",
  "Apresentador",
  "Animador de eventos",

  // Educação
  "Professor",
  "Tutor",
  "Formador profissional",
  "Professor de música",
  "Professor de dança",
  "Professor de línguas",

  // Saúde e bem-estar
  "Enfermeiro",
  "Psicólogo",
  "Nutricionista",
  "Personal trainer",
  "Massagista",
  "Instrutor de yoga",

  // Beleza
  "Cabeleireiro",
  "Barbeiro",
  "Maquilhador",
  "Manicure",
  "Pedicure",
  "Esteticista",

  // Transporte e logística
  "Motorista",
  "Entregador",
  "Serviços de mudanças",
  "Motorista particular",
  "Guia turístico",

  // Casa e família
  "Empregada doméstica",
  "Babá",
  "Cuidador de idosos",
  "Cuidador de pessoas com deficiência",
  "Lavandaria",
  "Passadeira",

  // Eventos
  "Organizador de eventos",
  "Decorador de eventos",
  "Fotógrafo de eventos",
  "Catering",
  "Garçom",
  "Segurança",

  // Jurídico e engenharia
  "Advogado",
  "Engenheiro",
  "Arquiteto",
  "Topógrafo",
  "Consultor financeiro",
  "Consultor jurídico"
];

// Setup Inicial de acordo com o Tipo de Sessão
const nomeElem = document.getElementById('nomeUsuario');
const badge = document.getElementById('tipoUsuarioBadge');
const btnActionAccount = document.getElementById('btnActionAccount');

if (isGuest) {
    nomeElem.innerText = "Visitante";
    badge.innerText = "Modo Convidado";
    if (btnActionAccount) {
        btnActionAccount.title = "Criar Conta / Login";
        btnActionAccount.innerHTML = `<i class="fas fa-sign-in-alt"></i>`;
    }
} else if (usuarioLogado) {
    nomeElem.innerText = usuarioLogado.nome;
    if (usuarioLogado.tipo === 'prestador') {
        badge.innerText = "Modo Profissional";
        document.getElementById('btnContainer').innerHTML = `<a href="prestador.html" class="btn-nav" style="border-color:var(--color-black); margin: auto;"><i class="fas fa-briefcase"></i> Meu Painel</a>`;
    } else {
        badge.innerText = "Modo Cliente";
    }
}

// ============================================================
// FUNÇÃO CENTRAL DE ALERTA PARA VISITANTES
// ============================================================
function alertaRequerCadastro(mensagemAcao) {
    Swal.fire({
        title: '<i class="fas fa-user-lock" style="color:#000;"></i> Registo Necessário',
        html: `Para <strong>${mensagemAcao}</strong>, precisa de criar uma conta ou iniciar sessão na plataforma <strong>TalentHub</strong>.`,
        icon: 'info',
        background: '#ffffff',
        color: '#000000',
        showCancelButton: true,
        confirmButtonColor: '#000000',
        cancelButtonColor: '#475569',
        confirmButtonText: 'Criar Conta / Login',
        cancelButtonText: 'Continuar a Explorar'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'cadastro.html';
        }
    });
}

function bloquearPerfilVisitante() {
    if (isGuest) {
        alertaRequerCadastro("aceder e editar o seu perfil");
    } else {
        window.location.href = 'perfil.html';
    }
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
            const emailAtual = usuarioLogado ? usuarioLogado.email : '';
            const ativo = dono && dono.status !== 'bloqueado' && s.emailPrestador !== emailAtual;
            const matchText = s.nomePrestador.toLowerCase().includes(texto) || s.descricao.toLowerCase().includes(texto);
            const matchCat = categoriaFiltro === "" || s.categoria === categoriaFiltro;
            const matchBairro = bairroReal === "" || s.localizacao.toLowerCase().includes(bairroReal);
            return ativo && matchText && matchCat && matchBairro;
        }).reverse().forEach(s => {
            const dono = usuarios.find(u => u.email === s.emailPrestador);
            const foto = (dono && dono.fotoBase64) ? dono.fotoBase64 : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.nomePrestador)}&background=0f172a&color=fff`;

            grid.innerHTML += `
                <div class="card-prestador">
                    <div class="rating-avg">${obterMedia(s.emailPrestador, avaliacoes)}</div>
                    <img src="${foto}" class="profile-img-card">
                    <div class="servico-tag">${s.categoria}</div>
                    <h4>${s.nomePrestador}</h4>
                    <p style="font-size: 13px; color: var(--color-gray-medium); margin-bottom: 10px;">📍 ${s.localizacao}</p>
                    <div class="preco">${s.valor} MT</div>
                    <a href="https://wa.me/${dono ? dono.telefone : ''}" target="_blank" class="btn-whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                    <button class="btn-detalhes" onclick='verPerfil(${JSON.stringify(s)})'>Ver Detalhes</button>
                </div>`;
        });
    });
}

window.marcarEstrelas = function(n) {
    if (isGuest) {
        alertaRequerCadastro("submeter uma avaliação");
        return;
    }
    notaSelecionada = n;
    const estrelas = document.querySelectorAll('.star');
    estrelas.forEach((s, i) => s.classList.toggle('active', i < n));
}

window.verPerfil = function(s) {
    servicoSendoAvaliado = s;
    notaSelecionada = 0;
    
    // Se não for convidado, limpa visual das estrelas
    if (!isGuest) marcarEstrelas(0);
    document.getElementById('comentarioAvaliacao').value = "";
    
    document.getElementById('detalhePerfil').innerHTML = `
        <h2 style="color:var(--color-black); margin:0; font-size:22px; font-weight:800;">${s.categoria}</h2>
        <p style="font-weight:600; color: var(--color-gray-medium); margin-bottom: 16px;">${s.nomePrestador}</p>
        <div style="background: var(--bg-alt); padding: 14px; border-radius: 6px; border-left: 4px solid var(--color-black);">
            <p style="margin:0; font-size:15px;"><strong>Valor:</strong> ${s.valor} MT</p>
            <p style="margin:6px 0 0 0; font-size:15px;"><strong>Zona:</strong> ${s.localizacao}</p>
        </div>
        <p style="margin-top: 16px; line-height: 1.6; font-style: italic; color: var(--color-gray-medium); font-size:14px;">"${s.descricao}"</p>
    `;
    document.getElementById('modalPerfil').style.display = "block";
}

document.getElementById('btnEnviarAvaliacao').onclick = function() {
    if (isGuest) {
        alertaRequerCadastro("enviar um comentário ou avaliação");
        return;
    }

    if (notaSelecionada === 0) {
        Swal.fire({ 
            icon: 'warning', 
            title: 'Atenção', 
            text: 'Selecione uma nota clicando nas estrelas.', 
            background: '#ffffff', 
            color: '#000000',
            confirmButtonColor: '#000000'
        });
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
        Swal.fire({ 
            icon: 'success', 
            title: 'Sucesso!', 
            text: 'Sua avaliação foi registrada.', 
            background: '#ffffff', 
            color: '#000000', 
            timer: 2000, 
            showConfirmButton: false 
        });
        fecharModal();
    });
}

window.confirmarSair = function() {
    if (isGuest) {
        window.location.href = 'login.html';
        return;
    }
    
    Swal.fire({
        title: 'Sair da conta?',
        icon: 'question',
        background: '#ffffff',
        color: '#000000',
        showCancelButton: true,
        confirmButtonColor: '#000000',
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