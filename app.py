from flask import Flask, render_template, redirect, url_for, request, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from datetime import datetime
from dotenv import load_dotenv
import os
from models import db, User, Task


load_dotenv()  # загружаем переменные из .env

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'секретный-ключ-по-умолчанию')

# PostgreSQL подключение
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'task_tracker')

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Инициализация
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'  # если не авторизован, отправлять на логин
login_manager.login_message = 'Пожалуйста, войдите, чтобы получить доступ к этой странице'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Создание таблиц БД
with app.app_context():
    db.create_all()
    print("✅ База данных готова!")

@app.route('/')
def index():
    return render_template('index.html')
@app.route('/register', methods=['GET', 'POST'])
def register():
    """Регистрация нового пользователя"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # Валидация
        if not email or not password:
            flash('Заполните все поля', 'danger')
            return render_template('register.html')
        
        if password != confirm_password:
            flash('Пароли не совпадают', 'danger')
            return render_template('register.html')
        
        if len(password) < 6:
            flash('Пароль должен быть минимум 6 символов', 'danger')
            return render_template('register.html')
        
        # Проверяем, существует ли пользователь
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Пользователь с таким email уже существует', 'danger')
            return render_template('register.html')
        
        # Создаём нового пользователя
        new_user = User(email=email)
        new_user.set_password(password)
        
        # Первый пользователь будет админом
        if User.query.count() == 0:
            new_user.role = 'администратор'
        
        db.session.add(new_user)
        db.session.commit()
        
        flash('Регистрация успешна! Теперь войдите в систему.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/tasks')
@login_required  # если нужна авторизация
def tasks():
    return render_template('tasks.html')  
@app.route('/stats')
@login_required
def stats():
    return render_template('stats.html')

@app.route('/calendar')
@login_required
def calendar():
    return render_template('calendar.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Вход в систему"""
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember = True if request.form.get('remember') else False
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            if not user.is_active:
                flash('Ваш аккаунт заблокирован', 'danger')
                return render_template('login.html')
            
            login_user(user, remember=remember)
            flash(f'Добро пожаловать, {user.email}!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Неверный email или пароль', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    """Выход из системы"""
    logout_user()
    flash('Вы вышли из системы', 'info')
    return redirect(url_for('index'))
if __name__ == '__main__':
    app.run(debug=True) 