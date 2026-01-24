import { useNavigate } from "react-router-dom";

const pageStyles = `
.nf-shell {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    background: radial-gradient(circle at 20% 20%, rgba(111, 255, 233, 0.14), transparent 35%),
        radial-gradient(circle at 80% 0%, rgba(104, 112, 250, 0.18), transparent 28%),
        linear-gradient(135deg, #0b1224, #0f172a 50%, #0b1022);
    color: #e9eef7;
    position: relative;
    overflow: hidden;
    font-family: "Source Sans Pro", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.nf-shell::before,
.nf-shell::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.nf-shell::before {
    background: radial-gradient(circle at 30% 70%, rgba(76, 206, 172, 0.08), transparent 32%),
        radial-gradient(circle at 70% 40%, rgba(221, 91, 120, 0.08), transparent 30%);
    filter: blur(12px);
}

.nf-shell::after {
    background: linear-gradient(120deg, rgba(255, 255, 255, 0.08), transparent 65%);
    mix-blend-mode: screen;
}

.nf-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.8), transparent 70%);
    opacity: 0.6;
}

.nf-blob {
    position: absolute;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(118, 182, 255, 0.42), rgba(36, 122, 255, 0));
    filter: blur(38px);
    opacity: 0.6;
    animation: nf-float 12s ease-in-out infinite;
}

.nf-blob-one {
    top: 6%;
    left: 12%;
    animation-delay: -3s;
}

.nf-blob-two {
    bottom: 0;
    right: 8%;
    background: radial-gradient(circle, rgba(88, 232, 205, 0.4), rgba(88, 232, 205, 0));
    animation-delay: 2s;
}

.nf-card {
    position: relative;
    max-width: 840px;
    width: min(880px, 100%);
    padding: 48px 40px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 28px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(18px);
    z-index: 1;
    overflow: hidden;
}

.nf-card::before {
    content: "";
    position: absolute;
    inset: 1px;
    border-radius: 26px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    pointer-events: none;
}

.nf-topline {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #9fb3d1;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    width: fit-content;
}

.nf-kicker-dot {
    width: 8px;
    height: 8px;
    background: linear-gradient(120deg, #f60000, #ff0000);
    border-radius: 999px;
    box-shadow: 0 0 14px rgba(246, 0, 0, 0.8);
}

.nf-main {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 32px;
    align-items: center;
    margin-top: 28px;
}

.nf-hero {
    position: relative;
    text-align: left;
}

.nf-404 {
    font-size: clamp(96px, 22vw, 200px);
    line-height: 0.9;
    letter-spacing: -0.06em;
    background: linear-gradient(120deg, #7dd4ff, #4cceac 35%, #c084fc 70%, #7dd4ff);
    -webkit-background-clip: text;
    color: transparent;
    text-shadow: 0 10px 38px rgba(125, 212, 255, 0.32);
    animation: nf-glow 8s ease-in-out infinite;
}

.nf-hero p {
    margin: 10px 0 0;
    color: #c7d3e8;
    font-size: 15px;
    max-width: 460px;
}

.nf-panel {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 22px 20px;
    display: grid;
    gap: 12px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.nf-title {
    font-size: clamp(26px, 4vw, 34px);
    color: #f5f8ff;
    margin: 4px 0;
}

.nf-sub {
    margin: 0;
    color: #9fb3d1;
    line-height: 1.6;
}

.nf-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 6px 0 2px;
}

.nf-chip {
    padding: 8px 12px;
    border-radius: 12px;
    background: rgba(125, 212, 255, 0.1);
    border: 1px solid rgba(125, 212, 255, 0.25);
    color: #d1e8ff;
    font-size: 13px;
}

.nf-chip.ghost {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.12);
    color: #b9c5da;
}

.nf-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
}

.nf-btn {
    cursor: pointer;
    border: 1px solid transparent;
    border-radius: 14px;
    padding: 14px 18px;
    font-weight: 600;
    letter-spacing: 0.01em;
    transition: transform 160ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
    color: #0b1224;
    background: linear-gradient(120deg, #7dd4ff, #4cceac);
    box-shadow: 0 12px 30px rgba(125, 212, 255, 0.35);
}

.nf-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 38px rgba(125, 212, 255, 0.4);
}

.nf-btn:active {
    transform: translateY(0);
    box-shadow: 0 8px 20px rgba(125, 212, 255, 0.32);
}

.nf-btn.ghost {
    background: rgba(255, 255, 255, 0.04);
    color: #e9eef7;
    border-color: rgba(255, 255, 255, 0.16);
    box-shadow: none;
}

.nf-btn.ghost:hover {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.25);
}

.nf-footer {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 18px;
    color: #8fa3c0;
    font-size: 13px;
}

.nf-dotline {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.24), transparent);
}

.nf-badge {
    position: absolute;
    top: 18px;
    right: 18px;
    padding: 8px 12px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #9fb3d1;
    font-weight: 700;
    letter-spacing: 0.08em;
}

@media (max-width: 720px) {
    .nf-card {
        padding: 36px 26px;
    }

    .nf-actions {
        flex-direction: column;
    }

    .nf-btn {
        width: 100%;
        text-align: center;
    }
}

@media (prefers-color-scheme: light) {
    .nf-shell {
        background: radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.22), transparent 32%),
            radial-gradient(circle at 80% 0%, rgba(52, 211, 153, 0.2), transparent 26%),
            linear-gradient(135deg, #eef3fb, #dfe8f8 52%, #f4f7fb);
        color: #0f172a;
    }

    .nf-card {
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.82));
        border-color: rgba(34, 42, 62, 0.08);
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.7);
    }

    .nf-topline,
    .nf-chip.ghost,
    .nf-footer {
        color: #475569;
    }

    .nf-hero p,
    .nf-sub,
    .nf-chip {
        color: #334155;
    }

    .nf-btn.ghost {
        color: #0f172a;
        border-color: rgba(15, 23, 42, 0.14);
        background: rgba(15, 23, 42, 0.04);
    }
}

@keyframes nf-float {
    0% {
        transform: translate3d(0, 0, 0) scale(1);
    }
    50% {
        transform: translate3d(10px, -12px, 0) scale(1.05);
    }
    100% {
        transform: translate3d(0, 0, 0) scale(1);
    }
}

@keyframes nf-glow {
    0% {
        filter: drop-shadow(0 14px 30px rgba(125, 212, 255, 0.38));
    }
    50% {
        filter: drop-shadow(0 12px 46px rgba(192, 132, 252, 0.42));
    }
    100% {
        filter: drop-shadow(0 14px 30px rgba(125, 212, 255, 0.38));
    }
}
`;

