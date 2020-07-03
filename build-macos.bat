@echo off

net session >nul 2>&1
if %errorLevel% == 0 (
	goto macos_build
) else (
	echo Current permissions inadequate to build for MacOS, skipping.
	exit
)

:macos_build
	goto check_permissions
	echo Building MacOS.
	start electron-packager app --overwrite --platform=darwin --arch=x64 --icon=app/media/app_icon.png --prune=true --out=release-builds
