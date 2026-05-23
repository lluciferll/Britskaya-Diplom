import { toPng } from "html-to-image";

export async function downloadElementAsPng(
  element: HTMLElement,
  fileName: string,
  pixelRatio = 2,
): Promise<void> {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio,
    backgroundColor: "#ffffff",
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
  a.click();
}
