# Casterlabs Caffeinated
<p align="center">
  <img width="500" src="https://github.com/thehelvijs/Caffeinated/blob/master/README/usage.gif">
</p>
  
Caffeinated has been merged with [Casterlabs](https://casterlabs.co).  
No login required.  
Based on Electron JS. Tested only on Windows.  
  
Basic features:
- New follower alert
- Donation alert
- Chat
- Donation goal overlay
- Top Donator, Recent Donator, Recent Follower
- Custom MP3's, GIF's, colors etc.

Bigger features under development:
- Push to Twitter/FB/Discord/others when starting broadcast
- Chatbot with commands (e.g. !DS for Discord channel link etc.)
- (Physical integration e.g. LumiaStream)
- Features, that require Caffeine login (with high security in mind):
  - Broadcast viewers

Give a follow to [Caffeinated](https://www.caffeine.tv/Caffeinated_)

## Note: this is open beta. If something does not work or you break something, please open an issue on GitHub or drop a message on our [Discord](https://discord.gg/FQwqDrr).
## Make sure to readup on our [Privacy Policy](https://casterlabs.co/privacypolicy), by using the service you agree to the terms.

## Installation
- Grab latest release from [here](https://github.com/thehelvijs/Caffeinated/releases/latest).
- MacOS users may not have a proper installer for a while, sorry.

## Usage
- Set user in settings
<p align="center">
  <img width="500" src="https://github.com/thehelvijs/Caffeinated/blob/master/README/setusername.png">
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
```elm
git clone https://github.com/thehelvijs/Caffeinated  
cd app  
npm install  
npm start  
```

## Acknowledgments

- [e3ndr](https://github.com/e3ndr/) for inspiration and software examples for chat and donations
- [e_sturmanis](https://www.caffeine.tv/e_sturmanis) and [notRTBM](https://www.caffeine.tv/notRTBM) broadcasters for testing and feedback
