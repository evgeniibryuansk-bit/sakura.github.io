"use client";

import { useEffect } from "react";

type FirebaseBootWindow = Window & {
  sakuraStartFirebaseAuth?: () => Promise<unknown> | unknown;
  sakuraFirebaseRuntimeInjected?: boolean;
  sakuraFirebaseRuntimePromise?: Promise<void> | null;
};

const getWindowState = () => window as FirebaseBootWindow;

const waitForRuntimeStart = (bootFn: () => Promise<void>) =>
  new Promise<void>((resolve) => {
    let attempts = 0;

    const tick = () => {
      const runtimeStart = getWindowState().sakuraStartFirebaseAuth;

      if (runtimeStart && runtimeStart !== bootFn) {
        resolve();
        return;
      }

      attempts += 1;

      if (attempts >= 20) {
        resolve();
        return;
      }

      window.setTimeout(tick, 25);
    };

    tick();
  });

export default function FirebaseAuthBoot() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const runtime = getWindowState();

    const loadRuntime = async (startFirebase = false) => {
      if (!runtime.sakuraFirebaseRuntimeInjected && !runtime.sakuraFirebaseRuntimePromise) {
        runtime.sakuraFirebaseRuntimePromise = import("./firebase-auth-script")
          .then(async ({ default: firebaseModuleScript }) => {
            if (!runtime.sakuraFirebaseRuntimeInjected) {
              const script = document.createElement("script");

              script.type = "module";
              script.textContent = firebaseModuleScript;
              document.body.appendChild(script);
              runtime.sakuraFirebaseRuntimeInjected = true;
            }
          })
          .finally(() => {
            runtime.sakuraFirebaseRuntimePromise = null;
          });
      }

      if (runtime.sakuraFirebaseRuntimePromise) {
        await runtime.sakuraFirebaseRuntimePromise;
      }

      if (startFirebase) {
        await waitForRuntimeStart(bootNow);
        const runtimeStart = getWindowState().sakuraStartFirebaseAuth;

        if (runtimeStart && runtimeStart !== bootNow) {
          await runtimeStart();
        }
      }
    };

    const bootNow = () => loadRuntime(true);

    runtime.sakuraStartFirebaseAuth = bootNow;
    void loadRuntime(false);

    if (/(?:^|\/)profile(?:\/|$)/.test(window.location.pathname)) {
      void bootNow();
    }
  }, []);

  return null;
}
