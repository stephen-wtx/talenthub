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

// Inicializar Animações
AOS.init({ duration: 1000, once: true });

// Efeito de Digitação
new Typed('#typed-text', {
    strings: ['Talentos Reais.', 'Soluções Rápidas.', 'O Futuro Local.'],
    typeSpeed: 60,
    backSpeed: 30,
    loop: true
});

// Partículas Futuristas
particlesJS('particles-js', {
    "particles": {
        "number": { "value": 80 },
        "color": { "value": "#38bdf8" },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.5 },
        "size": { "value": 3 },
        "line_linked": { "enable": true, "distance": 150, "color": "#38bdf8", "opacity": 0.4, "width": 1 },
        "move": { "enable": true, "speed": 2 }
    },
    "interactivity": {
        "events": { "onhover": { "enable": true, "mode": "repulse" } }
    }
});

// Lógica de Sessão e Vitrine
const usuarioAtivo = JSON.parse(localStorage.getItem('usuarioAtual'));
if (usuarioAtivo) {
    const nav = document.getElementById('nav-area');
    let destino = usuarioAtivo.tipo === 'prestador' ? 'prestador.html' : 
                  usuarioAtivo.tipo === 'admin' ? 'admin.html' : 'cliente.html';
    
    nav.innerHTML = `
        <div class="user-pill glass-btn">
            <span>Olá, ${usuarioAtivo.nome.split(' ')[0]}</span>
            <a href="${destino}" style="color: #38bdf8; margin-left: 10px; text-decoration: none;">Painel <i class="fas fa-arrow-right"></i></a>
        </div>
    `;
}

function renderizarVitrine() {
    const vitrine = document.getElementById('vitrineServicos');

    db.ref('/').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const servicos = Object.values(data.servicos || {});
        const usuarios = Object.values(data.usuarios || {});
        const avaliacoes = Object.values(data.avaliacoes || {});

        const servicosAtivos = servicos.filter(s => {
            const p = usuarios.find(u => u.email === s.emailPrestador);
            return p && p.status !== 'bloqueado';
        });

        if (servicosAtivos.length === 0) {
            vitrine.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Explorando o horizonte em busca de novos talentos...</p>';
            return;
        }

        vitrine.innerHTML = ''; 
        servicosAtivos.slice(-8).reverse().forEach(s => {
            const dono = usuarios.find(u => u.email === s.emailPrestador);
            const foto = (dono && dono.fotoBase64) ? dono.fotoBase64 : `https://ui-avatars.com/api/?name=${s.nomePrestador}&background=0ea5e9&color=fff`;

            vitrine.innerHTML += `
                <div class="profile-card" data-aos="fade-up">
                    <img src="${foto}" class="profile-img-vitrine">
                    <span>${s.categoria}</span>
                    <strong>${s.nomePrestador}</strong>
                    <p><i class="fas fa-map-marker-alt"></i> ${s.localizacao}</p>
                    <button onclick="verDetalhesSeguro()" class="glass-btn" style="margin-top: 15px; width: 100%; display: block;">Ver Perfil</button>
                </div>
            `;
        });
    });
}

window.verDetalhesSeguro = () => {
    if (!usuarioAtivo) {
        Swal.fire({
            title: 'Protocolo de Segurança',
            text: 'Autentique-se para visualizar dados de contacto e avaliações.',
            icon: 'info',
            background: '#0f172a',
            color: '#fff',
            showCancelButton: true,
            confirmButtonText: 'Iniciar Login',
            confirmButtonColor: '#38bdf8'
        }).then((res) => { if(res.isConfirmed) window.location.href = 'login.html'; });
    } else {
        window.location.href = 'cliente.html';
    }
}

renderizarVitrine();