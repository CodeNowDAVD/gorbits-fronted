import type { BookResponse } from '../../catalog/catalog.models';

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Importe de una línea: precio del libro en catálogo × cantidad (− descuento opcional). */
export function libraryLineAmount(book: BookResponse, quantity: number, discountPercent = 0): number {
  const gross = book.price * quantity;
  const factor = 1 - Math.max(0, Math.min(100, discountPercent)) / 100;
  return roundMoney(gross * factor);
}

export function companionBook(all: BookResponse[], main: BookResponse): BookResponse | undefined {
  if (main.companionBookId == null) return undefined;
  return all.find((b) => b.id === main.companionBookId);
}

/** Etiqueta como en manual de librería: * o ** */
export function bookCatalogLabel(book: BookResponse): string {
  const mark = book.bookType === 'PAQUETE' ? '**' : '*';
  return `${mark} ${book.title}`;
}

/**
 * Aviso cuando el título lleva ** (admin ya configuró qué suele venir en factura).
 * El proveedor debe agregar esa otra línea si aparece en su remisión.
 */
export function libraryInclusionHint(
  book: BookResponse | undefined,
  allBooks: BookResponse[],
): string | null {
  if (!book || book.bookType !== 'PAQUETE' || !book.companionBookTitle) {
    return null;
  }
  const incl = companionBook(allBooks, book);
  const inclPrice = incl ? incl.price.toFixed(2) : '?';
  return (
    `Este título lleva ** en el manual de la librería. Debes agregar «${book.companionBookTitle}» ` +
    `(B ${inclPrice}/u.) en otra línea con **exactamente la misma cantidad** (ej. 10 y 10, nunca 10 y 6).`
  );
}

export function validatePackagePairQuantities(
  lines: { bookId: number | null; quantity: number }[],
  allBooks: BookResponse[],
): string | null {
  const qty = new Map<number, number>();
  for (const l of lines) {
    if (l.bookId == null) continue;
    qty.set(l.bookId, (qty.get(l.bookId) ?? 0) + Number(l.quantity));
  }
  for (const book of allBooks) {
    if (book.bookType !== 'PAQUETE' || book.companionBookId == null) continue;
    const mainQty = qty.get(book.id) ?? 0;
    if (mainQty === 0) continue;
    const compQty = qty.get(book.companionBookId) ?? 0;
    if (compQty === 0) {
      return `«${book.title}» (**) requiere «${book.companionBookTitle}» con ${mainQty} unidades (misma cantidad).`;
    }
    if (compQty !== mainQty) {
      return `«${book.companionBookTitle}» debe ser ${mainQty} uds., igual que «${book.title}» (tienes ${compQty}).`;
    }
  }
  for (const book of allBooks) {
    if (book.bookType !== 'PAQUETE' || book.companionBookId == null) continue;
    const compQty = qty.get(book.companionBookId) ?? 0;
    if (compQty === 0) continue;
    const mainQty = qty.get(book.id) ?? 0;
    if (mainQty === 0) {
      return `«${book.companionBookTitle}» va con «${book.title}» (**); agrega ese título con la misma cantidad.`;
    }
  }
  return null;
}

export function hasCompanionConfigured(book: BookResponse | undefined): boolean {
  return book?.bookType === 'PAQUETE' && book.companionBookId != null;
}

export function libraryUnitPriceLabel(book: BookResponse): string {
  return `B ${book.price.toFixed(2)} / u.`;
}
