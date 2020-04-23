# Caffeinated
<p align="center">
  <img height="300" src="https://github.com/thehelvijs/Caffeinated/blob/master/README/usage.gif">
</p>

No login required. Using local web-server to display alerts and chat. Based on Electron JS. Tested only on Windows. <br /><br />

Basic features:
- New follower alert
- Donation alert
- Chat
- Custom MP3's, GIF's, colors etc.

Bigger features under development:
- Donation goal overlay
- Push to Twitter/FB/Discord/others when starting broadcast
- Chatbot with commands (e.g. !DS for Discord channel link etc.)
- Features, that require Caffeine login (with security in mind):
  - Broadcast viewers

Give a follow to [Caffeinated](https://www.caffeine.tv/Caffeinated_)

## Note: this is open beta. If something does not work or you break something, please open issue or drop a message here https://discord.gg/m5Jhbg

## Installation
- Grab latest release from https://github.com/thehelvijs/Caffeinated/releases
- Until I figure out proper Windows install packager - .exe can be found at C:\Users\ %AppData%\Local\caffeinated after installation; or just extract .rar archive and run .exe from there.

## Usage
- Set user in settings
- In OBS add Browser Source (can copy from Caffeinated mainscreen):
  - http://127.0.0.1:8080/followers
  - http://127.0.0.1:8080/donations
  - http://127.0.0.1:8080/chat
- Magic

<p align="center">
  <img height="300" src="https://github.com/thehelvijs/Caffeinated/blob/master/README/scrn2.jpg">
</p>

## Troubleshooting
- If nothing appears on alert test
  - Open web browser (preferably Chrome), copy link there and test again. If nothing happens, go to Caffeinated settings and change local host port (e.g. 3000), restart Caffeinated and change link to that port, test again.

## Known issues
- Caffeinated has to be started before opening OBS. Or if OBS has been started, after running Caffeinated - in Browser Source properties "Refresh cache of current page" has to be clicked.
- ~~Unfollow -> follow gives alert. Can be abused by viewers.~~
- ~~Empty donation message gives default message from donation test -> should be left empty.~~
- If more localhost links are open, audio plays for every window and becomes distorted/loud. Have to limit to 1 window.
- Overlapping alerts - a delay has to be set so all alerts play after previous one has finished.

## For developers

```elm
git clone https://github.com/thehelvijs/Caffeinated    
npm install    
npm start
```
Private API endpoints:
- https://caffeinated-api.herokuapp.com/users/$username$
- https://caffeinated-api.herokuapp.com/followers/$username$ (gives 5 latest followers)
- https://caffeinated-api.herokuapp.com/followers/$username$/$follower_count$ (gives last followers where follower_count is 1-100 (Caffeine caps them at 100))
## Acknowledgments

- [e3ndr](https://github.com/e3ndr/) for inspiration and software examples for chat and donations
- [e_sturmanis](https://www.caffeine.tv/e_sturmanis) and [notRTBM](https://www.caffeine.tv/notRTBM) broadcasters for testing and feedback
