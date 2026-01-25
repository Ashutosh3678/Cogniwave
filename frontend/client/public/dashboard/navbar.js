/**
 * Centralized Navigation Bar Component
 * This file creates and injects the navigation bar into all dashboard pages
 */

// Get the current page to highlight active nav item
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    return page || 'dash.html';
}

// Generate navigation HTML
function generateNavbar() {
    const currentPage = getCurrentPage();
    
    const navItems = [
        { href: 'dash.html', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dash.html' },
        { href: 'diagnostics.html', icon: 'fas fa-stethoscope', label: 'Diagnostics', page: 'diagnostics.html' },
        { href: 'schedule.html', icon: 'far fa-calendar-alt', label: 'Schedule', page: 'schedule.html' },
        { href: 'chatbot.html', icon: 'fas fa-comments', label: 'AI Assistant', page: 'chatbot.html' },
        { href: 'history.html', icon: 'fas fa-chart-line', label: 'Analytics', page: 'history.html' }
    ];

    const navHTML = `
        <header class="fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <!-- Logo Area -->
            <div class="flex items-center">
                <h1 class="text-3xl font-bold text-primary tracking-tight">cogni<span class="text-accent">:wave</span></h1>
            </div>
            
            <!-- Navigation Pills -->
            <nav class="bg-white rounded-full px-2 py-2 shadow-sm flex items-center space-x-1">
                ${navItems.map(item => {
                    const isActive = currentPage === item.page;
                    const activeClasses = 'bg-primary text-white';
                    const inactiveClasses = 'text-gray-500 hover:text-primary hover:bg-primary-light';
                    
                    return `
                        <a class="${isActive ? activeClasses : inactiveClasses} px-5 py-2.5 rounded-full flex items-center text-sm font-medium transition-colors" 
                           href="${item.href}">
                            <i class="${item.icon} mr-2"></i> ${item.label}
                        </a>
                    `;
                }).join('')}
            </nav>
            
            <!-- User Profile Area -->
            <div class="flex items-center space-x-4">
                <div class="text-right hidden sm:block">
                    <div class="text-sm font-bold text-gray-900">Sai Charan</div>
                    <div class="text-xs text-gray-500 flex items-center justify-end">
                        <i class="fas fa-map-marker-alt mr-1 text-gray-400"></i> Hyderabad
                    </div>
                </div>
                
                <!-- Avatar -->
                <button id="profileBtn" class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm hover:border-primary transition-all cursor-pointer">
                    <img alt="Sai Charan" class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"/>
                </button>
                
                <!-- Notification Button -->
                <button id="notificationBtn" class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500 hover:text-primary transition-colors relative">
                    <i class="far fa-bell"></i>
                    <span id="notificationBadge" class="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
            </div>
        </header>
    `;

    return navHTML;
}

// Initialize navigation on page load
function initializeNavbar() {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer) {
        navContainer.innerHTML = generateNavbar();
    } else {
        console.error('Navigation container not found. Please add <div id="navbar-container"></div> to your HTML.');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavbar);
} else {
    initializeNavbar();
}
