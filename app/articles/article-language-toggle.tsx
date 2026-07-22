"use client";

import { useEffect } from "react";

export function ArticleLanguageToggle() {
  useEffect(() => {
    const stored = window.localStorage.getItem("david-site-language-v2");
    const next = stored === "zh" ? "zh" : "en";
    document.documentElement.dataset.lang = next;
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  }, []);

  function toggle() {
    const next = document.documentElement.dataset.lang === "zh" ? "en" : "zh";
    window.localStorage.setItem("david-site-language-v2", next);
    document.documentElement.dataset.lang = next;
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  }

  return (
    <button className="article-language-toggle" type="button" onClick={toggle} aria-label="Switch language">
      <span className="lang lang-en">中文</span>
      <span className="lang lang-zh">EN</span>
    </button>
  );
}
