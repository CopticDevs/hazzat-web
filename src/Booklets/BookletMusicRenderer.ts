export interface BookletScorePage {
    pngBytes: Uint8Array;
    width: number;
    height: number;
}

/** Engrave complete score pages, so PDF page breaks never cut through a staff. */
export async function renderBookletMusic(musicXml: string): Promise<BookletScorePage[]> {
    const xml = new DOMParser().parseFromString(musicXml, "application/xml");
    if (xml.querySelector("parsererror") || !["score-partwise", "score-timewise"].includes(xml.documentElement.localName)) {
        throw new Error("Invalid booklet MusicXML score.");
    }
    const { OpenSheetMusicDisplay } = await import("opensheetmusicdisplay");
    const container = document.createElement("div");
    // Fixed engraving width is independent of the current viewport and website theme.
    Object.assign(container.style, { position: "absolute", left: "-10000px", top: "0", width: "648px", visibility: "hidden", direction: "ltr" });
    document.body.appendChild(container);
    let score: InstanceType<typeof OpenSheetMusicDisplay> | undefined;
    try {
        score = new OpenSheetMusicDisplay(container, {
            autoResize: false, backend: "svg", drawTitle: false, drawSubtitle: false,
            drawComposer: false, drawLyricist: false, pageBackgroundColor: "#FFFFFF"
        });
        score.setCustomPageFormat(324, 440);
        score.Zoom = 1;
        await score.load(musicXml);
        score.render();
        const pages: BookletScorePage[] = [];
        for (const svg of Array.from(container.querySelectorAll("svg"))) {
            const width = svg.width.baseVal.value;
            const height = svg.height.baseVal.value;
            if (!width || !height) throw new Error("Musical notes rendered an empty page.");
            const copy = svg.cloneNode(true) as SVGSVGElement;
            copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            copy.setAttribute("viewBox", `0 0 ${width} ${height}`);
            copy.setAttribute("width", String(width * 2));
            copy.setAttribute("height", String(height * 2));
            // Export ink stays black on white, including from dark-mode pages.
            copy.style.color = "#000000";
            copy.style.backgroundColor = "#FFFFFF";
            const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: "image/svg+xml" }));
            try {
                const image = new Image();
                await new Promise<void>((resolve, reject) => {
                    image.onload = () => resolve();
                    image.onerror = () => reject(new Error("Unable to export musical notes."));
                    image.src = url;
                });
                const canvas = document.createElement("canvas");
                canvas.width = Math.ceil(width * 2);
                canvas.height = Math.ceil(height * 2);
                const context = canvas.getContext("2d");
                if (!context) throw new Error("Musical notes require a browser canvas.");
                context.fillStyle = "#FFFFFF";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Unable to export score page.")), "image/png"));
                pages.push({ pngBytes: new Uint8Array(await blob.arrayBuffer()), width, height });
            } finally {
                URL.revokeObjectURL(url);
            }
        }
        if (!pages.length) throw new Error("Musical notes rendered no pages.");
        return pages;
    } finally {
        score?.clear();
        container.remove();
    }
}
