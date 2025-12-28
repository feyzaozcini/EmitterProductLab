import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Product } from './Models/product';
import { ProductList } from './myComponenets/product-list/product-list';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from './Models/CartItem';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, ProductList],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('emitterProductLab');

  products = signal<Product[]>([
    { id: 1, name: 'Mouse', price: 210 },
    { id: 2, name: 'Uzay gemisi', price: 400 },
    { id: 3, name: 'Klavye', price: 3200 },
    { id: 4, name: 'Meta VR', price: 18000 },
  ]);

  //filtre input state'lerimiz
  searchText = signal<string>('');
  maxPrice = signal<number | null>(null);


  //child'dan gelecek secili ürün id'si
  selectedProductId = signal<number | null>(null);

  selectedProduct = computed(() => {
    const id = this.selectedProductId();
    if (id == null) return null;
    return this.products().find((p) => p.id === id) ?? null;
  });

  //Child component event handler
  onChildSelected(productId: number) {
    this.selectedProductId.set(productId);
  }

  //custom pipe kaldırıldı. 
  filteredProducts = computed(() => {
    const products = this.products();
    const searchText = this.searchText().trim().toLowerCase();
    const maxPrice = this.maxPrice();

    return products.filter((p) => {
      const nameOk = searchText.length === 0 ? true : p.name.toLowerCase().includes(searchText);
      const priceOk = maxPrice === null || Number.isNaN(maxPrice) ? true : p.price <= maxPrice;
      return nameOk && priceOk;
    });
  });

  cart = signal<CartItem[]>([]);

  onAddToCart(product: Product) {
    this.cart.update((items) => {
      const existing = items.find((x) => x.product.id === product.id);
      if (!existing) {
        return [...items, { product, quantity: 1 }];
      }

      return items.map((x) =>
        x.product.id === product.id ? { ...x, quantity: x.quantity + 1 } : x
      );
    });
  }


  cartTotal = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  });

  removeFromCart(productId: number) {
    this.cart.update((items) => {
      const item = items.find((x) => x.product.id === productId);
      if (!item) return items;

      if (item.quantity <= 1) {
        return items.filter((x) => x.product.id !== productId);
      }

      return items.map((x) =>
        x.product.id === productId ? { ...x, quantity: x.quantity - 1 } : x
      );
    });
  }
}