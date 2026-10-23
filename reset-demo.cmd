@echo off
cd /d "%~dp0"
node --disable-warning=DEP0190 reset-demo.mjs
