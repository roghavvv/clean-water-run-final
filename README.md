# Clean Water Run — Project 6 Final Game

A student-made browser game inspired by charity: water's mission. Catch clean water with the yellow jerry can, avoid polluted drops, and reach your score goal before time runs out.

## How to play

1. Open `index.html` in a browser, or use the published GitHub Pages URL.
2. Select Easy, Normal, or Hard, then press Start Game.
3. Move with left/right arrow keys, mouse, or touch drag.
4. Blue drops give +10 points; brown drops cost 10 points and one life.
5. Reach the target before time runs out. Use Reset or Play Again to retry.

## Project 6 features

- Meaningful difficulty modes: Easy (45 seconds, 150 points, 4 lives, slower drops), Normal (30 seconds, 200 points, 3 lives), Hard (25 seconds, 250 points, 2 lives, faster drops and more pollution).
- Dynamic DOM: water drops are created as elements, move, and are removed when collected or missed; floating score feedback is added and removed.
- charity: water information section and links to its main website and donation page.
- Consistent bold Montserrat typography (a brand-inspired approximation, not a claim of official font use).
- Sound effects for catching clean water, pollution, winning, losing, and button actions. Generated via the Web Audio API; no external audio files needed. Sound On/Off toggle. Browser sound may start only after user interaction.
- Milestone messages at 25%, 50%, 75%, and 100% of each difficulty's score target, implemented with an array and conditionals.
- Confetti animation for a win, responsive layout, keyboard/mouse/touch controls, Reset, and Play Again.

## Publish on GitHub Pages

**Do not edit or overwrite the original Project 5 repository.** Create a new public repository named `clean-water-run-final`. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository root. Under Settings → Pages, choose Deploy from a branch, `main`, `/(root)`, then Save. Wait for the published URL and test it in an incognito/private window.

Expected URL after publishing: `https://roghavvv.github.io/clean-water-run-final/` (not live until you publish).

## Testing checklist

- Easy, Normal, Hard update timer/goal/lives and falling speed.
- Blue drops increase score; brown drops decrease score and lives.
- Drops disappear on collision; score feedback appears.
- Reset and Play Again restart the chosen mode.
- Milestones appear as the score increases.
- Sounds work after Start is clicked; mute button works.
- Win triggers confetti and message; timeout/lives trigger loss.
- Phone layout fits and touch drag moves the can.
- Both charity: water links open correctly.

This is an independent student project, not an official charity: water game.
