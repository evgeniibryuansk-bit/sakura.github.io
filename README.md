# Sakura

Firestore rules for profiles and profile comments live in `firestore.rules`.

To publish them to Firebase project `sakura-bfa74`:

```bash
firebase deploy --only firestore:rules
```

If `firebase` is not installed yet:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```
