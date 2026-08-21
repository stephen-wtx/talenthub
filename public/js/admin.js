const ADMIN_MASTER_EMAIL = "admin@gmail.com";

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

const userLogado = JSON.parse(localStorage.getItem('usuarioAtual'));
if (!userLogado || userLogado.tipo !== 'admin') window.location.href = 'login.html';

function syncData(callback) {
    db.ref('/').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        callback({
            usuarios: data.usuarios || {},
            servicos: data.servicos || {},
            avaliacoes: data.avaliacoes || {}
        });
    });
}

window.verDetalhes = function(userKey) {
    db.ref('/').once('value', (snapshot) => {
        const data = snapshot.val() || {};
        const u = data.usuarios[userKey];
        const modalBody = document.getElementById('modalBody');
        document.getElementById('modalTitle').innerText = "Gestão de Utilizador";

        const fotoUrl = u.fotoBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nome)}&background=0f172a&color=fff`;
        const seusServicos = Object.values(data.servicos || {}).filter(s => s.emailPrestador === u.email);

        modalBody.innerHTML = `
            <div style="text-align:center; margin-bottom:20px;">
                <img src="${fotoUrl}" style="width:80px; height:80px; border-radius:50%; border:2px solid var(--color-black); object-fit:cover;">
                <h3 style="margin:10px 0 4px; font-size:18px; font-weight:700; color:var(--color-black);">${u.nome}</h3>
                <span class="tag" style="background:var(--color-black); color:#fff;">${u.tipo.toUpperCase()}</span>
            </div>
            <div class="detalhe-item"><span class="info-label">E-mail:</span><span class="info-valor">${u.email}</span></div>
            <div class="detalhe-item"><span class="info-label">Telefone:</span><span class="info-valor">${u.telefone || 'N/A'}</span></div>
            <div class="detalhe-item"><span class="info-label">Status:</span><span class="info-valor">${u.status}</span></div>
            
            <h4 style="margin:20px 0 10px; font-size:15px; font-weight:700; color:var(--color-black);">Serviços (${seusServicos.length})</h4>
            ${seusServicos.map(s => `<div style="font-size:14px; background:var(--bg-alt); border:1px solid var(--color-gray-light); padding:10px; border-radius:6px; margin-bottom:6px; color:var(--color-black);"><strong>${s.categoria}</strong> - ${s.localizacao}</div>`).join('') || '<p style="color:var(--color-gray-medium); font-size:14px;">Nenhum serviço.</p>'}
        `;
        document.getElementById('modalAdm').style.display = 'block';
    });
}

function renderTable(tipo) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if(document.getElementById('btn-' + tipo)) document.getElementById('btn-' + tipo).classList.add('active');

    syncData((data) => {
        const tbody = document.getElementById('tableBody');
        document.getElementById('tableHead').innerHTML = `<th>Utilizador</th><th>E-mail</th><th>Reputação/Status</th><th>Ações</th>`;
        tbody.innerHTML = '';

        Object.keys(data.usuarios).forEach(key => {
            const u = data.usuarios[key];
            const isMaster = u.email.toLowerCase() === ADMIN_MASTER_EMAIL;
            const souEu = u.email.toLowerCase() === userLogado.email.toLowerCase();
            
            let matches = (tipo === 'bloqueado' && u.status === 'bloqueado') || (u.status !== 'bloqueado' && u.tipo === tipo);

            if (matches) {
                const aval = Object.values(data.avaliacoes).filter(a => a.prestador === u.email);
                const media = aval.length ? (aval.reduce((a,b) => a+b.nota, 0)/aval.length).toFixed(1) : "N/A";
                
                let acoes = isMaster ? `<span class="tag tag-master">MASTER</span>` : (souEu ? `<span class="tag" style="background:#10b981; color:#fff;">VOCÊ</span>` : `
                    <button class="btn-action" onclick="verDetalhes('${key}')">Ver</button>
                    <button class="btn-action btn-block" onclick="alterarStatus('${key}', '${u.status === 'bloqueado' ? 'ativo' : 'bloqueado'}')">${u.status === 'bloqueado' ? 'Reativar' : 'Suspender'}</button>
                    <button class="btn-action btn-block" onclick="removerItem('usuarios', '${key}')"><i class="fas fa-trash"></i></button>
                `);

                tbody.innerHTML += `<tr>
                    <td><img src="${u.fotoBase64 || 'https://ui-avatars.com/api/?name='+u.nome}" class="admin-avatar"><strong>${u.nome}</strong></td>
                    <td>${u.email}</td>
                    <td>${tipo === 'prestador' ? '⭐ '+media : u.status}</td>
                    <td>${acoes}</td>
                </tr>`;
            }
        });
        updateStats(data);
    });
}

function updateStats(data) {
    const users = Object.values(data.usuarios);
    document.getElementById('countPrestadores').innerText = users.filter(u => u.tipo === 'prestador').length;
    document.getElementById('countClientes').innerText = users.filter(u => u.tipo === 'cliente').length;
    document.getElementById('countAdmins').innerText = users.filter(u => u.tipo === 'admin').length;
    document.getElementById('countAvaliacoes').innerText = Object.keys(data.avaliacoes).length;
}

window.renderAllServices = () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-todos-servicos').classList.add('active');
    syncData((data) => {
        document.getElementById('tableHead').innerHTML = `<th>Serviço</th><th>Prestador</th><th>Ações</th>`;
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = Object.keys(data.servicos).map(key => {
            const s = data.servicos[key];
            return `<tr><td><span class="tag">${s.categoria}</span></td><td>${s.nomePrestador}</td><td>
                <button class="btn-action btn-block" onclick="removerItem('servicos', '${key}')">Remover</button></td></tr>`;
        }).join('');
    });
}

window.renderAllComments = () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-comentarios').classList.add('active');
    syncData((data) => {
        document.getElementById('tableHead').innerHTML = `<th>Data</th><th>Comentário</th><th>Ação</th>`;
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = Object.keys(data.avaliacoes).reverse().map(key => {
            const a = data.avaliacoes[key];
            return `<tr><td><small style="color:var(--color-gray-medium);">${a.data}</small></td><td>⭐ ${a.nota} - "${a.comentario}"</td>
                <td><button class="btn-action btn-block" onclick="removerItem('avaliacoes', '${key}')">Apagar</button></td></tr>`;
        }).join('');
    });
}

window.alterarStatus = (key, status) => {
    Swal.fire({ 
        title: 'Confirmar Alteração?', 
        background:'#ffffff', 
        color:'#000000', 
        showCancelButton: true, 
        confirmButtonText: 'Sim',
        confirmButtonColor: '#000000'
    })
    .then(r => { if(r.isConfirmed) db.ref('usuarios/' + key).update({ status: status }); });
}

window.removerItem = (path, key) => {
    Swal.fire({ 
        title: 'Eliminar Permanentemente?', 
        icon: 'warning', 
        background:'#ffffff', 
        color:'#000000', 
        showCancelButton: true, 
        confirmButtonColor: '#ef4444' 
    })
    .then(r => { if(r.isConfirmed) db.ref(path + '/' + key).remove(); });
}

window.confirmarSair = () => {
    localStorage.removeItem('usuarioAtual');
    window.location.href = 'login.html';
}

window.fecharModal = () => document.getElementById('modalAdm').style.display = 'none';

renderTable('prestador');