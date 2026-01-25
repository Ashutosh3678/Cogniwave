// Dashboard JavaScript - Interactive Functionality

// Data
const userData = {
    name: 'Sai Charan',
    location: 'Hyderabad',
    heartRate: 120,
    cholesterolTrend: [150, 140, 130, 145, 155, 142, 138],
    monthlyVisits: {
        week: [
            { label: 'Mon', value: 4 },
            { label: 'Tue', value: 5 },
            { label: 'Wed', value: 3 },
            { label: 'Thu', value: 5 },
            { label: 'Fri', value: 4 },
            { label: 'Sat', value: 3 },
            { label: 'Sun', value: 2 }
        ],
        month: [
            { label: 'Week 1', value: 15 },
            { label: 'Week 2', value: 18 },
            { label: 'Week 3', value: 14 },
            { label: 'Week 4', value: 20 }
        ],
        year: [
            { label: 'Jan', value: 45 },
            { label: 'Feb', value: 52 },
            { label: 'Mar', value: 48 },
            { label: 'Apr', value: 55 },
            { label: 'May', value: 50 },
            { label: 'Jun', value: 58 },
            { label: 'Jul', value: 60 },
            { label: 'Aug', value: 54 },
            { label: 'Sep', value: 62 },
            { label: 'Oct', value: 65 },
            { label: 'Nov', value: 61 },
            { label: 'Dec', value: 68 }
        ]
    },
    currentVisitsPeriod: 'month'
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

// Monthly Visits Chart
function updateVisitsChart(period = 'month') {
    const areaPath = document.getElementById('visitsAreaPath');
    const linePath = document.getElementById('visitsLinePath');
    const dataPointsGroup = document.getElementById('visitsDataPoints');
    
    if (!areaPath || !linePath || !dataPointsGroup) return;
    
    const data = userData.monthlyVisits[period];
    if (!data || data.length === 0) return;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const width = 400;
    const height = 200;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const segmentWidth = chartWidth / (data.length - 1);
    
    // Generate smooth curve points
    let linePathData = '';
    let areaPathData = '';
    const points = [];
    
    data.forEach((item, index) => {
        const x = padding + (index * segmentWidth);
        const y = height - padding - ((item.value / maxValue) * chartHeight);
        points.push({ x, y, label: item.label, value: item.value });
        
        if (index === 0) {
            linePathData = `M${x},${y}`;
            areaPathData = `M${x},${y}`;
        } else {
            // Smooth bezier curve
            const prevPoint = points[index - 1];
            const cpX = (prevPoint.x + x) / 2;
            linePathData += ` Q${cpX},${prevPoint.y} ${x},${y}`;
            areaPathData += ` Q${cpX},${prevPoint.y} ${x},${y}`;
        }
    });
    
    // Complete area path
    areaPathData += ` L${width - padding},${height} L${padding},${height} Z`;
    
    // Update paths with animation
    linePath.style.transition = 'd 0.5s ease';
    areaPath.style.transition = 'd 0.5s ease';
    linePath.setAttribute('d', linePathData);
    areaPath.setAttribute('d', areaPathData);
    
    // Add interactive data points
    dataPointsGroup.innerHTML = '';
    points.forEach((point, index) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', point.y);
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', 'white');
        circle.setAttribute('stroke', '#3B82F6');
        circle.setAttribute('stroke-width', '3');
        circle.style.cursor = 'pointer';
        circle.style.transition = 'r 0.2s ease';
        
        // Tooltip on hover
        circle.addEventListener('mouseenter', (e) => {
            circle.setAttribute('r', '7');
            showVisitsTooltip(point.label, point.value, e);
        });
        
        circle.addEventListener('mouseleave', () => {
            circle.setAttribute('r', '5');
            hideVisitsTooltip();
        });
        
        dataPointsGroup.appendChild(circle);
    });
    
    userData.currentVisitsPeriod = period;
}

function showVisitsTooltip(label, value, event) {
    const tooltip = document.getElementById('visitsTooltip');
    if (!tooltip) return;
    
    tooltip.querySelector('.font-bold').textContent = label;
    tooltip.querySelector('.text-gray-500').textContent = `${value} visits`;
    tooltip.classList.remove('hidden');
    
    const rect = document.getElementById('visitsChart').getBoundingClientRect();
    tooltip.style.left = (event.clientX - rect.left + 10) + 'px';
    tooltip.style.top = (event.clientY - rect.top - 10) + 'px';
}

