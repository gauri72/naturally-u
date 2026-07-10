import { Link } from 'react-router-dom';
import { Leaf } from '@phosphor-icons/react';
import './NotFoundPage.css';

function NotFoundPage() {
  return (
    <section className="not-found-page">
      <Leaf size={48} weight="regular" />
      <h1>404</h1>
      <p>We couldn't find the page you're looking for.</p>
      <div className="not-found-page__actions">
        <Link to="/" className="btn btn--primary">Go Home</Link>
        <Link to="/shop" className="btn btn--secondary">Shop All Products</Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
