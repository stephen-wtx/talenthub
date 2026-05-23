// Função para lidar com o Login
async function fazerLogin(email, senha) {
    // No mundo real, faríamos um fetch para o backend. 
    // Para este MVP, vamos simular a lógica com base no que salvamos no cadastro.
    
    // 1. Simulação: Pegar os dados que o usuário cadastrou (que o server.js salvaria no JSON)
    // Aqui vamos buscar no localStorage para testar sem banco de dados real por enquanto
    const usuariosCadastrados = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    const usuario = usuariosCadastrados.find(u => u.email === email && u.senha === senha);

    if (usuario) {
        // Salva quem é o usuário atual para as outras páginas saberem o nome dele
        localStorage.setItem('usuarioAtual', JSON.stringify(usuario));

        // Lógica de Redirecionamento solicitada:
        if (usuario.tipo === 'prestador') {
            window.location.href = 'prestador.html';
        } else {
            window.location.href = 'cliente.html';
        }
    } else {
        alert("E-mail ou senha incorretos. Tente novamente ou crie uma conta.");
    }
}

// Vincula ao formulário de login se ele existir na página
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        fazerLogin(email, senha);
    });
}