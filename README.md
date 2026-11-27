# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/Sid4436/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/Sid4436/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

**Gobble Getaway** is a side-scrolling chase game for desktop browsers. You play Pip the turkey, who has to run 2,200 m from the farmyard, through the old barn and out the kitchen's back door before Farmer Hollis Crumb puts Pip on the table.

- Jump hay bales, fences and pumpkins, and flap once in mid-air.
- Duck under thrown and swinging carving knives.
- Time your way past roaring ovens and a carving knife that chops down from the ceiling.
- When the farmer's lantern glints, hide in a haystack. If he spots you, he speeds up. If he doesn't, he stops to look around and you gain ground.
- Grab corn for points and dash charge, and score close shaves for bonus points.
- You have three feathers (lives). Lose them all, or let the farmer catch up, and you're caught. Get out the back door and you've escaped.

**Controls:** Space / W / Up / left-click to jump (press again in the air to flap) · S / Down / right-click to duck · Shift to dash · E to hide · P to pause · M to mute.

Everything is plain static files in `game/` with no build step, no libraries and no network requests. The art is drawn on a canvas and the sound and music are synthesised with Web Audio.

## Run it

```sh
node serve.ts            # then open http://localhost:8080 in desktop Chrome
MAKEFUN_OUTPUT_DIR=out node main.ts   # writes the hand-in (game/, screenshots/, dossier.json) to out/
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=bzy4wq1r&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