const NotFound404 = () => {
    const navigate = useNavigate();

    return (
        <div className="nf-shell">
            <style>{pageStyles}</style>
            <div className="nf-grid" aria-hidden="true" />
            <span className="nf-blob nf-blob-one" aria-hidden="true" />
            <span className="nf-blob nf-blob-two" aria-hidden="true" />

            <div className="nf-card" role="alert" aria-live="polite">

                <div className="nf-topline">
                    {/* Red color dot */}
                    <span className="nf-kicker-dot" />
                    Page not found
                </div>

                <div className="nf-main">
                    <div className="nf-hero">
                        <div className="nf-404" aria-label="404 status">
                            404
                        </div>
                        <p>
                            We looked everywhere but could not find the screen you requested.
                            The link may be outdated, or the page has moved to a new spot.
                        </p>
                    </div>

                    <div className="nf-panel">
                        

                       
                        <div className="nf-actions">
                            <button
                                type="button"
                                className="nf-btn"
                                onClick={() => navigate("/")}
                            >
                                Go to dashboard
                            </button>
                            <button
                                type="button"
                                className="nf-btn ghost"
                                onClick={() => navigate("/login")}
                            >
                                Back to login
                            </button>
                        </div>
                    </div>
                </div>

                
            </div>
        </div>
    );
};

export default NotFound404;