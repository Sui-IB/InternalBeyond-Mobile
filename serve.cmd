@echo off
title Mizu-iro - local server
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 goto :serve
where py >nul 2>nul
if %errorlevel%==0 goto :serve_py

echo Python not found. Opening index.html directly...
echo If the API blocks CORS, serve this folder with any static server instead.
start "" "index.html"
exit /b

:serve_py
echo Serving at http://127.0.0.1:8756/  (minimized window = server, close it to stop)
start "mizu-iro server" /min cmd /c "py -m http.server 8756"
timeout /t 2 >nul
start "" "http://127.0.0.1:8756/index.html"
exit /b

:serve
echo Serving at http://127.0.0.1:8756/  (minimized window = server, close it to stop)
start "mizu-iro server" /min cmd /c "python -m http.server 8756"
timeout /t 2 >nul
start "" "http://127.0.0.1:8756/index.html"
exit /b
