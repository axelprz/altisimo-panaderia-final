import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms'; 
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule], 
  templateUrl: './admin-products.component.html'
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = true;
  searchTerm = '';

  // Modal y Formulario
  showModal = false;
  animateModal = false;
  isEditing = false;
  productForm: FormGroup;
  
  // Manejo de Imagen
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  imageError: string = '';

  // --- VARIABLES PARA TOAST Y MODAL ELIMINAR ---
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  showDeleteModal = false;
  productToDelete: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private cdr: ChangeDetectorRef 
  ) {
    this.productForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  formatImageUrl(imgPath: string | undefined): string {
    if (!imgPath) {
      return '/assets/images/placeholder-pan.jpg'; 
    }
    if (imgPath.startsWith('data:image')) {
      return imgPath; 
    }
    if (imgPath.startsWith('http')) {
      return imgPath;
    }
    if (imgPath.startsWith('/assets/') || imgPath.startsWith('assets/')) {
      return imgPath;
    }
    return imgPath;
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = [...this.products];
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al cargar catálogo', err);
        this.showNotification('Error de conexión al cargar el catálogo', 'error');
        this.isLoading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      (p.desc && p.desc.toLowerCase().includes(term))
    );
    this.cdr.detectChanges();
  }

  // --- MANEJO DEL MODAL DE EDICIÓN ---
  openModal(product?: Product) {
    this.isEditing = !!product;
    this.imageError = '';
    this.selectedFile = null;
    this.imagePreview = null;

    if (product) {
      this.productForm.patchValue({
        id: product.ID,
        name: product.name,
        description: product.desc, 
        price: product.price,
        is_active: product.is_active !== false 
      });
      this.imagePreview = this.formatImageUrl(product.img);
    } else {
      this.productForm.reset({ is_active: true });
    }

    this.showModal = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.animateModal = true;
      this.cdr.detectChanges(); 
    }, 10);
  }

  closeModal() {
    this.animateModal = false;
    this.cdr.detectChanges(); 

    setTimeout(() => {
      this.showModal = false;
      this.cdr.detectChanges(); 
    }, 300);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0] as File;
    this.imageError = '';

    if (file) {
      if (!file.type.match(/image\/(jpeg|png|webp)/)) {
        this.imageError = 'Solo formato JPG, PNG o WEBP.';
        this.cdr.detectChanges();
        return;
      }
      if (file.size > 2 * 1024 * 1024) { 
        this.imageError = 'La imagen excede el límite de 2MB.';
        this.cdr.detectChanges();
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = reader.result;
        this.cdr.detectChanges(); 
      };
      reader.readAsDataURL(file);
    }
  }

  saveProduct() {
    if (this.productForm.invalid) return;

    const formValues = this.productForm.value;

    if (this.isEditing) {
      const updateData = {
        name: formValues.name,
        desc: formValues.description,
        price: formValues.price,
        unidad: "Unidad", 
        is_active: formValues.is_active 
      };

      this.productService.updateProduct(formValues.id, updateData).subscribe({
        next: () => {
          this.showNotification('Receta actualizada con éxito', 'success');
          this.closeModal();
          this.loadProducts(); 
        },
        error: (err) => {
          console.error(err);
          this.showNotification('Error al actualizar el producto', 'error');
        }
      });

    } else {
      const formData = new FormData();
      formData.append('name', formValues.name);
      formData.append('description', formValues.description);
      formData.append('price', formValues.price.toString());
      formData.append('unidad', 'Unidad'); 
      formData.append('is_active', formValues.is_active ? 'true' : 'false'); 
      
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.productService.createProduct(formData).subscribe({
        next: () => {
          this.showNotification('¡Nueva receta publicada en la tienda!', 'success');
          this.closeModal();
          this.loadProducts(); 
        },
        error: (err) => {
          console.error(err);
          this.showNotification('Error al publicar el producto', 'error');
        }
      });
    }
  }

  // --- LÓGICA DEL MODAL DE ELIMINAR ---
  confirmDeleteProduct(id: number | undefined): void {
    if (!id) return;
    this.productToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  processDelete() {
    if (!this.productToDelete) return;

    this.productService.deleteProduct(this.productToDelete).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.ID !== this.productToDelete);
        this.applyFilter(); // Actualiza la tabla visual
        this.cancelDelete();
        this.showNotification('Producto eliminado del catálogo', 'success');
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.cancelDelete();
        this.showNotification('No se pudo eliminar el producto', 'error');
      }
    });
  }

  // --- NOTIFICACIONES ---
  showNotification(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 4000);
  }

  get f() { return this.productForm.controls; }
}