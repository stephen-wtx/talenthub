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

const usuarioAtivo = JSON.parse(localStorage.getItem('usuarioAtual'));
if (!usuarioAtivo) window.location.href = 'login.html';

const btnVoltar = document.getElementById('linkVoltar');
const urlRetorno = usuarioAtivo.tipo === 'prestador' ? 'prestador.html' : 'cliente.html';
btnVoltar.onclick = () => window.location.href = urlRetorno;

// Carregar dados iniciais
document.getElementById('editEmail').value = usuarioAtivo.email;
document.getElementById('editNome').value = usuarioAtivo.nome;
document.getElementById('editTelefone').value = usuarioAtivo.telefone || "";
if (usuarioAtivo.fotoBase64) document.getElementById('imgPreview').src = usuarioAtivo.fotoBase64;

let fotoFinalBase64 = usuarioAtivo.fotoBase64 || "";

window.toggleNovaSenha = function() {
    const area = document.getElementById('areaNovaSenha');
    const btn = document.querySelector('.btn-toggle-password');
    if (area.style.display === "block") {
        area.style.display = "none";
        btn.innerText = "Mudar Senha?";
        document.getElementById('novaSenha').value = "";
    } else {
        area.style.display = "block";
        btn.innerText = "Cancelar Mudança";
    }
};

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 300; 
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            fotoFinalBase64 = canvas.toDataURL('image/jpeg', 0.7); 
            document.getElementById('imgPreview').src = fotoFinalBase64;
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

document.getElementById('perfilForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('btnSalvar');
    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;

    btn.innerText = "Sincronizando...";
    btn.disabled = true;

    db.ref('usuarios').once('value', (snapshot) => {
        const users = snapshot.val();
        const key = Object.keys(users).find(k => users[k].email === usuarioAtivo.email);
        
        if (users[key].senha !== senhaAtual) {
            Swal.fire({
                icon: 'error',
                title: 'Senha Incorreta',
                text: 'A senha atual introduzida não confere.',
                background: '#ffffff',
                color: '#000000',
                confirmButtonColor: '#ef4444'
            });
            btn.disabled = false;
            btn.innerText = "Salvar Alterações";
            return;
        }

        const updates = {
            nome: document.getElementById('editNome').value.trim(),
            telefone: document.getElementById('editTelefone').value.trim(),
            fotoBase64: fotoFinalBase64
        };

        if (novaSenha !== "") {
            if (novaSenha.length < 4) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Senha Curta',
                    text: 'A nova senha deve ter no mínimo 4 caracteres.',
                    background: '#ffffff',
                    color: '#000000',
                    confirmButtonColor: '#000000'
                });
                btn.disabled = false;
                btn.innerText = "Salvar Alterações";
                return;
            }
            updates.senha = novaSenha;
        }

        db.ref('usuarios/' + key).update(updates).then(() => {
            usuarioAtivo.nome = updates.nome;
            usuarioAtivo.telefone = updates.telefone;
            usuarioAtivo.fotoBase64 = updates.fotoBase64;
            if (updates.senha) usuarioAtivo.senha = updates.senha;
            localStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtivo));

            Swal.fire({
                icon: 'success',
                title: 'Perfil Atualizado',
                text: 'Seus dados foram gravados com sucesso!',
                background: '#ffffff',
                color: '#000000',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = urlRetorno;
            });
        });
    });
});