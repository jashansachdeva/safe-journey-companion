# Safe Journey Companion

Build a polished, functional mobile-first web app called “SafeTravel”, a safety companion for women traveling alone.

IMPORTANT: Keep this as a simple MVP. Do not add unnecessary features, pages, animations, APIs, authentication, payments, or complex backend systems. Focus on making the core demo work.

Core flow

Home → Start Journey → Safety Timer → Check In / Need Help → Emergency Help

Features

Home

SafeTravel logo and clean modern design.

Show status: “You are Safe”.

Large Start Safe Journey button.

Show trusted contacts.

Navigation: Home, Journey, Contacts.

Start Journey Let the user enter:

Starting location

Destination

Expected journey time

When Start Journey is clicked:

Show “Journey Active”.

Show destination.

Start a countdown timer.

Show “I’m Safe” button.

Show red “I Need Help” button.

Use browser GPS if permission is available; otherwise let the demo continue.

Safety Timer

Display remaining time clearly.

“I’m Safe” confirms the user is safe.

If the timer reaches zero, show “Check-In Missed” and a warning.

Give options to contact a trusted person or open Emergency Help.

Emergency Help When “I Need Help” is clicked:

Show a clear red Emergency Mode screen.

Show current location if available.

Show trusted contacts with Call buttons.

Show an Emergency Services button.

Show Cancel Emergency.

Display a realistic emergency alert message.

Do not require real SMS/API integration; make it a functional demo.

Trusted Contacts

Add, edit, and delete contacts.

Store contacts in localStorage.

Include 2 sample contacts so the demo works immediately.

Add clickable phone/call buttons.

Safety Tips Add 5 short solo-travel safety tips.

Design

Make it:

Professional and modern

Mobile-first

Simple and easy to use under stress

White/light background

Dark blue or purple primary color

Green = Safe

Orange = Warning

Red = Emergency

Large accessible buttons

Technical rules

Use localStorage for contacts and journey state.

Use browser geolocation when available.

No real-time background tracking.

No SMS backend.

No authentication.

No payments.

No unnecessary AI features.

No fake buttons: every important button must work.

Make the final app feel like a real competition-ready MVP, not just a UI mockup.

Stop after completing this MVP. Do not add extra features automatically.


add live location feature and text message with live location and make ui more attractive and use less credits as much you can

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f3185676-50bb-409a-927c-4bd69c1591d3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
