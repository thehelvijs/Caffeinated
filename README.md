# Casterlabs Caffeinated
<p align="center">
  <img width="500" src="https://github.com/thehelvijs/Caffeinated/blob/master/README/usage.gif">
</p>
  
No login _required_.  
  
Basic features:
- New follower alert
- Donation alert
- Chat
- Donation goal overlay
- Top Donator, Recent Donator, Recent Follower
- Custom MP3's, GIF's, colors etc.

Bigger features under development:
- Chatbot with commands (e.g. !DS for Discord channel link etc.)
- (Physical integration e.g. LumiaStream)

## Note: We are constantly developing. If something does not work or you break something, please open an issue on GitHub or drop a message on our [Discord](https://discord.gg/FQwqDrr).
## Make sure to readup on our [Privacy Policy](https://casterlabs.co/privacypolicy), by using the service you agree to the terms.

## Installation
- Grab latest release from [here](https://github.com/thehelvijs/Caffeinated/releases/latest).

## Usage
- Set user in settings
<p align="center">
  <img width="500" src="https://github.com/thehelvijs/Caffeinated/blob/master/README/setusername.gif">
</p>
- In OBS add Browser Source (can copy from Caffeinated mainscreen)
<p align="center">
  <img width="500" src="https://github.com/thehelvijs/Caffeinated/blob/master/README/browsersource.png">
</p>
- Magic

## Troubleshooting
- If nothing appears on alert test
  - Open web browser (preferably Chrome), copy link there and test again. If nothing happens, go to Caffeinated settings and change local host port (e.g. 3000), restart Caffeinated and change link to that port, test again.

## Known issues
- If more localhost links are open, audio plays for every window and becomes distorted/loud. Have to limit to 1 window.
- Overlapping alerts - a delay has to be set so all alerts play after previous one has finished.

## For developers
- Make sure you have electron-builder to compile the app
- To install electron-builder you have to run the command ```npm  install electron-builder -g```
```elm
git clone https://github.com/thehelvijs/Caffeinated  
cd app  
npm install  
electron-builder -wl
```
- MacOS builds do still need to be made the same way on macos but with ```-m``` instead of ```-wl```

## Acknowledgments

- [e_sturmanis](https://www.caffeine.tv/e_sturmanis) and [notRTBM](https://www.caffeine.tv/notRTBM) broadcasters for initial testing and feedback
- People like you who use the app and support us every step of the way, Casterlabs would not be possible without you ♥
