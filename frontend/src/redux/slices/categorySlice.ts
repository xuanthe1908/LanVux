import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryService, Category } from '../../services/apiServices';

export interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  categoryStats: any;
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
  categoryStats: null,
  loading: false,
  error: null
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params: any = {}) => {
    const response = await categoryService.getAllCategories(params);
    return response.data;
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async ({ id, params }: { id: string; params?: any }) => {
    const response = await categoryService.getCategoryById(id, params);
    return response.data.category;
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (data: any) => {
    const response = await categoryService.createCategory(data);
    return response.data.category;
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await categoryService.updateCategory(id, data);
    return response.data.category;
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async ({ id, options }: { id: string; options?: any }) => {
    await categoryService.deleteCategory(id, options);
    return id;
  }
);

export const fetchCategoryStats = createAsyncThunk(
  'categories/fetchCategoryStats',
  async () => {
    const response = await categoryService.getCategoryStats();
    return response.data;
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Fetch category by ID
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.currentCategory = action.payload;
      })
      // Create category
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.unshift(action.payload);
      })
      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const updatedCategory = action.payload;
        state.categories = state.categories.map(category => 
          category.id === updatedCategory.id ? updatedCategory : category
        );
        if (state.currentCategory?.id === updatedCategory.id) {
          state.currentCategory = updatedCategory;
        }
      })
      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        const categoryId = action.payload;
        state.categories = state.categories.filter(category => category.id !== categoryId);
        if (state.currentCategory?.id === categoryId) {
          state.currentCategory = null;
        }
      })
      // Fetch category stats
      .addCase(fetchCategoryStats.fulfilled, (state, action) => {
        state.categoryStats = action.payload;
      });
  }
});

export const { clearError, clearCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;