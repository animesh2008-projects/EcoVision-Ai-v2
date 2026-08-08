@echo off
title EcoVision AI Local Launcher
echo ========================================================
echo               ECOVISION AI LOCAL LAUNCHER
echo ========================================================
echo.
echo Starting lightweight Python web server on port 8050...
echo (You can close this window later to stop the server)
echo.
echo Opening EcoVision AI in your default web browser...
start "" "http://127.0.0.1:8050"
echo.
python -m http.server 8050 --bind 127.0.0.1
pause
