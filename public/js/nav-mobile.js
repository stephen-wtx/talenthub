document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.querySelector('.header-container') || document.querySelector('header');
    if (!headerContainer) return;

    // Procura os links de navegação
    const navLinks = headerContainer.querySelector('.nav-links, #nav-area');

    // Cria o Botão Hambúrguer se não existir
    if (!document.querySelector('.hamburger-btn')) {
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.className = 'hamburger-btn';
        hamburgerBtn.setAttribute('aria-label', 'Abrir Menu');
        hamburgerBtn.innerHTML = '<i class="fas fa-bars"></i>';
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
            <strong style="font-size:18px; font-weight:800; color:#000;">MENU</strong>
            <button class="drawer-close-btn" aria-label="Fechar Menu"><i class="fas fa-times"></i></button>
        `;
        drawer.appendChild(drawerHeader);

        // Corpo do Drawer (Apenas links de navegação)
        const drawerBody = document.createElement('div');
        drawerBody.className = 'drawer-body';

        if (navLinks) {
            Array.from(navLinks.children).forEach(link => {
                drawerBody.appendChild(link.cloneNode(true));
            });
        }

        drawer.appendChild(drawerBody);
        document.body.appendChild(overlay);
        document.body.appendChild(drawer);

        // Funções para Abrir e Fechar
        const openDrawer = () => {
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

        drawerBody.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeDrawer);
        });
    }
});