/**
 * Rendering a PDF's pages to images, for the AI features that read a document.
 *
 * Run:  npx tsx --test packages/lib/__tests__/pdf-to-images.test.ts
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PDF, StandardFonts } from '@libpdf/core';

import { pdfToImages } from '../server-only/ai/pdf-to-images';

const pdfOf = async (pages: string[]) => {
  const pdf = PDF.create();

  for (const text of pages) {
    const page = pdf.addPage({ size: 'letter' });

    page.drawText(text, { x: 72, y: 700, font: StandardFonts.Helvetica, size: 12 });
  }

  return new Uint8Array(await pdf.save());
};

test('renders every page to a JPEG, in order', async () => {
  const images = await pdfToImages(await pdfOf(['one', 'two']), { scale: 1 });

  assert.deepEqual(
    images.map(({ pageNumber }) => pageNumber),
    [1, 2],
  );

  for (const { image, mimeType, width, height } of images) {
    assert.equal(mimeType, 'image/jpeg');
    // Every JPEG opens with the start-of-image marker.
    assert.deepEqual([image[0], image[1]], [0xff, 0xd8]);
    // US letter at scale 1: 612 by 792 points.
    assert.deepEqual([width, height], [612, 792]);
  }
});
