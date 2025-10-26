
export interface Expense {
  id: string;
  concept: string;
  amount: number;
  categoryId: string;
  date: string; // ISO string format
}

export interface Category {
  id: string;
  name: string;
}
