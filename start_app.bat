@echo off
echo Starting ResQPlate Backend and Frontend...
start "ResQPlate Backend" cmd /k "cd /d %~dp0server && npm run dev"
start "ResQPlate Frontend" cmd /k "cd /d %~dp0 && npm run dev"
echo Servers launched!
