export interface MenuItem {
  id: string;
  category: string; // 'pizza' | 'drink' | 'dessert' | 'appetizer'
  nameEn: string;
  nameSq: string;
  descriptionEn: string;
  descriptionSq: string;
  price: number; // In Albanian Lek (ALL)
  image: string;
  isAvailable: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export type Language = "en" | "sq";
