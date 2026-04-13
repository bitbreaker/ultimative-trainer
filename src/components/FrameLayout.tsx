import { useEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  footerLeft?: string;
  footerCenter?: string;
  footerRight?: string;
};

const APP_VERSION = "v0.7.0";

export function FrameLayout({
  children,
  footerLeft = "",
  footerCenter = APP_VERSION,
  footerRight,
}: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const defaultRight = `${now.toLocaleDateString("de-DE")} ${now.toLocaleTimeString(
    "de-DE",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  )}`;

  return (
    <div className="app-shell">
      <div className="app-window">
        <header className="frame-top">
          <div className="title-box">
            <div className="title-line">DER ULTIMATIVE TRAINER</div>
            <div className="subtitle-line">Ein Trainer von Jörn Priebe (c) 2026</div>
          </div>
        </header>

        <main className="frame-main">
          <div className="frame-main-scroll">{children}</div>
        </main>

        <footer className="frame-bottom">
          <span className="footer-left">{footerLeft}</span>
          <span className="footer-center">{footerCenter}</span>
          <span className="footer-right">{footerRight ?? defaultRight}</span>
        </footer>
      </div>
    </div>
  );
}