export type BookType = 'UNITARIO' | 'PAQUETE';

export interface CategoryResponse {
  id: number;
  name: string;
}

export interface BookResponse {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  price: number;
  bookType: BookType;
  packageNote: string | null;
  companionBookId: number | null;
  companionBookTitle: string | null;
  companionLinePrice: number | null;
}

export interface CategoryRequest {
  name: string;
}

export interface BookRequest {
  categoryId: number;
  title: string;
  price: number;
  bookType: BookType;
  packageNote: string | null;
  companionBookId: number | null;
  companionLinePrice: number | null;
}
