// Ждём, пока страница полностью загрузится
document.addEventListener('DOMContentLoaded', () => {
    
    // Получаем имя текущей страницы
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log('Текущая страница:', currentPage);

    // ===== ЛЕНДИНГ (главная) =====
    if (currentPage === 'index.html' || currentPage === '') {
        const cards = document.querySelectorAll('.feature-card');
        if (cards.length) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });
            cards.forEach(card => observer.observe(card));
            console.log('Анимация карточек включена');
        }
    }

    // ===== ВХОД / РЕГИСТРАЦИЯ =====
    if (currentPage === 'login.html' || currentPage === 'register.html') {
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (typeof clearErrors === 'function') clearErrors(form);
                
                const email = form.querySelector('#email');
                const password = form.querySelector('#password');
                let isValid = true;

                if (email && (!email.value.includes('@') || !email.value.includes('.'))) {
                    if (typeof showError === 'function') showError(email, 'Введите корректный email');
                    isValid = false;
                }

                if (password && password.value.length < 8) {
                    if (typeof showError === 'function') showError(password, 'Пароль должен быть минимум 8 символов');
                    isValid = false;
                }

                if (currentPage === 'register.html') {
                    const confirmPassword = form.querySelector('#confirm-password');
                    if (confirmPassword && password.value !== confirmPassword.value) {
                        if (typeof showError === 'function') showError(confirmPassword, 'Пароли не совпадают');
                        isValid = false;
                    }
                }

                if (isValid) {
                    console.log('✅ Форма заполнена верно');
                    alert('✅ Всё правильно! (Пока демо)');
                }
            });
        });
    }

    // ===== ЧЕКБОКСЫ (универсальные для дашборда и задач) =====
    const allCheckboxes = document.querySelectorAll('.task-checkbox');
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            this.classList.toggle('checked');
            
            // Пробуем найти .task-card (для страницы задач), иначе .task-item (для дашборда)
            const taskCard = this.closest('.task-card');
            const taskItem = this.closest('.task-item');
            const taskElement = taskCard || taskItem;
            
            if (taskElement) {
                taskElement.classList.toggle('completed');
            }
        });
    });

    // ===== ВЫПАДАЮЩЕЕ МЕНЮ (только если элементы есть) =====
    const profileBtn = document.querySelector('.user-profile');
    const dropdown = document.getElementById('userDropdown');
    const overlay = document.getElementById('menuOverlay');

    if (profileBtn && dropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            if (overlay) overlay.classList.toggle('active');
        });

        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
                if (overlay) overlay.classList.remove('active');
            }
        });
    }

    // ===== КНОПКА "ВЫЙТИ" =====
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            localStorage.clear();
            if (dropdown) dropdown.classList.remove('show');
            if (overlay) overlay.classList.remove('active');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 300);
        });
    }

    // ===== СТРАНИЦА ЗАДАЧ (только если мы на tasks.html) =====
    if (currentPage === 'tasks.html') {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const taskSearch = document.getElementById('taskSearch');

        // Фильтры
        if (filterBtns.length) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    filterTasks(this.dataset.filter);
                });
            });
        }

        function filterTasks(filter) {
            // Ищем .task-card вместо .task-item
            const tasks = document.querySelectorAll('.task-list .task-card');
            tasks.forEach(task => {
                const checkbox = task.querySelector('.task-checkbox');
                const isChecked = checkbox?.classList.contains('checked');
                
                switch(filter) {
                    case 'active':
                        task.style.display = isChecked ? 'none' : 'flex';
                        break;
                    case 'completed':
                        task.style.display = isChecked ? 'flex' : 'none';
                        break;
                    case 'urgent':
                        task.style.display = 'flex';
                        break;
                    default:
                        task.style.display = 'flex';
                }
            });
        }

        // Поиск
        if (taskSearch) {
            taskSearch.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                // Ищем .task-card вместо .task-item
                const tasks = document.querySelectorAll('.task-list .task-card');
                
                tasks.forEach(task => {
                    const taskName = task.querySelector('.task-name')?.textContent.toLowerCase();
                    task.style.display = taskName?.includes(searchTerm) ? 'flex' : 'none';
                });
            });
        }
    }

    // ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
    window.showAddTaskModal = function() {
        alert('Здесь будет форма добавления задачи');
    };

    window.toggleTasksView = function(hasTasks) {
        const tasksListAndPagination = document.getElementById('tasksListAndPagination');
        const tasksEmpty = document.getElementById('tasksEmpty');
        
        if (hasTasks) {
            if (tasksListAndPagination) tasksListAndPagination.style.display = 'block';
            if (tasksEmpty) tasksEmpty.style.display = 'none';
        } else {
            if (tasksListAndPagination) tasksListAndPagination.style.display = 'none';
            if (tasksEmpty) tasksEmpty.style.display = 'block';
        }
    };
});