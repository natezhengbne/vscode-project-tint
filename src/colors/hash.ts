function hash32(str: string): number {
	let h = 0x811c9dc5; // 2166136261
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 0x01000193); // 16777619
	}
	return h >>> 0;
}

const DEFAULT_PALETTE_12 = [
	"#E53935", // red
	"#8E24AA", // purple
	"#3949AB", // indigo
	"#1E88E5", // blue
	"#039BE5", // light blue
	"#00ACC1", // cyan
	"#00897B", // teal
	"#43A047", // green
	"#7CB342", // light green
	"#F4511E", // deep orange
	"#6D4C41", // brown
	"#546E7A", // blue grey
];

export function colorFromProjectName(
	projectName: string,
	palette: string[] = DEFAULT_PALETTE_12
): string {
	const key = (projectName || "").trim().toLowerCase();
	if (!key) {
		return palette[0];
	}
	const idx = hash32(key) % palette.length;
	return palette[idx];
}

export function contrastingText(hex: string): "#000000" | "#ffffff" {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;
	return yiq >= 150 ? "#000000" : "#ffffff";
}
