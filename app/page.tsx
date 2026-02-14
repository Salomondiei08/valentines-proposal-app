"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Lang = "fr" | "en";

const noMessagesByLang: Record<Lang, string[]> = {
  fr: ["Non 🙈", "Trop tard 😘", "Rate 😇", "Presque 💕", "Encore 😌", "Jamais non ✨"],
  en: ["No 🙈", "Too late 😘", "Missed 😇", "Almost 💕", "Try again 😌", "Never no ✨"]
};

const contentByLang: Record<Lang, {
  eyebrow: string;
  title: string;
  subtitle: string;
  yes: string;
}> = {
  fr: {
    eyebrow: "Pour la plus belle personne de ma vie",
    title: "Veux-tu etre ma Valentine pour toujours ?",
    subtitle: "J'ai une grande question... mais je pense deja connaitre ta reponse.",
    yes: "Oui, pour toujours 💖"
  },
  en: {
    eyebrow: "For the most beautiful person in my life",
    title: "Will you be my Valentine forever?",
    subtitle: "I have a big question... but I think I already know your answer.",
    yes: "Yes, forever 💖"
  }
};

/**
 * Main page with an evasive "No" button.
 */
export default function HomePage() {
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const returnTimerRef = useRef<number | null>(null);
  const dodgeIntervalRef = useRef<number | null>(null);
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);
  const proximityLoopRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const [lang, setLang] = useState<Lang>("fr");
  const [messageIndex, setMessageIndex] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isBlinkingAway, setIsBlinkingAway] = useState(false);

  const currentNoMessages = noMessagesByLang[lang];
  const currentContent = contentByLang[lang];
  const currentNoMessage = useMemo(
    () => currentNoMessages[messageIndex % currentNoMessages.length],
    [currentNoMessages, messageIndex]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    const savedLang = window.localStorage.getItem("valentine-lang");

    const isSupported = (value: string | null): value is Lang => value === "fr" || value === "en";

    if (isSupported(urlLang)) {
      setLang(urlLang);
      window.localStorage.setItem("valentine-lang", urlLang);
      return;
    }

    if (isSupported(savedLang)) {
      setLang(savedLang);
      params.set("lang", savedLang);
      window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
      return;
    }

    const autoLang: Lang = window.navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
    setLang(autoLang);
    window.localStorage.setItem("valentine-lang", autoLang);
    params.set("lang", autoLang);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }, []);

  const changeLang = useCallback((nextLang: Lang) => {
    if (typeof window === "undefined") return;
    setLang(nextLang);
    setMessageIndex(0);
    window.localStorage.setItem("valentine-lang", nextLang);

    const params = new URLSearchParams(window.location.search);
    params.set("lang", nextLang);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }, []);

  const scheduleReturnToOrigin = useCallback(() => {
    if (typeof window === "undefined") return;
    if (dodgeIntervalRef.current !== null) {
      window.clearInterval(dodgeIntervalRef.current);
      dodgeIntervalRef.current = null;
    }
    if (returnTimerRef.current !== null) {
      window.clearTimeout(returnTimerRef.current);
    }
    returnTimerRef.current = window.setTimeout(() => {
      setOffset({ x: 0, y: 0 });
    }, 650);
  }, []);

  const dodgeNoButton = useCallback((pointerX?: number, pointerY?: number) => {
    const button = noButtonRef.current;
    if (!button) return;
    if (typeof window !== "undefined" && returnTimerRef.current !== null) {
      window.clearTimeout(returnTimerRef.current);
    }

    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let vectorX = Math.random() > 0.5 ? 1 : -1;
    let vectorY = Math.random() > 0.5 ? 1 : -1;

    if (typeof pointerX === "number" && typeof pointerY === "number") {
      const awayX = centerX - pointerX;
      const awayY = centerY - pointerY;
      const length = Math.hypot(awayX, awayY);
      if (length < 8) {
        vectorX = Math.random() > 0.5 ? 1 : -1;
        vectorY = Math.random() > 0.5 ? 1 : -1;
      } else {
        vectorX = awayX / length;
        vectorY = awayY / length;
      }
    }

    const moveDistance = 72 + Math.random() * 42;
    const jitterX = (Math.random() - 0.5) * 24;
    const jitterY = (Math.random() - 0.5) * 20;
    const maxX = 132;
    const maxY = 64;

    setOffset((prev) => ({
      x: Math.max(-maxX, Math.min(maxX, prev.x + vectorX * moveDistance + jitterX)),
      y: Math.max(-maxY, Math.min(maxY, prev.y + vectorY * moveDistance * 0.55 + jitterY))
    }));
    setMessageIndex((prev) => (prev + 1) % currentNoMessages.length);
    scheduleReturnToOrigin();
  }, [currentNoMessages.length, scheduleReturnToOrigin]);

  const blinkAndDodge = useCallback((pointerX?: number, pointerY?: number) => {
    if (typeof window === "undefined") {
      dodgeNoButton(pointerX, pointerY);
      return;
    }
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }
    setIsBlinkingAway(true);
    dodgeNoButton(pointerX, pointerY);
    hideTimerRef.current = window.setTimeout(() => {
      setIsBlinkingAway(false);
    }, 85);
  }, [dodgeNoButton]);

  const startRapidDodge = useCallback((pointerX?: number, pointerY?: number) => {
    if (typeof pointerX === "number" && typeof pointerY === "number") {
      pointerPositionRef.current = { x: pointerX, y: pointerY };
    }
    dodgeNoButton(pointerX, pointerY);
    if (typeof window === "undefined") return;

    if (dodgeIntervalRef.current !== null) {
      window.clearInterval(dodgeIntervalRef.current);
    }
    dodgeIntervalRef.current = window.setInterval(() => {
      dodgeNoButton(pointerX, pointerY);
    }, 120);
  }, [dodgeNoButton]);

  const isPointerNearButton = useCallback((x: number, y: number) => {
    const button = noButtonRef.current;
    if (!button) return false;
    const rect = button.getBoundingClientRect();
    const margin = 26;
    return (
      x >= rect.left - margin &&
      x <= rect.right + margin &&
      y >= rect.top - margin &&
      y <= rect.bottom + margin
    );
  }, []);

  const isPointerInsideButton = useCallback((x: number, y: number) => {
    const button = noButtonRef.current;
    if (!button) return false;
    const rect = button.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePointerMove = (event: PointerEvent) => {
      pointerPositionRef.current = { x: event.clientX, y: event.clientY };
      if (isPointerInsideButton(event.clientX, event.clientY)) {
        blinkAndDodge(event.clientX, event.clientY);
        return;
      }
      if (isPointerNearButton(event.clientX, event.clientY)) {
        startRapidDodge(event.clientX, event.clientY);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      pointerPositionRef.current = { x: touch.clientX, y: touch.clientY };
      if (isPointerInsideButton(touch.clientX, touch.clientY)) {
        blinkAndDodge(touch.clientX, touch.clientY);
        return;
      }
      if (isPointerNearButton(touch.clientX, touch.clientY)) {
        startRapidDodge(touch.clientX, touch.clientY);
      }
    };

    const runProximityLoop = () => {
      const pointer = pointerPositionRef.current;
      if (pointer) {
        if (isPointerInsideButton(pointer.x, pointer.y)) {
          blinkAndDodge(pointer.x, pointer.y);
        } else if (isPointerNearButton(pointer.x, pointer.y)) {
          startRapidDodge(pointer.x, pointer.y);
        }
      }
      proximityLoopRef.current = window.setTimeout(runProximityLoop, 90);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    runProximityLoop();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (proximityLoopRef.current !== null) {
        window.clearTimeout(proximityLoopRef.current);
      }
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [blinkAndDodge, isPointerInsideButton, isPointerNearButton, startRapidDodge]);

  useEffect(() => {
    return () => {
      if (typeof window === "undefined") return;
      if (returnTimerRef.current !== null) {
        window.clearTimeout(returnTimerRef.current);
      }
      if (dodgeIntervalRef.current !== null) {
        window.clearInterval(dodgeIntervalRef.current);
      }
      if (proximityLoopRef.current !== null) {
        window.clearTimeout(proximityLoopRef.current);
      }
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return (
    <main className="page">
      <div className="glow glow-a" aria-hidden="true" />
      <div className="glow glow-b" aria-hidden="true" />
      <div className="heart heart-a" aria-hidden="true">❤</div>
      <div className="heart heart-b" aria-hidden="true">❤</div>

      <div className="lang-switch" role="group" aria-label="Language selector">
        <button
          type="button"
          className={`lang-button ${lang === "fr" ? "active" : ""}`}
          onClick={() => changeLang("fr")}
        >
          FR
        </button>
        <button
          type="button"
          className={`lang-button ${lang === "en" ? "active" : ""}`}
          onClick={() => changeLang("en")}
        >
          EN
        </button>
      </div>

      <div className="card">
        <p className="eyebrow">{currentContent.eyebrow}</p>
        <h1>{currentContent.title}</h1>
        <p className="subtitle">{currentContent.subtitle}</p>

        <div className="choices">
          <Link href={`/oui?lang=${lang}`} className="yes-button">
            {currentContent.yes}
          </Link>

          <button
            ref={noButtonRef}
            type="button"
            className="no-button"
            style={{
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
              opacity: isBlinkingAway ? 0 : 1
            }}
            onPointerEnter={(event) => startRapidDodge(event.clientX, event.clientY)}
            onPointerDown={(event) => {
              event.preventDefault();
              blinkAndDodge(event.clientX, event.clientY);
            }}
            onPointerMove={(event) => startRapidDodge(event.clientX, event.clientY)}
            onMouseDown={(event) => {
              event.preventDefault();
              blinkAndDodge(event.clientX, event.clientY);
            }}
            onTouchStart={(event) => {
              const touch = event.touches[0];
              blinkAndDodge(touch?.clientX, touch?.clientY);
            }}
            onTouchMove={(event) => {
              const touch = event.touches[0];
              startRapidDodge(touch?.clientX, touch?.clientY);
            }}
            onPointerLeave={scheduleReturnToOrigin}
            onBlur={scheduleReturnToOrigin}
            onClick={(event) => {
              event.preventDefault();
              dodgeNoButton();
            }}
            aria-label={lang === "fr" ? "Reponse non" : "No answer"}
          >
            {currentNoMessage}
          </button>
        </div>
      </div>
    </main>
  );
}
