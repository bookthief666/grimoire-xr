import React from 'react';
import { BookOpen, ChevronDown, Download, Sparkles } from 'lucide-react';

export default function ThresholdLanding({
  question,
  onQuestionChange,
  onDraw,
  traditionName,
  subject,
  onSubjectChange,
  styleName,
  onInitiateStudio,
  onRestoreArchive,
  vrHref = null,
}) {
  const canDraw = Boolean(String(question || '').trim());
  const canInitiateStudio = Boolean(String(subject || '').trim());

  return (
    <main className="min-h-[100dvh] pt-[calc(6.5rem+env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] flex items-center justify-center z-10 relative flex-1">
      <section className="w-full max-w-3xl mx-auto text-[#e9dfc7]">
        <header className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 text-[#b99748] mb-4">
            <span className="h-px w-10 sm:w-16 bg-[#8b6a2b]/55" />
            <BookOpen size={20} />
            <span className="h-px w-10 sm:w-16 bg-[#8b6a2b]/55" />
          </div>
          <div className="font-header text-[8px] sm:text-[9px] tracking-[0.3em] text-[#b99748]">THE THRESHOLD</div>
          <h1 className="mt-5 text-3xl sm:text-5xl leading-tight text-[#f0e8d7]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            What do you bring before the Grimoire?
          </h1>
          <p className="mt-4 mx-auto max-w-xl text-base sm:text-lg leading-relaxed text-[#aa9e85]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Ask first. The cards and their recorded relations are drawn locally; interpretation and manifestation remain yours to request afterward.
          </p>
        </header>

        <div className="border-y border-[#8b6a2b]/45 bg-[#090806]/88 px-4 py-5 sm:px-8 sm:py-7 shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
          <label htmlFor="threshold-question" className="block font-header text-[8px] tracking-[0.2em] text-[#d0af58] mb-3">YOUR QUESTION</label>
          <textarea
            id="threshold-question"
            value={question}
            onChange={event => onQuestionChange?.(event.target.value)}
            placeholder="Write what you want the cards to illuminate…"
            autoCapitalize="sentences"
            autoCorrect="on"
            className="native-text-input w-full min-h-[150px] sm:min-h-[180px] resize-y bg-transparent border border-[#8b6a2b]/35 px-4 py-4 text-xl sm:text-2xl leading-relaxed text-[#f0e7d3] placeholder:text-[#8b806b]/45 focus:outline-none focus:border-[#c29c47]/70"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          />

          <button
            type="button"
            onClick={onDraw}
            disabled={!canDraw}
            className="mt-5 min-h-14 w-full flex items-center justify-center gap-3 border border-[#b8860b]/75 bg-[#b8860b]/10 px-5 py-4 font-header text-[10px] sm:text-xs tracking-[0.14em] text-[#e5c158] transition-colors hover:bg-[#b8860b] hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Sparkles size={16} /> DRAW THREE
          </button>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[12px] sm:text-sm text-[#817761]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            <span>Current Tarot preset · <span className="text-[#bda76f]">{traditionName}</span></span>
            <span>Provider-free first reading</span>
          </div>
        </div>

        <details className="group mt-6 border border-white/10 bg-black/25">
          <summary className="min-h-12 cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3 font-header text-[8px] sm:text-[9px] tracking-[0.14em] text-[#8f7a4d]">
            <span>STUDIO & ARCHIVES</span>
            <ChevronDown size={15} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-white/10 px-4 py-5 sm:px-6 sm:py-6">
            <p className="text-sm sm:text-base leading-relaxed text-[#9e927a] mb-5" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Enter the full studio when you want dossier generation, image manifestation, the complete deck workspace, or advanced configuration.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mb-4 text-[11px] text-[#9a8760]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              <div><span className="text-[#c2a75f]">Tarot preset</span><br />{traditionName}</div>
              <div><span className="text-[#c2a75f]">Art style</span><br />{styleName}</div>
            </div>

            <input
              value={subject}
              onChange={event => onSubjectChange?.(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing && canInitiateStudio) onInitiateStudio?.();
              }}
              enterKeyHint="go"
              autoCapitalize="words"
              placeholder="Subject / name for the full studio…"
              className="native-text-input w-full bg-black/35 border border-[#8b6a2b]/35 px-4 py-3 text-base text-[#dfd3ba] placeholder:text-[#786d58]/45 focus:outline-none focus:border-[#b8860b]/70"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            />

            <button
              type="button"
              onClick={onInitiateStudio}
              disabled={!canInitiateStudio}
              className="mt-3 min-h-12 w-full border border-red-900/65 px-4 py-3 font-header text-[9px] text-red-300/75 transition-colors hover:border-red-600 hover:text-red-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ENTER FULL STUDIO
            </button>

            <button
              type="button"
              onClick={onRestoreArchive}
              className="mt-3 min-h-12 w-full flex items-center justify-center gap-2 border border-[#8b6a2b]/45 px-4 py-3 font-header text-[9px] text-[#bba064] hover:border-[#b8860b] hover:text-[#e5c158] transition-colors"
            >
              <Download size={14} /> RESTORE A KEPT GRIMOIRE
            </button>

            {vrHref && (
              <a href={vrHref} className="mt-3 min-h-12 w-full flex items-center justify-center border border-[#8b6a2b]/35 px-4 py-3 font-header text-[9px] text-[#8f7a4d] hover:border-[#b8860b] hover:text-[#d6b45b] transition-colors">
                ENTER VR PROTOTYPE
              </a>
            )}
          </div>
        </details>
      </section>
    </main>
  );
}
