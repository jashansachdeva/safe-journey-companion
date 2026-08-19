# 🛡️ SafeTravel

### Travel alone. Stay connected. Get help when it matters.

SafeTravel is a mobile-first safety companion designed for women traveling alone. It helps users stay connected with trusted contacts, monitor their journey, share their location, and quickly access emergency help when needed.

## 🚨 Problem

Traveling alone can sometimes become unsafe or stressful. In an emergency, users may not have enough time to open multiple apps, explain their situation, or share their location manually.

SafeTravel brings essential safety tools into one simple interface.

## 💡 Solution

SafeTravel provides a simple safety flow:

**Start Journey → Monitor Journey → Check In → Get Help**

The app focuses on making important safety actions quick and accessible, especially under stressful situations.

## ✨ Features

- 🟢 **Safety Status** — Clearly shows whether the user is safe.
- 🧭 **Journey Tracking** — Start a journey with a destination and expected duration.
- ⏱️ **Safety Timer** — Countdown during an active journey.
- 📍 **Live Location** — Uses browser geolocation when permission is available.
- 📤 **Location Sharing** — Share the latest location through available device sharing options.
- ✅ **Safety Check-In** — Confirm "I'm Safe" during the journey.
- ⚠️ **Missed Check-In** — Warns the user when the safety timer expires.
- 🚨 **Emergency Mode** — Provides quick access to emergency actions.
- 👥 **Trusted Contacts** — Add, edit, delete, and call trusted contacts.
- 📞 **Emergency Calling** — Quick calling through the device.
- 💬 **Emergency Message** — Prepare a safety message containing the latest location.
- 🛡️ **Safety Tips** — Practical tips for solo travelers.
- 💾 **Local Storage** — Journey and trusted-contact data is stored locally.

## 🔄 Core Flow

```text
Home
  ↓
Start Safe Journey
  ↓
Enter Destination & Time
  ↓
Journey Active
  ↓
Safety Timer + Location
  ↓
┌───────────────┐
│               │
I'm Safe    I Need Help
│               │
↓               ↓
Safe Status   Emergency Mode
                ↓
        Share Location / Call

npm run dev
```
