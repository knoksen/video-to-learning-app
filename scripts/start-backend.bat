@echo off
setlocal

set BACKEND_PATH=%~dp0..\web-extractor-pro\backend
pushd "%BACKEND_PATH%"
if errorlevel 1 (
  echo Failed to locate backend directory.
  exit /b 1
)

call npm run dev
set EXIT_CODE=%ERRORLEVEL%
popd
exit /b %EXIT_CODE%