function hideVisitsTooltip() {
    const tooltip = document.getElementById('visitsTooltip');
    if (tooltip) {
        tooltip.classList.add('hidden');
    }
}

function initializeVisitsPeriodSelector() {
    const selector = document.getElementById('visitsPeriodSelector');
    const periodText = document.getElementById('visitsPeriodText');
    
    if (!selector || !periodText) return;
    
    selector.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Remove existing dropdown
        document.querySelectorAll('.period-dropdown').forEach(d => d.remove());
        
        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'period-dropdown absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg py-2 z-20 min-w-[120px]';
        dropdown.innerHTML = `
            <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" data-period="week">
                <i class="fas fa-calendar-week mr-2 text-primary"></i> By Week
            </button>
            <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" data-period="month">
                <i class="fas fa-calendar-alt mr-2 text-primary"></i> By Month
            </button>
            <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" data-period="year">
                <i class="fas fa-calendar mr-2 text-primary"></i> By Year
            </button>
        `;
        
        selector.style.position = 'relative';
        selector.appendChild(dropdown);
        
        // Handle period selection
        dropdown.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const period = btn.dataset.period;
                const periodLabels = {
                    week: 'by week',
                    month: 'by month',
                    year: 'by year'
                };
                
                periodText.textContent = periodLabels[period];
                updateVisitsChart(period);
                dropdown.remove();
                showNotification(`Viewing ${periodLabels[period]} chats`, 'info');
            });
        });
        
        // Close dropdown on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeDropdown() {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            });
        }, 0);
    });
}

