document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.querySelector('.header-container') || document.querySelector('header');
    if (!headerContainer) return;

    // Procura os links de navegação
    const navLinks = headerContainer.querySelector('.nav-links, #nav-area');
    if (!navLinks) return;

    // Cria o Botão Hambúrguer se não existir
    if (!document.querySelector('.hamburger-btn')) {
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.className = 'hamburger-btn';
        hamburgerBtn.setAttribute('aria-label', 'Abrir Menu de Navegação');
        hamburgerBtn.innerHTML = '<i class="fas fa-bars"></i>';
        
        // Insere o botão hambúrguer no container do header
        headerContainer.appendChild(hamburgerBtn);

        // Cria o Overlay e o Drawer Offcanvas
        const overlay = document.createElement('div');
        overlay.className = 'drawer-overlay';

        const drawer = document.createElement('div');
        drawer.className = 'mobile-drawer';

        // Cabeçalho do Drawer com botão de fechar
        const drawerHeader = document.createElement('div');
        drawerHeader.className = 'drawer-header';
        drawerHeader.innerHTML = `
            <strong>MENU</strong>
            <button class="drawer-close-btn" aria-label="Fechar Menu"><i class="fas fa-times"></i></button>
        `;
        drawer.appendChild(drawerHeader);

        // Corpo do Drawer
        const drawerBody = document.createElement('div');
        drawerBody.className = 'drawer-body';
        drawer.appendChild(drawerBody);

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);

        // Função para sincronizar os links no drawer (inclui links dinâmicos como o link de Painel)
        const syncDrawerLinks = () => {
            drawerBody.innerHTML = '';
            if (navLinks) {
                Array.from(navLinks.children).forEach(link => {
                    if (link.tagName === 'A') {
                        const cloned = link.cloneNode(true);
                        cloned.addEventListener('click', closeDrawer);
                        drawerBody.appendChild(cloned);
                    }
                });
            }
        };

        // Funções para Abrir e Fechar
        const openDrawer = () => {
            syncDrawerLinks();
            drawer.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeDrawer = () => {
            drawer.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        hamburgerBtn.addEventListener('click', openDrawer);
        drawer.querySelector('.drawer-close-btn').addEventListener('click', closeDrawer);
        overlay.addEventListener('click', closeDrawer);

        // Fechar ao pressionar a tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('active')) {
                closeDrawer();
            }
        });
    }
});