"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "fr" | "en";

const contentByLang: Record<Lang, {
  eyebrow: string;
  title: string;
  paragraph: string;
  signature: string;
  back: string;
}> = {
  fr: {
    eyebrow: "Tu as dit oui...",
    title: "Mon coeur danse de bonheur !",
    paragraph:
      "Promis, je vais te faire sourire chaque jour, te tenir la main dans les moments doux comme dans les moments fous, et t'aimer encore plus fort demain qu'aujourd'hui.",
    signature: "Je t'aime infiniment. 💗",
    back: "Revoir la question"
  },
  en: {
    eyebrow: "You said yes...",
    title: "My heart is dancing with joy!",
    paragraph:
      "I promise to make you smile every day, hold your hand in the sweetest and craziest moments, and love you even more tomorrow than today.",
    signature: "I love you endlessly. 💗",
    back: "See the question again"
  }
};

/**
 * Celebration page shown after accepting the Valentine proposal.
 */
export default function OuiPage() {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const rawLang = params.get("lang");
    const nextLang: Lang = rawLang === "en" ? "en" : "fr";
    setLang(nextLang);
  }, []);

  const content = contentByLang[lang];

  return (
    <main className="yes-page">
      <div className="spark spark-1" aria-hidden="true" />
      <div className="spark spark-2" aria-hidden="true" />
      <div className="spark spark-3" aria-hidden="true" />
      <div className="floating-hearts" aria-hidden="true">
        <span>❤</span>
        <span>❤</span>
        <span>❤</span>
        <span>❤</span>
        <span>❤</span>
      </div>

      <div className="lang-switch" role="group" aria-label="Language selector">
        <Link href="/oui?lang=fr" className={`lang-button ${lang === "fr" ? "active" : ""}`}>
          FR
        </Link>
        <Link href="/oui?lang=en" className={`lang-button ${lang === "en" ? "active" : ""}`}>
          EN
        </Link>
      </div>

      <section className="yes-card">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p>{content.paragraph}</p>
        <p className="signature">{content.signature}</p>

        <Link href={`/?lang=${lang}`} className="back-link">
          {content.back}
        </Link>
      </section>
    </main>
  );
}
