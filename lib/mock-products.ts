export interface Product {
  id: string;
  title: string;
  author: string;
  price: number;
  image: string;
  tags: string[];
  category: 'fiction' | 'non-fiction' | 'romance' | 'sci-fi';
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number;
  format?: 'hardcover' | 'softcover' | 'ebook';
}

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    price: 24.99,
    image: 'https://picsum.photos/300/400?random=1',
    tags: ['fiction', 'new', 'hardcover', 'bestseller'],
    category: 'fiction',
    isNew: true,
    format: 'hardcover',
  },
  {
    id: '2',
    title: 'Atomic Habits',
    author: 'James Clear',
    price: 19.99,
    image: 'https://picsum.photos/300/400?random=2',
    tags: ['non-fiction', 'self-help', 'softcover', 'productivity'],
    category: 'non-fiction',
    format: 'softcover',
  },
  {
    id: '3',
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    price: 22.99,
    image: 'https://picsum.photos/300/400?random=3',
    tags: ['romance', 'sale', 'hardcover', 'drama'],
    category: 'romance',
    isSale: true,
    salePrice: 18.99,
    format: 'hardcover',
  },
  {
    id: '4',
    title: 'Dune',
    author: 'Frank Herbert',
    price: 26.99,
    image: 'https://picsum.photos/300/400?random=4',
    tags: ['sci-fi', 'hardcover', 'epic', 'space'],
    category: 'sci-fi',
    format: 'hardcover',
  },
  {
    id: '5',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    price: 21.99,
    image: 'https://picsum.photos/300/400?random=5',
    tags: ['non-fiction', 'finance', 'softcover', 'psychology'],
    category: 'non-fiction',
    format: 'softcover',
  },
  {
    id: '6',
    title: 'It Ends with Us',
    author: 'Colleen Hoover',
    price: 23.99,
    image: 'https://picsum.photos/300/400?random=6',
    tags: ['romance', 'new', 'softcover', 'contemporary'],
    category: 'romance',
    isNew: true,
    format: 'softcover',
  },
  {
    id: '7',
    title: 'Foundation',
    author: 'Isaac Asimov',
    price: 25.99,
    image: 'https://picsum.photos/300/400?random=7',
    tags: ['sci-fi', 'hardcover', 'classic', 'future'],
    category: 'sci-fi',
    format: 'hardcover',
  },
  {
    id: '8',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    price: 18.99,
    image: 'https://picsum.photos/300/400?random=8',
    tags: ['fiction', 'sale', 'softcover', 'classic'],
    category: 'fiction',
    isSale: true,
    salePrice: 14.99,
    format: 'softcover',
  },
  {
    id: '9',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    price: 27.99,
    image: 'https://picsum.photos/300/400?random=9',
    tags: ['non-fiction', 'hardcover', 'history', 'anthropology'],
    category: 'non-fiction',
    format: 'hardcover',
  },
  {
    id: '10',
    title: 'The Time Machine',
    author: 'H.G. Wells',
    price: 20.99,
    image: 'https://picsum.photos/300/400?random=10',
    tags: ['sci-fi', 'softcover', 'classic', 'time-travel'],
    category: 'sci-fi',
    format: 'softcover',
  },
  {
    id: '11',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    price: 19.99,
    image: 'https://picsum.photos/300/400?random=11',
    tags: ['romance', 'hardcover', 'classic', 'period'],
    category: 'romance',
    format: 'hardcover',
  },
  {
    id: '12',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    price: 24.99,
    image: 'https://picsum.photos/300/400?random=12',
    tags: ['fiction', 'new', 'hardcover', 'thriller'],
    category: 'fiction',
    isNew: true,
    format: 'hardcover',
  },
];

export const getProductsByCategory = (category: string) => {
  return mockProducts.filter(product => product.category === category);
};

export const getFeaturedProducts = () => {
  return mockProducts.filter(product => product.isNew || product.isSale);
};
