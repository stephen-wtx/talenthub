// ============================================================
// 1. CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyBET-amWuWJ0l5_7kGF7jTSw3eRmUB2D8s",
    authDomain: "talenthub-3301.firebaseapp.com",
    databaseURL: "https://talenthub-3301-default-rtdb.firebaseio.com",
    projectId: "talenthub-3301",
    storageBucket: "talenthub-3301.firebasestorage.app",
    messagingSenderId: "182103061774",
    appId: "1:182103061774:web:9820e812dabcb7a65d135f"
};

// Inicializa o Firebase (compat v9)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// ============================================================
// 2. INICIALIZAÇÃO DE BIBLIOTECAS VISUAIS (AOS & PARTICLES)
// ============================================================

// AOS - Animações de Scroll
AOS.init({ 
    duration: 800, 
    once: true, // Anima apenas uma vez ao fazer scroll
    mirror: false 
});

// Particles.js - Fundo Interativo Sutis
if (document.getElementById('particles-js')) {
    particlesJS('particles-js', {
        "particles": {
            "number": { "value": 30 },
            "color": { "value": "#000000" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.15 },
            "size": { "value": 2.5 },
            "line_linked": { 
                "enable": true, 
                "distance": 150, 
                "color": "#000000", 
                "opacity": 0.08, 
                "width": 1 
            },
            "move": { "enable": true, "speed": 1 }
        },
        "interactivity": {
            "events": { 
                "onhover": { "enable": true, "mode": "repulse" } 
            }
        }
    });
}


// ============================================================
// 3. EFEITOS E ANIMAÇÕES FUTURISTAS CUSTOMIZADAS
// ============================================================

// Forçar o site a começar no topo ao carregar/recarregar
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
    // Pequeno delay para garantir que outros scripts (como AOS) não interfiram
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 10);
});

// Efeito de Digitação (Typed.js) - Para no FUTURO. e remove o cursor
if (document.getElementById('typed-text')) {
    new Typed('#typed-text', {
        strings: ['SUCESSO.', 'FUTURO.'],
        typeSpeed: 60,
        backSpeed: 30,
        loop: false, // Desativa o loop infinito
        showCursor: true,
        cursorChar: '|',
        onComplete: (self) => {
            // Esconde o cursor piscante quando a digitação terminar
            if (self.cursor) {
                self.cursor.style.display = 'none';
            }
        }
    });
}

// Animação Interativa 3D (Tilt) no Card da UCM
const ucmCard = document.querySelector('.hero-ucm-card');
if (ucmCard) {
    ucmCard.addEventListener('mousemove', (e) => {
        const rect = ucmCard.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Aplica a rotação baseada na posição do mouse
        ucmCard.style.transform = `perspective(1000px) rotateX(${-y / 20}deg) rotateY(${x / 20}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    ucmCard.addEventListener('mouseleave', () => {
        // Restaura a posição original ao tirar o mouse
        ucmCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
}


// ============================================================
// 4. LÓGICA DE NEGÓCIO: SESSÃO, VITRINE E SEGURANÇA
// ============================================================

// Recupera usuário logado do LocalStorage
const usuarioAtivo = JSON.parse(localStorage.getItem('usuarioAtual'));

// Seletor da área de navegação
const navArea = document.getElementById('nav-area');

// Se houver usuário ativo, adiciona link para o Painel correspondente
if (usuarioAtivo && navArea) {
    let destino = 'cliente.html'; // Padrão

    if (usuarioAtivo.tipo === 'prestador') {
        destino = 'prestador.html';
    } else if (usuarioAtivo.tipo === 'admin') {
        destino = 'admin.html';
    }
    
    // Adiciona o link com destaque
    navArea.innerHTML += `
        <a href="${destino}" class="panel-link" style="color: #000000 !important; font-weight: 700;">
            PAINEL (${usuarioAtivo.nome.split(' ')[0]}) <i class="fas fa-arrow-right"></i>
        </a>
    `;
}

// Função para renderizar a vitrine de talentos em tempo real
function renderizarVitrine() {
    const vitrine = document.getElementById('vitrineServicos');
    if (!vitrine) return;

    // Escuta mudanças no banco de dados
    db.ref('/').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const servicos = Object.values(data.servicos || {});
        const usuarios = Object.values(data.usuarios || {});

        // Filtra serviços apenas de prestadores não bloqueados
        const servicosAtivos = servicos.filter(s => {
            const p = usuarios.find(u => u.email === s.emailPrestador);
            return p && p.status !== 'bloqueado';
        });

        // Placeholder se não houver talentos
        if (servicosAtivos.length === 0) {
            vitrine.innerHTML = `
                <p style="text-align:center; grid-column: 1/-1; color: #334155; font-weight: 500; padding: 40px;">
                    Procurando novos talentos na rede...
                </p>`;
            return;
        }

        // Limpa a vitrine antes de renderizar
        vitrine.innerHTML = ''; 

        // Renderiza os últimos 8 serviços cadastrados (ordem reversa)
        servicosAtivos.slice(-8).reverse().forEach(s => {
            const dono = usuarios.find(u => u.email === s.emailPrestador);
            
            // Define a foto (banco ou fallback de iniciais)
            const foto = (dono && dono.fotoBase64) 
                ? dono.fotoBase64 
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.nomePrestador)}&background=0f172a&color=fff`;

            // HTML do Card (AOS handle animation)
            vitrine.innerHTML += `
                <div class="profile-card" data-aos="fade-up">
                    <img src="${foto}" class="profile-img-vitrine" alt="${s.nomePrestador}" loading="lazy">
                    <span class="category-badge">${s.categoria}</span>
                    <strong class="profile-name">${s.nomePrestador}</strong>
                    <p class="profile-location"><i class="fas fa-map-marker-alt"></i> ${s.localizacao}</p>
                    <button onclick="verDetalhesSeguro()" class="glass-btn">VER PERFIL</button>
                </div>
            `;
        });
    });
}

// Função global para gerenciar acesso seguro aos perfis
window.verDetalhesSeguro = () => {
    if (!usuarioAtivo) {
        // Protocolo de Segurança: SweetAlert2
        Swal.fire({
            title: 'Protocolo de Segurança',
            text: 'Autentique-se para visualizar os dados completos deste profissional.',
            icon: 'info',
            background: '#ffffff',
            color: '#000000',
            showCancelButton: true,
            confirmButtonText: 'Iniciar Login',
            confirmButtonColor: '#000000',
            cancelButtonColor: '#334155',
            customClass: {
                confirmButton: 'swal-confirm-dark',
                cancelButton: 'swal-cancel-slate'
            }
        }).then((res) => { 
            if(res.isConfirmed) window.location.href = 'login.html'; 
        });
    } else {
        // Redireciona para a área logada do cliente para ver detalhes
        window.location.href = 'cliente.html';
    }
}

// ============================================================
// 5. EXECUÇÃO INICIAL
// ============================================================
renderizarVitrine();