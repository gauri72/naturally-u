import { Routes, Route } from 'react-router-dom';
import StorefrontLayout from '../components/layout/StorefrontLayout.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

import HomePage from '../pages/storefront/HomePage.jsx';
import ShopPage from '../pages/storefront/ShopPage.jsx';
import ProductPage from '../pages/storefront/ProductPage.jsx';
import CartPage from '../pages/storefront/CartPage.jsx';
import CheckoutPage from '../pages/storefront/CheckoutPage.jsx';
import OrderSuccessPage from '../pages/storefront/OrderSuccessPage.jsx';
import GiftSetsPage from '../pages/storefront/GiftSetsPage.jsx';
import FaqPage from '../pages/storefront/FaqPage.jsx';
import ShippingReturnsPage from '../pages/storefront/ShippingReturnsPage.jsx';
import TrackOrderPage from '../pages/storefront/TrackOrderPage.jsx';
import PrivacyPolicyPage from '../pages/storefront/PrivacyPolicyPage.jsx';
import TermsPage from '../pages/storefront/TermsPage.jsx';
import NotFoundPage from '../pages/storefront/NotFoundPage.jsx';
import AboutMakerPage from '../pages/storefront/AboutMakerPage.jsx';
import WorkshopsPage from '../pages/storefront/WorkshopsPage.jsx';
import ContactPage from '../pages/storefront/ContactPage.jsx';
import SearchPage from '../pages/storefront/SearchPage.jsx';
import CmsPage from '../pages/storefront/CmsPage.jsx';

import LoginPage from '../pages/admin/LoginPage.jsx';
import DashboardPage from '../pages/admin/dashboard/DashboardPage.jsx';
import PagesListPage from '../pages/admin/pagebuilder/PagesListPage.jsx';
import PageBuilderPage from '../pages/admin/pagebuilder/PageBuilderPage.jsx';
import ProductsListPage from '../pages/admin/products/ProductsListPage.jsx';
import ProductFormPage from '../pages/admin/products/ProductFormPage.jsx';
import OrdersListPage from '../pages/admin/orders/OrdersListPage.jsx';
import MediaLibraryPage from '../pages/admin/media/MediaLibraryPage.jsx';
import SiteSettingsPage from '../pages/admin/settings/SiteSettingsPage.jsx';
import MediaGalleryHomePage from '../pages/admin/media-gallery/MediaGalleryHomePage.jsx';
import ArchiveListPage from '../pages/admin/media-gallery/ArchiveListPage.jsx';
import ArchivePageDetailPage from '../pages/admin/media-gallery/ArchivePageDetailPage.jsx';
import ArchiveSectionEditorPage from '../pages/admin/media-gallery/ArchiveSectionEditorPage.jsx';

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
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about-the-maker" element={<AboutMakerPage />} />
        <Route path="/workshops" element={<WorkshopsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/search" element={<SearchPage />} />
        {/* Generic CMS pages by slug (e.g. /about-2); static routes above
            rank higher in react-router matching, and /admin is a separate
            top-level static route, so neither is shadowed. */}
        <Route path="/:slug" element={<CmsPage />} />
        <Route path="*" element={<NotFoundPage />} />
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
        <Route path="pages" element={<PagesListPage />} />
        <Route path="pages/:slug" element={<PageBuilderPage />} />
        <Route path="products" element={<ProductsListPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="orders" element={<OrdersListPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="media-gallery" element={<MediaGalleryHomePage />} />
        <Route path="media-gallery/archive" element={<ArchiveListPage />} />
        <Route path="media-gallery/archive/:pageSlug" element={<ArchivePageDetailPage />} />
        <Route path="media-gallery/archive/:pageSlug/sections/:sectionId" element={<ArchiveSectionEditorPage />} />
        <Route path="settings" element={<SiteSettingsPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
