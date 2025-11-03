export type Review = {
    id: string;
    author: string;
    title: string;               // nuevo campo obligatorio
    rating?: number;
    text: string;                // obligatorio
    images: string[];            // opcional (máx. 6)
    createdAt: string;
    publicationId?: string;      // opcional (referencia)
    publicationTitle?: string;   // opcional (referencia visual)
  };