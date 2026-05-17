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

    // ===== ЧЕКБОКСЫ =====
    const allCheckboxes = document.querySelectorAll('.task-checkbox');
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            this.classList.toggle('checked');
            const taskCard = this.closest('.task-card');
            if (taskCard) {
                taskCard.classList.toggle('completed');
                // После переключения — сразу применяем фильтры, если они активны
                if (document.querySelector('.filter-btn.active')?.dataset.filter !== 'all') {
                    applyFiltersAndSearch();
                }
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
    const taskCards = document.querySelectorAll('.task-card');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const taskSearch = document.getElementById('taskSearch');

    if (taskCards.length > 0) {  // Если есть карточки задач — запускаем логику
        
        // --- ФИЛЬТРЫ ---
        if (filterBtns.length) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    applyFiltersAndSearch();  // Единая функция для фильтра + поиска
                });
            });
        }

        // --- ПОИСК ---
        if (taskSearch) {
            taskSearch.addEventListener('input', applyFiltersAndSearch);
        }

        // --- ЕДИНАЯ ФУНКЦИЯ: фильтр + поиск вместе ---
        function applyFiltersAndSearch() {
            const activeBtn = document.querySelector('.filter-btn.active');
            const filterType = activeBtn ? activeBtn.dataset.filter : 'all';
            const searchTerm = taskSearch ? taskSearch.value.toLowerCase().trim() : '';
            
            taskCards.forEach(card => {
                // Читаем статус из CSS-класса (как у вас в HTML)
                const isCompleted = card.classList.contains('completed');
                const taskName = card.querySelector('.task-name')?.textContent.toLowerCase() || '';
                
                // Проверка фильтра
                let matchesFilter = true;
                if (filterType === 'active') matchesFilter = !isCompleted;
                else if (filterType === 'completed') matchesFilter = isCompleted;
                else if (filterType === 'urgent') {
                    // Срочные: красная точка + не выполнено
                    const dateDot = card.querySelector('.date-dot');
                    const isUrgent = dateDot && 
                        (dateDot.style.background.includes('var(--danger)') || 
                        dateDot.style.background.includes('#ef4444') ||
                        dateDot.style.backgroundColor === 'var(--danger)');
                    matchesFilter = isUrgent && !isCompleted;
                }
                
                // Проверка поиска
                const matchesSearch = searchTerm === '' || taskName.includes(searchTerm);
                
                // Показываем/скрываем
                card.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
            });
            
            // Показываем "пусто", если ничего не найдено
            const visible = document.querySelectorAll('.task-card[style!="display: none"]').length;
            const emptyState = document.getElementById('tasksEmpty');
            const listContainer = document.getElementById('tasksListAndPagination');
            if (emptyState && listContainer) {
                const allHidden = Array.from(taskCards).every(c => c.style.display === 'none');
                emptyState.style.display = allHidden ? 'block' : 'none';
                listContainer.style.display = allHidden ? 'none' : 'block';
            }
        }

        // Запуск при загрузке
        applyFiltersAndSearch();
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