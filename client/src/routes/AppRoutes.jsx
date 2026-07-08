import { Routes, Route } from 'react-router-dom';
import StorefrontLayout from '../components/layout/StorefrontLayout.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

import HomePage from '../pages/storefront/HomePage.jsx';
import ShopPage from '../pages/storefront/ShopPage.jsx';
import ProductPage from '../pages/storefront/ProductPage.jsx';
import CartPage from '../pages/storefront/CartPage.jsx';
import CheckoutPage from '../pages/storefront/CheckoutPage.jsx';
import GiftSetsPage from '../pages/storefront/GiftSetsPage.jsx';
import NotFoundPage from '../pages/storefront/NotFoundPage.jsx';

import LoginPage from '../pages/admin/LoginPage.jsx';
import DashboardPage from '../pages/admin/dashboard/DashboardPage.jsx';
import PageBuilderPage from '../pages/admin/pagebuilder/PageBuilderPage.jsx';
import ProductsListPage from '../pages/admin/products/ProductsListPage.jsx';
import ProductFormPage from '../pages/admin/products/ProductFormPage.jsx';
import OrdersListPage from '../pages/admin/orders/OrdersListPage.jsx';
import MediaLibraryPage from '../pages/admin/media/MediaLibraryPage.jsx';
import SiteSettingsPage from '../pages/admin/settings/SiteSettingsPage.jsx';

function AppRoutes() {
  return (
    <Routes>
      {/* Storefront - public */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:slug" element={<ProductPage />} />
        <Route path="/gift-sets" element={<GiftSetsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>

      {/* Admin - protected */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="pages/:slug" element={<PageBuilderPage />} />
        <Route path="products" element={<ProductsListPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="orders" element={<OrdersListPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="settings" element={<SiteSettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
