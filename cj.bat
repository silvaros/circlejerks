@echo off
setlocal enableextensions

set SCRIPT=%0
set DQUOTE="

:: Detect how script was launched
@echo %SCRIPT:~0,1% | findstr /l %DQUOTE% > NUL
if %ERRORLEVEL% EQU 0 set PAUSE_ON_CLOSE=1

cd "C:\Program Files (x86)\Mozilla Firefox" 
start firefox.exe http://localhost:8000/

sleep /t 2

cd "C:\Projects\circleJerks"
node server.js

:EXIT
if defined PAUSE_ON_CLOSE pause