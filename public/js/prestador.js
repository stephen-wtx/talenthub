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

const userLogado = JSON.parse(localStorage.getItem('usuarioAtual'));

if (!userLogado || (userLogado.tipo !== 'prestador' && userLogado.type !== 'prestador')) {
    window.location.href = 'login.html';
}

function definirFoto(u) {
    if (u.fotoBase64) return u.fotoBase64;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nome)}&background=0f172a&color=fff&size=128`;
}

// Preencher cabeçalho
document.getElementById('nomeHeader').textContent = userLogado.nome.split(' ')[0];
const minhaFoto = definirFoto(userLogado);
document.getElementById('imgHeader').src = minhaFoto;
document.getElementById('imgReputacao').src = minhaFoto;

function carregarPainel() {
    db.ref('/').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const avaliacoes = Object.values(data.avaliacoes || {});
        const usuarios = Object.values(data.usuarios || {});
        const servicos = Object.values(data.servicos || {});

        // Lógica de reputação
        const minhasAvaliacoes = avaliacoes.filter(a => a.prestador === userLogado.email);
        const mediaElem = document.getElementById('mediaNota');
        const estrelasElem = document.getElementById('estrelasMedia');
        const totalElem = document.getElementById('totalAvaliacoes');

        if (minhasAvaliacoes.length === 0) {
            mediaElem.textContent = "0.0";
            estrelasElem.textContent = "☆☆☆☆☆";
            totalElem.textContent = "Nenhum feedback recebido ainda.";
        } else {
            const soma = minhasAvaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
            const media = (soma / minhasAvaliacoes.length).toFixed(1);
            mediaElem.textContent = media;
            totalElem.textContent = `Baseado em ${minhasAvaliacoes.length} avaliações`;
            const notaArredondada = Math.round(media);
            estrelasElem.textContent = "★".repeat(notaArredondada) + "☆".repeat(5 - notaArredondada);
        }

        // Listagem de colegas (Rede)
        const container = document.getElementById('listaPreview');
        container.innerHTML = '';

        const outrosColegas = usuarios.filter(u => {
            const ehOutro = (u.tipo === 'prestador' || u.type === 'prestador') && u.email !== userLogado.email;
            return ehOutro && u.status !== 'bloqueado';
        });

        if (outrosColegas.length === 0) {
            container.innerHTML = '<p style="color:#64748b; grid-column:1/-1; text-align:center;">Você é o único profissional online agora.</p>';
        } else {
            outrosColegas.reverse().slice(0, 8).forEach(p => {
                const serv = servicos.filter(s => s.emailPrestador === p.email).pop();
                if (serv) {
                    const fotoColega = definirFoto(p);
                    container.innerHTML += `
                        <div class="card-mini">
                            <img src="${fotoColega}" class="avatar-mini">
                            <span class="servico-label">${serv.categoria}</span>
                            <strong style="font-size:0.9em; color:#fff;">${p.nome}</strong>
                            <p style="font-size: 0.7em; color: #94a3b8; margin: 5px 0;">📍 ${serv.localizacao}</p>
                            <button class="btn-perfil-mini" onclick="window.location.href='cliente.html'">
                                Ver na Rede
                            </button>
                        </div>
                    `;
                }
            });
        }
    });
}

function fazerLogout() {
    Swal.fire({
        title: 'Sair do Painel?',
        text: "Terá de fazer login novamente para acessar.",
        icon: 'warning',
        background: '#1e293b',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Sair',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('usuarioAtual');
            window.location.href = 'login.html';
        }
    });
}

carregarPainel();