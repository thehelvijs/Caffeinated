# Caffeinated
No login required. Using local web-server to display alerts and chat. Based on Electron JS. Tested only on Windows. <br /><br />

Basic features:
- New follower alert
- Donation alert
- Chat

## Note: this is open beta. If something does not work or you break something, please let me know here or https://discord.gg/m5Jhbg

<br /><br />
![Usage](https://github.com/thehelvijs/Caffeinated/blob/master/README/usage.gif) 

## Installation
- Grab latest release from https://github.com/thehelvijs/Caffeinated/releases \
- Until I figure out proper Windows install packager - .exe can be found at C:\Users\ %AppData%\Local\caffeinated after installation; or just extract .rar archive and run .exe from there.

## Usage
- Set user in settings
- In OBS add Browser Source (can copy from Caffeinated mainscreen):
  - http://127.0.0.1:8080/followers
  - http://127.0.0.1:8080/donations
  - http://127.0.0.1:8080/chat
- Magic

![Usage2](https://github.com/thehelvijs/Caffeinated/blob/master/README/scrn2.jpg)

## Known issues
- Caffeinated has to be started before opening OBS. Or if OBS has been started, after running Caffeinated - in Browser Source properties "Refresh cache of current page" has to be clicked.
- Unfollow -> follow gives alert. Can be abused by viewers.

## For developers

```elm
git clone https://github.com/thehelvijs/Caffeinated    
npm install    
npm start
```
## Acknowledgments

- [e3ndr](https://github.com/e3ndr/) for inspiration and software examples for chat and donations
