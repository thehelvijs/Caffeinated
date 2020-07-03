@echo off

echo Building Windows.
electron-packager app casterlabs_caffeinated --overwrite --asar --platform=win32 --arch=ia32 --icon=app/media/app_icon.ico --prune=true --out=release-builds --version-string.CompanyName=Casterlabs --version-string.FileDescription=Casterlabs --version-string.ProductName="Casterlabs Caffeinated"
