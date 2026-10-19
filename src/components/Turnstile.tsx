import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(window.turnstile!);
    script.onerror = () => reject(new Error("Could not load the security check."));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface TurnstileHandle {
  /** Turnstile tokens work once; call after every sign-in/sign-up attempt. */
  reset: () => void;
}

/** Cloudflare Turnstile bot check. Calls onToken with a token, or null when it expires. */
export const Turnstile = forwardRef<TurnstileHandle, { onToken: (token: string | null) => void }>(
  function Turnstile({ onToken }, ref) {
    if (!SITE_KEY) throw new Error("VITE_TURNSTILE_SITE_KEY is not set.");
    const box = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const [failed, setFailed] = useState<string | null>(null);
    const callback = useRef(onToken);
    callback.current = onToken;

    useImperativeHandle(ref, () => ({
      reset: () => {
        callback.current(null);
        if (widgetId.current) window.turnstile?.reset(widgetId.current);
      },
    }));

    useEffect(() => {
      let cancelled = false;
      loadTurnstile()
        .then((api) => {
          if (cancelled || !box.current) return;
          widgetId.current = api.render(box.current, {
            sitekey: SITE_KEY,
            callback: (token: string) => callback.current(token),
            "expired-callback": () => callback.current(null),
            "error-callback": () => callback.current(null),
          });
        })
        .catch((err: Error) => setFailed(err.message));
      return () => {
        cancelled = true;
        if (widgetId.current) window.turnstile?.remove(widgetId.current);
        widgetId.current = null;
      };
    }, []);

    if (failed) {
      return <p className="text-sm text-destructive">{failed} Please refresh the page.</p>;
    }
    return <div ref={box} className="min-h-[65px]" />;
  },
);
