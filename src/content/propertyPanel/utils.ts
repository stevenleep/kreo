export const getRGBA = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
};

// export const getAlpha = (hex: string, alpha: string) => {
//     const r = parseInt(hex.slice(1, 3), 16);
//     const g = parseInt(hex.slice(3, 5), 16);
//     const b = parseInt(hex.slice(5, 7), 16);
//     return `rgba(${r}, ${g}, ${b}, ${alpha})`;
// }

export const colorToRgba = (color: string) => {
    const colorStr = (color || "").trim();
    if (colorStr === "transparent") {
        return {
            hex: "#000000",
            alpha: 0,
        };
    }
    // 1) 如果是 rgba / rgb --------------------------
    const rgbaMatch = colorStr.match(/^rgba?\(\s*([^(]+)\)$/i);
    if (rgbaMatch) {
        const parts = rgbaMatch[1].split(",").map((s) => s.trim());
        const [r, g, b] = parts.slice(0, 3).map(Number);
        const a = parts[3] === undefined ? 1 : parseFloat(parts[3]);
        const toHex = (c: number) => `0${Math.round(c).toString(16)}`.slice(-2);
        return {
            hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase(),
            alpha: Math.max(0, Math.min(1, a)) * 100,
        };
    }

    return {
        hex: `#${colorStr.slice(0, 6).toUpperCase()}`,
        alpha: 100,
    };
};
