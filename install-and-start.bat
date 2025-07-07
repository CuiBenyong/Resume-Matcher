@echo off
setlocal enabledelayedexpansion

REM Resume Matcher - 快速安装与启动脚本 (Windows)
REM 该脚本会自动安装依赖并启动前后端服务

title Resume Matcher - 安装与启动

echo [Resume Matcher] 快速安装与启动脚本
echo =====================================

REM 检查是否在项目根目录
if not exist "package.json" (
    echo [错误] 未找到 package.json，请在 Resume Matcher 项目根目录下运行此脚本
    pause
    exit /b 1
)

if not exist "apps" (
    echo [错误] 未找到 apps 目录，请在 Resume Matcher 项目根目录下运行此脚本
    pause
    exit /b 1
)

REM 检查 Node.js
echo [信息] 检查系统要求...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Node.js 未安装。请访问 https://nodejs.org/ 安装 Node.js
    pause
    exit /b 1
)

REM 检查 npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [错误] npm 未安装。请安装 Node.js ^(包含 npm^)
    pause
    exit /b 1
)

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        echo [错误] Python 未安装。请访问 https://python.org/ 安装 Python
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=python3
    )
) else (
    set PYTHON_CMD=python
)

echo [成功] 系统要求检查通过

REM 安装前端依赖
echo [信息] 安装前端依赖...
cd apps\frontend
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo [错误] 前端依赖安装失败
        cd ..\..
        pause
        exit /b 1
    )
    echo [成功] 前端依赖安装完成
) else (
    echo [信息] 前端依赖已存在，跳过安装
)
cd ..\..

REM 安装后端依赖
echo [信息] 安装后端依赖...
cd apps\backend

REM 检查是否存在虚拟环境
if not exist ".venv" (
    echo [信息] 创建 Python 虚拟环境...
    %PYTHON_CMD% -m venv .venv
    if errorlevel 1 (
        echo [错误] 虚拟环境创建失败
        cd ..\..
        pause
        exit /b 1
    )
)

REM 激活虚拟环境
echo [信息] 激活虚拟环境并安装依赖...
call .venv\Scripts\activate.bat

REM 安装依赖
if exist "requirements.txt" (
    echo [信息] 使用 pip 安装依赖...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [警告] 后端依赖安装可能有问题，但继续执行...
    )
) else (
    echo [警告] 未找到 requirements.txt，跳过后端依赖安装
)

echo [成功] 后端依赖安装完成
cd ..\..

REM 创建临时目录
if not exist ".tmp" mkdir .tmp

REM 启动服务
echo [信息] 启动开发服务器...

REM 启动后端
echo [信息] 启动后端服务器...
cd apps\backend
call .venv\Scripts\activate.bat

if exist "app\main.py" (
    start /b "" %PYTHON_CMD% app\main.py
    echo [成功] 后端服务器已启动
) else (
    echo [警告] 未找到后端启动文件，跳过后端启动
)

cd ..\..

REM 等待一下
timeout /t 2 /nobreak >nul

REM 启动前端
echo [信息] 启动前端服务器...
cd apps\frontend
start /b "" npm run dev
echo [成功] 前端服务器已启动
cd ..\..

REM 显示服务信息
echo.
echo [成功] 所有服务已启动！
echo [信息] 前端: http://localhost:3000
echo [信息] 后端: http://localhost:8000 ^(如果已配置^)
echo.
echo [信息] 按任意键停止所有服务...

REM 创建停止脚本
echo @echo off > stop-services.bat
echo echo [信息] 正在停止服务... >> stop-services.bat
echo taskkill /f /im node.exe 2^>nul >> stop-services.bat
echo taskkill /f /im python.exe 2^>nul >> stop-services.bat
echo taskkill /f /im python3.exe 2^>nul >> stop-services.bat
echo if exist .tmp rmdir .tmp >> stop-services.bat
echo echo [成功] 所有服务已停止 >> stop-services.bat

REM 等待用户输入
pause >nul

REM 清理
echo [信息] 正在停止服务...
taskkill /f /im node.exe 2>nul
taskkill /f /im python.exe 2>nul
taskkill /f /im python3.exe 2>nul
if exist ".tmp" rmdir ".tmp"
echo [成功] 所有服务已停止

pause
