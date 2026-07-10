const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const requestLogger = require('./middleware/requestLogger');

// Route imports
const authRoutes = require('./routes/auth.routes');
const pageRoutes = require('./routes/page.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');
const mediaRoutes = require('./routes/media.routes');
const settingsRoutes = require('./routes/settings.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const archiveRoutes = require('./routes/archive.routes');
const contactRoutes = require('./routes/contact.routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL?.split(',') || '*',
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(requestLogger); // structured logs, useful for debugging in Render logs

app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

app.use('/api/auth', authRoutes);
app.use('/api/pages', pageRoutes);       // CMS: page + block structure
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/media', mediaRoutes);       // S3 uploads for admin media library
app.use('/api/settings', settingsRoutes); // global site settings (theme, nav, footer)
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/archive', archiveRoutes);   // Media Gallery: archived legacy naturallyu.nl content
app.use('/api/contact', contactRoutes);   // public contact form submissions

app.use(notFound);
app.use(errorHandler); // must be last

module.exports = app;
