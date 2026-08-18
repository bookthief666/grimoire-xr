import React from 'react';
import {
  clearSavedGrimoireSession,
  readRawSavedGrimoireSession,
} from './persistence/grimoireStore.js';

const downloadText = (text, filename) => {
  if (!text || typeof document === 'undefined') return false;
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return true;
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, clearing: false };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep the failure inspectable without exposing implementation detail in the UI.
    console.error('Grimoire render boundary caught an error.', error, info);
  }

  reloadSavedSession = () => {
    window.location.reload();
  };

  exportRecoverySnapshot = () => {
    const raw = readRawSavedGrimoireSession();
    downloadText(raw, `grimoire-recovery-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  };

  startClean = async () => {
    if (!window.confirm('Start clean? This permanently removes the locally autosaved Grimoire session and its cached generated images. Export recovery first if you may want it later.')) return;
    this.setState({ clearing: true });
    await clearSavedGrimoireSession();
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    const hasRecovery = Boolean(readRawSavedGrimoireSession());

    return (
      <main className="min-h-[100dvh] bg-black text-[#e7dfca] grid place-items-center p-6">
        <section className="w-full max-w-xl border border-[#b8860b]/60 bg-[#090704] p-6 sm:p-8 shadow-[0_0_40px_rgba(184,134,11,0.15)]">
          <p className="text-[10px] tracking-[0.28em] uppercase text-[#b8860b] mb-3">Continuity Ward</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#f0e6c8] mb-4">The interface failed. The last stable Grimoire checkpoint remains separate.</h1>
          <p className="text-sm sm:text-base leading-relaxed text-[#c8bea8] mb-6">
            Reload the saved session first. If the same render failure returns, export the semantic recovery snapshot before starting clean.
          </p>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={this.reloadSavedSession}
              className="min-h-12 border border-[#b8860b] text-[#e5c158] px-4 py-3 text-sm font-semibold tracking-wide"
            >
              {hasRecovery ? 'RELOAD SAVED SESSION' : 'RELOAD APPLICATION'}
            </button>
            {hasRecovery && (
              <button
                type="button"
                onClick={this.exportRecoverySnapshot}
                className="min-h-12 border border-[#7b6c4d] text-[#d5c8a8] px-4 py-3 text-sm tracking-wide"
              >
                EXPORT RECOVERY SNAPSHOT
              </button>
            )}
            <button
              type="button"
              disabled={this.state.clearing}
              onClick={this.startClean}
              className="min-h-12 border border-red-900/80 text-red-400 px-4 py-3 text-sm tracking-wide disabled:opacity-50"
            >
              {this.state.clearing ? 'CLEARING LOCAL SESSION…' : 'START CLEAN'}
            </button>
          </div>
        </section>
      </main>
    );
  }
}
