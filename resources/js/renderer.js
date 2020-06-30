//electron-packager . casterlabs_caffeinated --overwrite --asar=true --platform=win32 --arch=ia32 --icon=media/app_icon.png --prune=true --out=release-builds --version-string.CompanyName=Casterlabs --version-string.FileDescription=Casterlabs --version-string.ProductName="Casterlabs Caffeinated"
//electron-packager . --overwrite --platform=darwin --arch=x64 --icon=media/app_icon.png --prune=true --out=release-builds

let closebtn = document.getElementById('closebtn');
const path = require('path')

closebtn.addEventListener('click', (e) => {
  e.preventDefault();
  window.closeCurrentWindow();
});

closebtn.addEventListener('click', (e) => {
  e.preventDefault();
  window.closeCurrentWindow();
});
