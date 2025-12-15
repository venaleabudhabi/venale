'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, MenuCategory, MenuItem } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import DirhamAmount from '@/components/DirhamAmount';

interface CategoryFormData {
  key: string;
  name_en: string;
  name_ar: string;
  sortOrder: number;
  imageUrl?: string;
}

interface ItemFormData {
  key: string;
  name_en: string;
  name_ar: string;
  price: number;
  ingredients_en: string;
  ingredients_ar: string;
  tags: string;
  nutrition?: {
    calories_kcal?: number;
    carbs_g?: number;
    protein_g?: number;
    fiber_g?: number;
    fat_g?: number;
    micros_en?: string;
    micros_ar?: string;
  };
}

export default function MenuManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    key: '',
    name_en: '',
    name_ar: '',
    sortOrder: 0,
  });
  const [itemForm, setItemForm] = useState<ItemFormData>({
    key: '',
    name_en: '',
    name_ar: '',
    price: 0,
    ingredients_en: '',
    ingredients_ar: '',
    tags: '',
  });

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminApi.getCategories().then(res => res.data.categories),
  });

  const { data: items, isLoading: loadingItems } = useQuery({
    queryKey: ['admin', 'items', selectedCategory],
    queryFn: () => 
      adminApi.getItems(selectedCategory || undefined).then(res => res.data.items),
    enabled: !!selectedCategory,
  });

  const createCategory = useMutation({
    mutationFn: (data: CategoryFormData) => adminApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setShowCategoryModal(false);
      resetCategoryForm();
    },
  });

  const updateCategory = useMutation({
    mutationFn: (data: CategoryFormData) => 
      adminApi.updateCategory(editingCategory?._id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setShowCategoryModal(false);
      resetCategoryForm();
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setSelectedCategory(null);
    },
  });

  const createItem = useMutation({
    mutationFn: (data: any) => adminApi.createItem({
      ...data,
      categoryId: selectedCategory,
      ingredients_en: data.ingredients_en.split(',').map((i: string) => i.trim()),
      ingredients_ar: data.ingredients_ar.split(',').map((i: string) => i.trim()),
      tags: data.tags.split(',').map((i: string) => i.trim()),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'items', selectedCategory] });
      setShowItemModal(false);
      resetItemForm();
    },
  });

  const updateItem = useMutation({
    mutationFn: (data: any) => 
      adminApi.updateItem(editingItem?._id || '', {
        ...data,
        ingredients_en: data.ingredients_en.split(',').map((i: string) => i.trim()),
        ingredients_ar: data.ingredients_ar.split(',').map((i: string) => i.trim()),
        tags: data.tags.split(',').map((i: string) => i.trim()),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'items', selectedCategory] });
      setShowItemModal(false);
      resetItemForm();
    },
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => adminApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'items', selectedCategory] });
    },
  });

  const resetCategoryForm = () => {
    setCategoryForm({ key: '', name_en: '', name_ar: '', sortOrder: 0 });
    setEditingCategory(null);
  };

  const resetItemForm = () => {
    setItemForm({ key: '', name_en: '', name_ar: '', price: 0, ingredients_en: '', ingredients_ar: '', tags: '' });
    setEditingItem(null);
  };

  const handleCategorySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory.mutate(categoryForm);
    } else {
      createCategory.mutate(categoryForm);
    }
  };

  const handleItemSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItem.mutate(itemForm);
    } else {
      createItem.mutate(itemForm);
    }
  };

  const openCategoryModal = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        key: category.key,
        name_en: category.name_en || '',
        name_ar: category.name_ar || '',
        sortOrder: category.sortOrder || 0,
        imageUrl: category.imageUrl,
      });
    } else {
      resetCategoryForm();
    }
    setShowCategoryModal(true);
  };

  const openItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        key: item.key,
        name_en: item.name_en || '',
        name_ar: item.name_ar || '',
        price: item.price,
        ingredients_en: item.ingredients_en?.join(', ') || '',
        ingredients_ar: item.ingredients_ar?.join(', ') || '',
        tags: item.tags?.join(', ') || '',
        nutrition: item.nutrition,
      });
    } else {
      resetItemForm();
    }
    setShowItemModal(true);
  };

  if (loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
            <div className="flex gap-4">
              <button onClick={() => router.push('/admin/orders')} className="btn-secondary">
                View Orders
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('adminUser');
                  router.push('/admin/login');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                <button
                  onClick={() => openCategoryModal()}
                  className="btn-primary text-sm"
                >
                  + Add
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {categories?.map((category: MenuCategory) => (
                  <div
                    key={category._id}
                    onClick={() => setSelectedCategory(category._id || null)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedCategory === category._id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{category.name_en}</h3>
                        <p className="text-sm text-gray-500 mt-1">{category.name_ar}</p>
                        <p className="text-xs text-gray-400 mt-1">Key: {category.key}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCategoryModal(category);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          aria-label="Edit category"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this category?')) {
                              deleteCategory.mutate(category._id!);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                          aria-label="Delete category"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Items Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedCategory ? 'Items' : 'Select a category'}
                </h2>
                {selectedCategory && (
                  <button
                    onClick={() => openItemModal()}
                    className="btn-primary text-sm"
                  >
                    + Add Item
                  </button>
                )}
              </div>
              <div className="p-4">
                {!selectedCategory ? (
                  <p className="text-gray-500 text-center py-8">Select a category to view items</p>
                ) : loadingItems ? (
                  <LoadingSpinner className="py-8" />
                ) : items?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items in this category</p>
                ) : (
                  <div className="space-y-4">
                    {items?.map((item) => (
                      <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.name_en}</h3>
                            <p className="text-sm text-gray-500 mt-1">{item.name_ar}</p>
                            <div className="mt-2">
                              <DirhamAmount amount={item.price} size="sm" className="text-gray-600" />
                            </div>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                openItemModal(item);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                              aria-label="Edit item"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this item?')) {
                                  deleteItem.mutate(item._id!);
                                }
                              }}
                              className="text-red-600 hover:text-red-700"
                              aria-label="Delete item"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.key}
                  onChange={(e) => setCategoryForm({ ...categoryForm, key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  placeholder="e.g., protein_shakes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name_en}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  placeholder="e.g., Protein Shakes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Arabic)
                </label>
                <input
                  type="text"
                  value={categoryForm.name_ar}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_ar: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  placeholder="e.g., شيك البروتين"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={categoryForm.sortOrder}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCategory.isPending || updateCategory.isPending}
                  className="flex-1 btn-primary"
                >
                  {createCategory.isPending || updateCategory.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Edit Item' : 'Add Item'}</h3>
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key *
                </label>
                <input
                  type="text"
                  required
                  value={itemForm.key}
                  onChange={(e) => setItemForm({ ...itemForm, key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  placeholder="e.g., blueberry_shake"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.name_en}
                    onChange={(e) => setItemForm({ ...itemForm, name_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    placeholder="e.g., Blueberry Shake"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Arabic)
                  </label>
                  <input
                    type="text"
                    value={itemForm.name_ar}
                    onChange={(e) => setItemForm({ ...itemForm, name_ar: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    placeholder="e.g., شيك العنب الأزرق"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (AED) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredients (English - comma separated)
                  </label>
                  <textarea
                    value={itemForm.ingredients_en}
                    onChange={(e) => setItemForm({ ...itemForm, ingredients_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    rows={3}
                    placeholder="e.g., Blueberry, Banana, Yogurt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredients (Arabic - comma separated)
                  </label>
                  <textarea
                    value={itemForm.ingredients_ar}
                    onChange={(e) => setItemForm({ ...itemForm, ingredients_ar: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                    rows={3}
                    placeholder="e.g., العنب الأزرق، الموز، الزبادي"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={itemForm.tags}
                  onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  placeholder="e.g., healthy, vegan, gluten-free"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createItem.isPending || updateItem.isPending}
                  className="flex-1 btn-primary"
                >
                  {createItem.isPending || updateItem.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
