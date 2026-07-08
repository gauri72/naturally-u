import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section style={{ textAlign: 'center', padding: '4rem' }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/">Back to home</Link>
    </section>
  );
}

export default NotFoundPage;
