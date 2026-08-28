export interface RasterizedPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

let pdfjsLoaded: typeof import('pdfjs-dist') | null = null;

async function getPdfjs() {
  if (typeof window === 'undefined') {
    throw new Error('PDF rasterization is only supported in client/browser environment');
  }

  if (!pdfjsLoaded) {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    pdfjsLoaded = pdfjs;
  }
  return pdfjsLoaded;
}

export async function getDocumentPageCount(file: File): Promise<number> {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    return 1;
  }
  try {
    const pdfjs = await getPdfjs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    return pdfDoc.numPages;
  } catch {
    return 1;
  }
}

/**
 * Converts an image File to a RasterizedPage representation.
 */
export async function rasterizeImageFile(file: File): Promise<RasterizedPage[]> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve([
        {
          pageNumber: 1,
          dataUrl: url,
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 1100,
        },
      ]);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image file'));
    };
    img.src = url;
  });
}

/**
 * Rasterizes a PDF file into an array of page image data URLs.
 */
export async function rasterizePdfFile(
  file: File,
  scale: number = 1.5
): Promise<RasterizedPage[]> {
  const pdfjs = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;

  const pages: RasterizedPage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error(`Failed to get canvas context for page ${pageNum}`);
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    pages.push({
      pageNumber: pageNum,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    });
  }

  return pages;
}

/**
 * Automatically handles either a PDF or Image file, producing an ordered array of RasterizedPage.
 */
export async function rasterizeDocument(
  file: File,
  scale: number = 1.5
): Promise<RasterizedPage[]> {
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    return rasterizePdfFile(file, scale);
  }
  return rasterizeImageFile(file);
}
