import './ImageGalleryBlock.css';

// Props: { images: [{ url, alt }], variant }
// Responsive image grid for CMS pages. Images are CMS-sourced.
// `variant`:
//   default - plain auto-fit grid
//   story   - elegant collage with hover zoom (home "Our Story")
function ImageGalleryBlock({ images = [], variant = 'default' }) {
  if (images.length === 0) return null;

  return (
    <section className={`image-gallery-block image-gallery-block--${variant}`}>
      {images.map((img, i) => (
        <figure className="image-gallery-block__item" key={img.url || i}>
          <img src={img.url} alt={img.alt || ''} loading="lazy" />
        </figure>
      ))}
    </section>
  );
}

export default ImageGalleryBlock;
