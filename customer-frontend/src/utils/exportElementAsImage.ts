import { toBlob } from "html-to-image";

async function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Capture a DOM element as a PNG and share it (mobile) or download it (desktop).
 */
export async function exportElementAsImage(
  element: HTMLElement,
  fileName: string
): Promise<void> {
  const blob = await toBlob(element, {
    pixelRatio: Math.min(window.devicePixelRatio || 2, 3),
    backgroundColor: "#ffffff",
    cacheBust: true,
    filter: (node: HTMLElement) =>
      !node.dataset || node.dataset.exportIgnore !== "true",
  });

  if (!blob) {
    throw new Error("Failed to generate image");
  }

  const file = new File([blob], fileName, { type: "image/png" });

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    (!navigator.canShare || navigator.canShare({ files: [file] }))
  ) {
    try {
      await navigator.share({ files: [file], title: fileName });
      return;
    } catch (error) {
      // User cancelled share sheet — don't fall through to download
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  }

  await downloadBlob(blob, fileName);
}
