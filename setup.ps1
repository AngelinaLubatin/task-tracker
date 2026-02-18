# Создание папок
New-Item -ItemType Directory -Path templates, static, instance -Force
New-Item -ItemType Directory -Path static\css, static\js -Force

# Создание файлов в корне
$files = @(
    "app.py",
    "models.py",
    "requirements.txt",
    ".env",
    ".gitignore",
    "README.md"
)

foreach ($file in $files) {
    New-Item -ItemType File -Path $file -Force
}

# Создание HTML шаблонов
$templates = @(
    "base.html",
    "index.html",
    "login.html",
    "register.html",
    "tasks.html",
    "task_form.html",
    "stats.html",
    "admin.html"
)

foreach ($template in $templates) {
    New-Item -ItemType File -Path "templates\$template" -Force
}

# Создание статических файлов
New-Item -ItemType File -Path "static\css\style.css" -Force
New-Item -ItemType File -Path "static\js\charts.js" -Force

Write-Host "Готово! Все папки и файлы созданы." -ForegroundColor Green