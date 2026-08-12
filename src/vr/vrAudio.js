let ritualAudio = null;

const createEngine = () => {
  let context = null;
  let master = null;
  let voices = [];
  let playing = false;

  const ensureContext = async () => {
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error('Ritual audio is not supported by this browser.');
      context = new AudioContext();
    }
    if (context.state === 'suspended') await context.resume();
    return context;
  };

  const start = async () => {
    const ctx = await ensureContext();
    if (playing) return true;
    master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.028, ctx.currentTime + 1.4);
    master.connect(ctx.destination);

    const fundamentals = [46.25, 69.3, 92.5];
    voices = fundamentals.map((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = index === 0 ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index === 2 ? 7 : index === 1 ? -5 : 0;
      gain.gain.value = index === 0 ? 0.52 : 0.22;
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start();
      return { oscillator, gain };
    });
    playing = true;
    return true;
  };

  const stop = () => {
    if (!playing || !context || !master) return;
    const ending = context.currentTime + 0.5;
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, ending);
    voices.forEach(({ oscillator }) => oscillator.stop(ending + 0.05));
    voices = [];
    playing = false;
  };

  const setIntensity = value => {
    if (!playing || !context || !master) return;
    const normalized = Math.max(0, Math.min(1, Number(value) || 0));
    master.gain.setTargetAtTime(0.018 + normalized * 0.035, context.currentTime, 0.15);
  };

  const cue = async (kind = 'select') => {
    if (!playing) return false;
    const ctx = await ensureContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const frequencies = { select: 156, success: 312, forge: 93, oracle: 234, spirit: 117 };
    oscillator.type = kind === 'forge' ? 'sawtooth' : 'sine';
    oscillator.frequency.setValueAtTime(frequencies[kind] || frequencies.select, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime((frequencies[kind] || 156) * 0.72, ctx.currentTime + 0.28);
    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.34);
    return true;
  };

  return {
    cue,
    isPlaying: () => playing,
    setIntensity,
    start,
    stop,
  };
};

export const getVrRitualAudio = () => {
  if (!ritualAudio) ritualAudio = createEngine();
  return ritualAudio;
};
