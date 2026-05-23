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

const userLogado = JSON.parse(localStorage.getItem('usuarioAtual'));
if (!userLogado) window.location.href = 'login.html';

function popularCategoriasEdit() {
    const select = document.getElementById('editCategoria');
    select.innerHTML = '';
    categoriasLista.sort().forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}
popularCategoriasEdit();

function carregarServicos() {
    const tabela = document.getElementById('tabelaServicos');
    db.ref('/').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const servicosObj = data.servicos || {};
        const avaliacoesObj = data.avaliacoes || {};
        const usuarios = data.usuarios || {};
        
        tabela.innerHTML = ''; 
        const meusServicosKeys = Object.keys(servicosObj).filter(key => servicosObj[key].emailPrestador === userLogado.email);
        const avaliacoes = Object.values(avaliacoesObj);
        document.getElementById('contadorServicos').innerText = `Total: ${meusServicosKeys.length} anúncio(s)`;

        if (meusServicosKeys.length === 0) {
            tabela.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:50px; color:#64748b;">Nenhum serviço publicado.</td></tr>';
            return;
        }

        const dono = Object.values(usuarios).find(u => u.email === userLogado.email);
        const fotoUrl = (dono && dono.fotoBase64) ? dono.fotoBase64 : `https://ui-avatars.com/api/?name=${encodeURIComponent(userLogado.nome)}&background=0f172a&color=fff`;

        meusServicosKeys.reverse().forEach(key => {
            const s = servicosObj[key];
            const totalFeeds = avaliacoes.filter(a => a.prestador === userLogado.email && a.categoria === s.categoria).length;
            
            tabela.innerHTML += `
                <tr>
                    <td>
                        <img src="${fotoUrl}" class="foto-tabela">
                        <span class="badge-categoria">${s.categoria}</span>
                    </td>
                    <td style="color:#94a3b8; font-size:0.9em;">${s.descricao.substring(0, 40)}...</td>
                    <td style="font-weight:bold; color:var(--success);">${s.valor} MT</td>
                    <td style="color:#cbd5e1;">📍 ${s.localizacao}</td>
                    <td style="text-align: center; white-space: nowrap;">
                        <button class="btn-action feed" title="Ver Feedbacks" onclick="verFeedServico('${s.categoria}')"><i class="fas fa-comment"></i> ${totalFeeds}</button>
                        <button class="btn-action edit" title="Editar" onclick="abrirEdicao('${key}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-action delete" title="Excluir" onclick="removerServico('${key}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    });
}

window.abrirEdicao = function(key) {
    db.ref('servicos/' + key).once('value', (snapshot) => {
        const s = snapshot.val();
        if(!s) return;
        document.getElementById('editKey').value = key;
        document.getElementById('editCategoria').value = s.categoria;
        document.getElementById('editDescricao').value = s.descricao;
        document.getElementById('editValor').value = s.valor;
        document.getElementById('editLocal').value = s.localizacao;
        document.getElementById('modalEdit').style.display = 'block';
    });
}

document.getElementById('formEditar').onsubmit = function(e) {
    e.preventDefault();
    const key = document.getElementById('editKey').value;
    const novosDados = {
        categoria: document.getElementById('editCategoria').value,
        descricao: document.getElementById('editDescricao').value,
        valor: document.getElementById('editValor').value,
        localizacao: document.getElementById('editLocal').value
    };

    db.ref('servicos/' + key).update(novosDados).then(() => {
        Swal.fire({ icon: 'success', title: 'Atualizado!', text: 'Anúncio atualizado com sucesso.', background: '#1e293b', color: '#fff', timer: 1500, showConfirmButton: false });
        fecharModal('modalEdit');
    });
}

window.verFeedServico = function(categoria) {
    const container = document.getElementById('containerFeeds');
    db.ref('/').once('value', (snapshot) => {
        const data = snapshot.val() || {};
        const avaliacoes = Object.values(data.avaliacoes || {});
        const usuarios = Object.values(data.usuarios || {});
        const feedsFiltrados = avaliacoes.filter(a => a.prestador === userLogado.email && a.categoria === categoria);
        
        container.innerHTML = '';
        if (feedsFiltrados.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding:30px; color:#64748b;">Ainda não existem comentários para este serviço.</p>`;
        } else {
            feedsFiltrados.reverse().forEach(f => {
                const u = usuarios.find(user => user.email === f.cliente);
                const fotoCliente = (u && u.fotoBase64) ? u.fotoBase64 : `https://ui-avatars.com/api/?name=${encodeURIComponent(u ? u.nome : 'C')}&background=random&color=fff`;

                container.innerHTML += `
                    <div class="feedback-item">
                        <div class="stars">${"★".repeat(f.nota)}${"☆".repeat(5-f.nota)}</div>
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            <div style="display:flex; align-items:center;">
                                <img src="${fotoCliente}" style="width:30px; height:30px; border-radius:50%; margin-right:10px; border:1px solid var(--accent);">
                                <span style="font-weight:bold; font-size:0.9em;">${u ? u.nome : 'Cliente'}</span>
                            </div>
                            <span style="font-size:0.7em; color:#64748b;">${f.data}</span>
                        </div>
                        <p class="comentario-texto">"${f.comentario || 'Sem comentário escrito.'}"</p>
                    </div>`;
            });
        }
        document.getElementById('modalFeed').style.display = 'block';
    });
}

window.removerServico = function(firebaseKey) {
    Swal.fire({
        title: 'Remover Anúncio?',
        text: "Esta ação apagará o serviço permanentemente da rede!",
        icon: 'warning',
        background: '#1e293b',
        color: '#fff',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Sim, eliminar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            db.ref('servicos/' + firebaseKey).remove().then(() => {
                Swal.fire({ icon: 'success', title: 'Eliminado!', background: '#1e293b', color: '#fff', timer: 1500, showConfirmButton: false });
            });
        }
    });
}

window.fecharModal = (id) => document.getElementById(id).style.display = 'none';
window.onclick = e => { if (e.target.className === 'modal') e.target.style.display = 'none'; }
carregarServicos();