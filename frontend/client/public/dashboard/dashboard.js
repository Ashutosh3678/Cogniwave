// Dashboard JavaScript - Interactive Functionality

// Data
const userData = {
    name: 'Sai Charan',
    location: 'Hyderabad',
    heartRate: 120,
    cholesterolTrend: [150, 140, 130, 145, 155, 142, 138]
};

// Update heart rate with animation
function animateHeartRate() {
    const heartRateEl = document.getElementById('heartRate');
    const heartIcon = document.querySelector('.heart-beat-icon');
    
    if (!heartRateEl || !heartIcon) return;
    
    setInterval(() => {
        const variance = Math.floor(Math.random() * 10) - 5;
        const newRate = userData.heartRate + variance;
        heartRateEl.textContent = newRate + ' bpm';
        
        // Pulse animation
        heartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            heartIcon.style.transform = 'scale(1)';
        }, 100);
    }, 2000);
}

// Medication time tracking
function updateMedicationStatus() {
    const now = new Date();
    const currentHour = now.getHours();
    const medications = document.querySelectorAll('.medication-item');
    
    medications.forEach(med => {
        const time = med.dataset.time;
        if (time && parseInt(time) === currentHour) {
            med.classList.add('medication-active');
        }
    });
}

// Interactive cholesterol chart
function updateCholesterolChart() {
    const chartPath = document.getElementById('cholesterolPath');
    if (!chartPath) return;
    
    const points = userData.cholesterolTrend;
    let pathData = 'M0,150 ';
    
    points.forEach((point, index) => {
        const x = (index * 60);
        const y = 200 - (point / 2);
        pathData += `L${x},${y} `;
    });
    
    pathData += 'V200 H0 Z';
    chartPath.setAttribute('d', pathData);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-24 right-6 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3 z-50 animate-slide-in max-w-sm`;
    notification.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center ${
            type === 'success' ? 'bg-green-100 text-green-600' :
            type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
            'bg-purple-100 text-primary'
        }">
            <i class="fas ${
                type === 'success' ? 'fa-check' :
                type === 'warning' ? 'fa-exclamation' :
                'fa-info'
            }"></i>
        </div>
        <div class="flex-1">
            <p class="text-sm font-semibold text-gray-900">${message}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
        </button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Date selector functionality
function initializeDateSelector() {
    const dates = document.querySelectorAll('.date-selector');
    dates.forEach(date => {
        date.addEventListener('click', function() {
            dates.forEach(d => {
                d.classList.remove('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/30');
                d.classList.add('text-gray-400');
            });
            this.classList.remove('text-gray-400');
            this.classList.add('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/30');
            
            showNotification(`Selected ${this.textContent.trim()}`, 'info');
        });
    });
}

// Search functionality
function initializeSearch() {
    const searchBtn = document.getElementById('searchBtn');
    if (!searchBtn) return;
    
    searchBtn.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-overlay';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl p-6 w-full max-w-2xl mx-4 animate-scale-in">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-900">Search</h3>
                    <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <input type="text" placeholder="Search appointments, medications, doctors..." 
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                       autofocus>
                <div class="mt-4 space-y-2">
                    <p class="text-sm text-gray-500">Recent searches</p>
                    <div class="flex flex-wrap gap-2">
                        <span class="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 cursor-pointer hover:bg-primary hover:text-white transition-colors">Dr. Kennedy</span>
                        <span class="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 cursor-pointer hover:bg-primary hover:text-white transition-colors">Blood test</span>
                        <span class="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 cursor-pointer hover:bg-primary hover:text-white transition-colors">Medication</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    });
}

// Appointment actions
function initializeAppointmentActions() {
    const menuBtns = document.querySelectorAll('.appointment-menu');
    menuBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Remove any existing menus
            document.querySelectorAll('.dropdown-menu').forEach(m => m.remove());
            
            const menu = document.createElement('div');
            menu.className = 'absolute right-0 top-8 bg-white rounded-xl shadow-lg p-2 z-10 min-w-[150px] dropdown-menu';
            menu.innerHTML = `
                <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                    <i class="fas fa-calendar-check"></i> Confirm
                </button>
                <button class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                    <i class="fas fa-trash"></i> Cancel
                </button>
            `;
            this.parentElement.style.position = 'relative';
            this.parentElement.appendChild(menu);
            
            // Add click handlers to menu items
            menu.querySelectorAll('button').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = item.textContent.trim();
                    showNotification(`${action} appointment`, 'success');
                    menu.remove();
                });
            });
            
            // Close menu when clicking outside
            setTimeout(() => {
                document.addEventListener('click', function closeMenu() {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                });
            }, 0);
        });
    });
}

// Real-time clock
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
    
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        clockEl.textContent = timeString;
    }
}

// Health tips carousel
const healthTips = [
    "💧 Remember to drink 8 glasses of water today!",
    "🏃‍♀️ Take a 10-minute walk after lunch",
    "😴 Aim for 7-8 hours of quality sleep tonight",
    "🥗 Include more vegetables in your meals",
    "🧘‍♀️ Practice deep breathing for 5 minutes",
    "📱 Take a break from screens every hour",
    "🎵 Listen to calming music to reduce stress",
    "🌞 Get some sunlight for vitamin D",
    "💪 Stretch for 5 minutes every few hours",
    "🍎 Eat a healthy snack between meals"
];

function showHealthTip() {
    const tip = healthTips[Math.floor(Math.random() * healthTips.length)];
    showNotification(tip, 'info');
}

// Vital signs update
function updateVitalSigns() {
    // Simulate real-time vital signs updates
    const vitalElements = document.querySelectorAll('.vital-value');
    vitalElements.forEach(el => {
        const baseValue = parseInt(el.dataset.base) || 120;
        const variance = Math.floor(Math.random() * 6) - 3;
        const newValue = baseValue + variance;
        el.textContent = newValue;
    });
}

// Research progress
function animateResearchProgress() {
    const progressBars = document.querySelectorAll('.research-progress');
    progressBars.forEach(bar => {
        const progress = bar.dataset.progress || '0';
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = progress + '%';
            bar.style.transition = 'width 1s ease-out';
        }, 100);
    });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialized');
    
    // Initialize all features
    animateHeartRate();
    updateMedicationStatus();
    initializeDateSelector();
    initializeSearch();
    initializeAppointmentActions();
    updateClock();
    
    // Set up intervals
    setInterval(updateClock, 1000);
    setInterval(updateVitalSigns, 5000);
    
    // Show welcome notification
    setTimeout(() => {
        showNotification(`Welcome back, ${userData.name}! 👋`, 'success');
    }, 1000);
    
    // Show random health tip every 30 seconds
    setInterval(showHealthTip, 30000);
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchBtn').click();
        }
    });
    
    console.log('All dashboard features loaded successfully');
});

// Export functions for external use
window.DashboardAPI = {
    showNotification,
    updateVitalSigns,
    showHealthTip
};