// Profile dropdown functionality
function initializeProfile() {
    const profileBtn = document.getElementById('profileBtn');
    if (!profileBtn) return;
    
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Remove any existing profile dropdown
        const existingDropdown = document.querySelector('.profile-dropdown-panel');
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }
        
        // Create profile dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown-panel fixed right-6 top-20 w-80 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden animate-scale-in';
        dropdown.innerHTML = `
            <div class="bg-gradient-to-br from-primary to-purple-600 p-6 text-white">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-16 h-16 rounded-full bg-white overflow-hidden border-4 border-white/30">
                        <img alt="Sai Charan" class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"/>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold text-lg">Sai Charan</h3>
                        <p class="text-sm text-white/80 flex items-center">
                            <i class="fas fa-map-marker-alt mr-1"></i> Hyderabad
                        </p>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
                        <div class="text-xl font-bold">24</div>
                        <div class="text-xs text-white/70">Reports</div>
                    </div>
                    <div class="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
                        <div class="text-xl font-bold">12</div>
                        <div class="text-xs text-white/70">Appts</div>
                    </div>
                    <div class="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
                        <div class="text-xl font-bold">8</div>
                        <div class="text-xs text-white/70">Meds</div>
                    </div>
                </div>
            </div>
            
            <div class="p-4">
                <button class="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3 text-gray-700">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div class="font-semibold text-sm">My Profile</div>
                        <div class="text-xs text-gray-500">View and edit profile</div>
                    </div>
                </button>
                
                <button class="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3 text-gray-700">
                    <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <i class="fas fa-file-medical"></i>
                    </div>
                    <div>
                        <div class="font-semibold text-sm">Medical History</div>
                        <div class="text-xs text-gray-500">View all records</div>
                    </div>
                </button>
                
                <button class="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3 text-gray-700">
                    <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <i class="fas fa-cog"></i>
                    </div>
                    <div>
                        <div class="font-semibold text-sm">Settings</div>
                        <div class="text-xs text-gray-500">Preferences & privacy</div>
                    </div>
                </button>
                
                <button class="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3 text-gray-700">
                    <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                        <i class="fas fa-question-circle"></i>
                    </div>
                    <div>
                        <div class="font-semibold text-sm">Help & Support</div>
                        <div class="text-xs text-gray-500">Get assistance</div>
                    </div>
                </button>
                
                <div class="border-t border-gray-100 mt-2 pt-2">
                    <button onclick="window.DashboardAPI.handleLogout()" class="w-full text-left px-4 py-3 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3 text-red-600">
                        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <i class="fas fa-sign-out-alt"></i>
                        </div>
                        <div>
                            <div class="font-semibold text-sm">Logout</div>
                            <div class="text-xs text-red-400">Sign out of account</div>
                        </div>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dropdown);
        
        // Add click handlers to menu items
        dropdown.querySelectorAll('button').forEach((btn, index) => {
            if (index < 4) { // Exclude logout button
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const title = btn.querySelector('.font-semibold').textContent;
                    showNotification(`Opening ${title}...`, 'info');
                    dropdown.remove();
                });
            }
        });
        
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeProfile() {
                dropdown.remove();
                document.removeEventListener('click', closeProfile);
            });
        }, 0);
    });
}

function handleLogout() {
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
        showNotification('Logging out...', 'info');
        setTimeout(() => {
            // In production, clear session and redirect to login
            window.location.href = '../index.html';
        }, 1000);
    }
}

// Animate quick stats
function updateQuickStats() {
    const heartRate = document.getElementById('quickHeartRate');
    const temp = document.getElementById('quickTemp');
    
    if (heartRate) {
        const baseRate = 72;
        const variance = Math.floor(Math.random() * 6) - 3;
        heartRate.textContent = baseRate + variance;
    }
    
    if (temp) {
        const baseTemp = 98.6;
        const variance = (Math.random() * 0.4 - 0.2).toFixed(1);
        temp.textContent = (parseFloat(baseTemp) + parseFloat(variance)).toFixed(1);
    }
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

// ===== NOTIFICATION SYSTEM =====
const notificationData = {
    notifications: [
        {
            id: 1,
            type: 'appointment',
            icon: 'fa-calendar-check',
            title: 'Upcoming Appointment',
            message: 'Your appointment with Dr. Kennedy is in 1 hour',
            time: '5 min ago',
            read: false,
            timestamp: Date.now() - 300000
        },
        {
            id: 2,
            type: 'medication',
            icon: 'fa-pills',
            title: 'Medication Reminder',
            message: 'Time to take your Verapamil (460mg)',
            time: '30 min ago',
            read: false,
            timestamp: Date.now() - 1800000
        },
        {
            id: 3,
            type: 'lab',
            icon: 'fa-flask',
            title: 'Lab Results Available',
            message: 'Your blood test results are ready to view',
            time: '2 hours ago',
            read: false,
            timestamp: Date.now() - 7200000
        },
        {
            id: 4,
            type: 'alert',
            icon: 'fa-heart-pulse',
            title: 'Vital Sign Alert',
            message: 'Your heart rate was elevated this morning',
            time: '4 hours ago',
            read: true,
            timestamp: Date.now() - 14400000
        },
        {
            id: 5,
            type: 'system',
            icon: 'fa-check-circle',
            title: 'Report Generated',
            message: 'Your monthly health report is ready',
            time: '1 day ago',
            read: true,
            timestamp: Date.now() - 86400000
        }
    ]
};

function getNotificationColor(type) {
    const colors = {
        appointment: 'bg-blue-100 text-blue-600',
        medication: 'bg-purple-100 text-purple-600',
        lab: 'bg-green-100 text-green-600',
        alert: 'bg-red-100 text-red-600',
        system: 'bg-gray-100 text-gray-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    const unreadCount = notificationData.notifications.filter(n => !n.read).length;
    
    if (badge) {
        if (unreadCount > 0) {
            badge.style.display = 'block';
            badge.setAttribute('data-count', unreadCount);
        } else {
            badge.style.display = 'none';
        }
    }
}

function markNotificationAsRead(notificationId) {
    const notification = notificationData.notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        updateNotificationBadge();
    }
}

function markAllAsRead() {
    notificationData.notifications.forEach(n => n.read = true);
    updateNotificationBadge();
    
    // Update UI
    document.querySelectorAll('.notification-item').forEach(item => {
        item.classList.remove('bg-blue-50');
        item.classList.add('bg-white');
        const unreadDot = item.querySelector('.unread-dot');
        if (unreadDot) unreadDot.remove();
    });
    
    showNotification('All notifications marked as read', 'success');
}

function deleteNotification(notificationId) {
    const index = notificationData.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
        notificationData.notifications.splice(index, 1);
        updateNotificationBadge();
        
        // Remove from UI
        const notifElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notifElement) {
            notifElement.style.opacity = '0';
            notifElement.style.transform = 'translateX(20px)';
            setTimeout(() => notifElement.remove(), 300);
        }
        
        showNotification('Notification deleted', 'success');
    }
}

function initializeNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    if (!notificationBtn) return;
    
    updateNotificationBadge();
    
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Remove any existing panel
        const existingPanel = document.querySelector('.notification-panel');
        if (existingPanel) {
            existingPanel.remove();
            return;
        }
        
        // Create notification panel
        const panel = document.createElement('div');
        panel.className = 'notification-panel fixed right-6 top-20 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden animate-scale-in';
        
        const unreadCount = notificationData.notifications.filter(n => !n.read).length;
        const sortedNotifications = [...notificationData.notifications].sort((a, b) => b.timestamp - a.timestamp);
        
        panel.innerHTML = `
            <div class="p-6 border-b border-gray-100">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-xl font-bold text-gray-900">Notifications</h3>
                    <button onclick="this.closest('.notification-panel').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>
                <div class="flex justify-between items-center">
                    <p class="text-sm text-gray-500">${unreadCount} unread</p>
                    ${unreadCount > 0 ? '<button onclick="window.DashboardAPI.markAllAsRead()" class="text-xs text-primary font-semibold hover:underline">Mark all as read</button>' : ''}
                </div>
            </div>
            
            <div class="max-h-[500px] overflow-y-auto notification-list">
                ${sortedNotifications.length === 0 ? `
                    <div class="p-8 text-center">
                        <i class="fas fa-bell-slash text-gray-300 text-4xl mb-3"></i>
                        <p class="text-gray-500 text-sm">No notifications</p>
                    </div>
                ` : sortedNotifications.map(notif => `
                    <div class="notification-item ${notif.read ? 'bg-white' : 'bg-blue-50'} p-4 border-b border-gray-100 hover:bg-gray-50 transition-all cursor-pointer relative" 
                         data-notification-id="${notif.id}"
                         onclick="window.DashboardAPI.markNotificationAsRead(${notif.id})">
                        ${!notif.read ? '<div class="unread-dot absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>' : ''}
                        <div class="flex gap-3 ${!notif.read ? 'ml-4' : ''}">
                            <div class="w-10 h-10 rounded-full ${getNotificationColor(notif.type)} flex items-center justify-center flex-shrink-0">
                                <i class="fas ${notif.icon}"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-start mb-1">
                                    <h4 class="font-bold text-sm text-gray-900 truncate">${notif.title}</h4>
                                    <button onclick="event.stopPropagation(); window.DashboardAPI.deleteNotification(${notif.id})" 
                                            class="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0">
                                        <i class="fas fa-trash text-xs"></i>
                                    </button>
                                </div>
                                <p class="text-xs text-gray-600 mb-1 line-clamp-2">${notif.message}</p>
                                <span class="text-[10px] text-gray-400">${notif.time}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="p-4 border-t border-gray-100 bg-gray-50">
                <a href="#" class="block text-center text-sm text-primary font-semibold hover:underline">
                    View All Notifications
                </a>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Close panel when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closePanel(e) {
                if (!panel.contains(e.target) && !notificationBtn.contains(e.target)) {
                    panel.remove();
                    document.removeEventListener('click', closePanel);
                }
            });
        }, 0);
    });
}

// Add new notification function
function addNotification(type, title, message) {
    const newNotif = {
        id: Date.now(),
        type: type,
        icon: {
            appointment: 'fa-calendar-check',
            medication: 'fa-pills',
            lab: 'fa-flask',
            alert: 'fa-heart-pulse',
            system: 'fa-check-circle'
        }[type] || 'fa-info-circle',
        title: title,
        message: message,
        time: 'Just now',
        read: false,
        timestamp: Date.now()
    };
    
    notificationData.notifications.unshift(newNotif);
    updateNotificationBadge();
    showNotification(message, type === 'alert' ? 'warning' : 'info');
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialized');
    
    // Initialize all features
    animateHeartRate();
    updateMedicationStatus();
    initializeDateSelector();
    initializeSearch();
    initializeNotifications();
    initializeProfile();
    initializeAppointmentActions();
    updateClock();
    updateVisitsChart('month');
    initializeVisitsPeriodSelector();
    updateQuickStats();
    
    // Set up intervals
    setInterval(updateClock, 1000);
    setInterval(updateVitalSigns, 5000);
    setInterval(updateQuickStats, 3000);
    
    // Load appointments for schedule widget
    loadDashboardAppointments();
    
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

// ===== Dashboard Schedule Widget =====
function loadDashboardAppointments() {
    // Get chat history conversations
    let conversations = [
        { id: 1, name: "CogniWave AI", type: "AI Assistant", topic: "Health Assessment", time: "09:15 AM", date: "2026-01-24", icon: "robot", color: "purple" },
        { id: 2, name: "Dr. Arun Kumar", type: "Cardiologist", topic: "Heart Rate Analysis", time: "11:45 AM", date: "2026-01-24", icon: "user-md", color: "blue" },
        { id: 3, name: "CogniWave AI", type: "AI Assistant", topic: "Medication Reminder", time: "02:30 PM", date: "2026-01-24", icon: "robot", color: "purple" }
    ];

    // Generate date strip for current week
    generateDateStrip();
    
    // Display conversations
    displayDashboardAppointments(conversations);
}

function generateDateStrip() {
    const dateStrip = document.getElementById('dateStrip');
    if (!dateStrip) return;
    
    const today = new Date(2026, 0, 24); // January 24, 2026
    const days = [];
    
    // Generate 5 days starting from today
    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push(date);
    }
    
    dateStrip.innerHTML = days.map((date, index) => {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = date.getDate();
        const isToday = index === 0;
        
        return `
            <div class="flex flex-col items-center ${isToday ? 'bg-primary text-white py-2 px-3 shadow-lg shadow-primary/30 rounded-2xl' : 'py-2 px-3 text-gray-400'} date-selector cursor-pointer transition-all hover:bg-gray-100 ${isToday ? 'hover:bg-primary' : ''}">
                <span class="text-xs font-medium ${isToday ? 'opacity-80' : ''}">${dayName}</span>
                <span class="text-sm font-bold">${dayNum}</span>
            </div>
        `;
    }).join('');
}

function displayDashboardAppointments(appointments) {
    const container = document.getElementById('dashboardAppointments');
    if (!container) return;
    
    // Sort by time
    const sortedAppts = [...appointments].sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA - dateB;
    });
    
    // Show only today's conversations, max 3
    const today = '2026-01-24';
    const todayAppts = sortedAppts.filter(appt => appt.date === today).slice(0, 3);
    
    if (todayAppts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-comments text-gray-300 text-4xl mb-3"></i>
                <p class="text-gray-500 text-sm">No conversations today</p>
                <a href="chatbot.html" class="text-primary text-xs font-semibold hover:underline mt-2 inline-block">Start a chat</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = todayAppts.map((chat) => {
        const isAI = chat.type === "AI Assistant";
        const iconColor = isAI ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600';
        const statusColor = isAI ? 'bg-purple-200 text-purple-800' : 'bg-blue-200 text-blue-800';
        const chatDate = new Date(chat.date);
        const dateStr = chatDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        
        return `
            <div class="bg-gray-50 p-3 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer" onclick="window.location.href='${isAI ? 'chatbot' : 'history'}.html'">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex gap-3">
                        <div class="w-10 h-10 rounded-full ${iconColor} flex items-center justify-center">
                            <i class="fas fa-${chat.icon}"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-sm text-gray-900">${chat.name}</h4>
                            <p class="text-xs text-gray-500">${chat.topic}</p>
                        </div>
                    </div>
                    <button class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-chevron-right text-xs"></i>
                    </button>
                </div>
                <div class="flex justify-between items-center mt-3">
                    <span class="text-[10px] text-gray-400 font-medium">${dateStr}, ${chat.time}</span>
                    <span class="${statusColor} text-[10px] font-bold px-2 py-1 rounded-md">${chat.type}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Export functions for external use
window.DashboardAPI = {
    showNotification,
    updateVitalSigns,
    showHealthTip,
    loadDashboardAppointments,
    addNotification,
    markNotificationAsRead,
    markAllAsRead,
    deleteNotification,
    updateNotificationBadge,
    handleLogout,
    updateQuickStats
};
