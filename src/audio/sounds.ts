type Sound = "tap" | "select" | "navigate" | "complete" | "notice";

let context: AudioContext | null = null;

export function prepareSound() {
	try {
		context ??= new AudioContext();
		void context.resume().catch(() => {});
	} catch {
		// Audio is optional; visual feedback remains available.
	}
}

export function playSound(sound: Sound) {
	const audio = context;
	if (audio === null || audio.state !== "running" || document.hidden) return;
	const notes = {
		tap: [420, 380, 0.055, 0.025],
		select: [480, 600, 0.09, 0.035],
		navigate: [390, 520, 0.12, 0.03],
		complete: [520, 780, 0.2, 0.045],
		notice: [520, 390, 0.22, 0.07],
	} as const;
	const [from, to, duration, gain] = notes[sound];
	const tone = audio.createOscillator();
	const volume = audio.createGain();
	const start = audio.currentTime;
	tone.type = "sine";
	tone.frequency.setValueAtTime(from, start);
	tone.frequency.exponentialRampToValueAtTime(to, start + duration);
	volume.gain.setValueAtTime(0, start);
	volume.gain.linearRampToValueAtTime(gain, start + 0.01);
	volume.gain.exponentialRampToValueAtTime(0.001, start + duration);
	tone.connect(volume);
	volume.connect(audio.destination);
	tone.start(start);
	tone.stop(start + duration + 0.02);
	tone.onended = () => { tone.disconnect(); volume.disconnect(); };
}
