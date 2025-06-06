// Simple SRT parser
function parseSrt(srt: string) {
  const entries = [];
  const blocks = srt.split(/\n\n+/);
  for (const block of blocks) {
    const lines = block.split(/\n/).filter(Boolean);
    if (lines.length < 3) continue;
    // 0: index, 1: time, 2+: text
    const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (!timeMatch) continue;
    const start =
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000;
    const end =
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000;
    const text = lines.slice(2).join(' ');
    entries.push({ start, end, text });
  }
  return entries;
}

// Align by start time (within 0.5s tolerance)
export function parseAndAlignSubtitles(engSrt: string, hindiSrt: string) {
  const eng = parseSrt(engSrt);
  const hin = parseSrt(hindiSrt);
  const aligned = [];
  for (const e of eng) {
    // Find closest hindi by start time
    let best = null;
    let bestDelta = 0.5;
    for (const h of hin) {
      const delta = Math.abs(h.start - e.start);
      if (delta < bestDelta) {
        best = h;
        bestDelta = delta;
      }
    }
    aligned.push({ start: e.start, end: e.end, text: e.text, translation: best ? best.text : '' });
  }
  return aligned;
}