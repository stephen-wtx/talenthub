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

// Inicializar Animações AOS
AOS.init({ duration: 800, once: true });

// Forçar início no topo
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// Partículas de fundo (estilo discreto)
if (document.getElementById('particles-js')) {
    particlesJS('particles-js', {
        "particles": {
            "number": { "value": 30 },
            "color": { "value": "#000000" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.15 },
            "size": { "value": 2.5 },
            "line_linked": { "enable": true, "distance": 150, "color": "#000000", "opacity": 0.08, "width": 1 },
            "move": { "enable": true, "speed": 1 }
        }
    });
}

function togglePassword() {
    const input = document.getElementById('senha');
    const icon = document.getElementById('icon-eye');
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = "password";
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value;
    const btn = document.getElementById('btnEntrar');

    btn.innerHTML = `<span>AUTENTICANDO...</span> <i class="fas fa-spinner fa-spin"></i>`;
    btn.disabled = true;

    // Regra Admin Master
    if (email === "admin@gmail.com" && senha === "1234") {
        localStorage.setItem('usuarioAtual', JSON.stringify({ nome: "Master Admin", email, tipo: "admin", status: "ativo" }));
        window.location.href = 'admin.html';
        return;
    }

    db.ref('usuarios').once('value', (snapshot) => {
        const usuarios = snapshot.val();
        let user = null;

        for (let key in usuarios) {
            if (usuarios[key].email.toLowerCase() === email && usuarios[key].senha === senha) {
                user = usuarios[key];
                break;
            }
        }

        if (user) {
            if (user.status === 'bloqueado') {
                Swal.fire({ 
                    icon: 'warning', 
                    title: 'Acesso Negado', 
                    text: 'Conta suspensa pelo sistema.', 
                    background: '#ffffff', 
                    color: '#000000',
                    confirmButtonColor: '#000000'
                });
                btn.innerHTML = `<span>ENTRAR NO SISTEMA</span> <i class="fas fa-sign-in-alt"></i>`;
                btn.disabled = false;
                return;
            }

            localStorage.setItem('usuarioAtual', JSON.stringify(user));
            window.location.href = user.tipo === 'admin' ? 'admin.html' : (user.tipo === 'prestador' ? 'prestador.html' : 'cliente.html');
        } else {
            Swal.fire({ 
                icon: 'error', 
                title: 'Erro de Login', 
                text: 'Credenciais inválidas.', 
                background: '#ffffff', 
                color: '#000000',
                confirmButtonColor: '#000000'
            });
            btn.innerHTML = `<span>ENTRAR NO SISTEMA</span> <i class="fas fa-sign-in-alt"></i>`;
            btn.disabled = false;
        }
    });
});