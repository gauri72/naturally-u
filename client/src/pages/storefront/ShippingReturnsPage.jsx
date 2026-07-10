import { Truck, ArrowUUpLeft } from '@phosphor-icons/react';
import './ShippingReturnsPage.css';

function ShippingReturnsPage() {
  return (
    <section className="shop-page shipping-returns-page">
      <h1>Shipping &amp; Returns</h1>
      <div className="shipping-returns-page__grid">
        <div className="shipping-returns-page__card">
          <Truck size={28} weight="regular" />
          <h3>Shipping</h3>
          <p>
            We ship worldwide. Orders are handcrafted to order, so please allow a few extra days for production
            before your package ships. Shipping costs range from €6.75 to €12.95 depending on your region, and
            orders over €50&ndash;€100 (region-dependent) ship free.
          </p>
        </div>
        <div className="shipping-returns-page__card">
          <ArrowUUpLeft size={28} weight="regular" />
          <h3>Returns</h3>
          <p>
            If something arrives damaged or isn&rsquo;t right, contact us and we&rsquo;ll make it right. Returns are
            accepted within 30 days of delivery.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ShippingReturnsPage;
