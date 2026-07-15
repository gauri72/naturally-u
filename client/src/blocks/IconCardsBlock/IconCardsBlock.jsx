import { HandHeart, Leaf, Sparkle, UsersThree, Cake, Truck, ArrowUUpLeft } from '@phosphor-icons/react';
import '../../pages/storefront/AboutMakerPage.css';
import '../../pages/storefront/WorkshopsPage.css';
import '../../pages/storefront/ShippingReturnsPage.css';

const ICONS = {
  handheart: HandHeart,
  leaf: Leaf,
  sparkle: Sparkle,
  usersthree: UsersThree,
  cake: Cake,
  truck: Truck,
  arrowuupleft: ArrowUUpLeft,
};

const VARIANTS = {
  'about-values': { wrap: 'about-maker__values', card: 'about-maker__value', size: 32 },
  workshops: { wrap: 'workshops-page__grid', card: 'workshops-page__card', size: 32 },
  'shipping-returns': { wrap: 'shipping-returns-page__grid', card: 'shipping-returns-page__card', size: 28 },
};

// Props: { variant('about-values'|'workshops'|'shipping-returns'), items: [{icon, title, text}] }
// Icon+title+text card grid, reused for the About page's "values" grid,
// Workshops' 3-card grid, and Shipping & Returns' 2-card grid.
function IconCardsBlock({ variant = 'workshops', items = [] }) {
  const { wrap, card, size } = VARIANTS[variant] || VARIANTS.workshops;
  return (
    <div className={wrap}>
      {items.map((item, i) => {
        const Icon = ICONS[item.icon] || HandHeart;
        return (
          <div className={card} key={item.title || i}>
            <Icon size={size} weight="regular" />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        );
      })}
    </div>
  );
}

export default IconCardsBlock;
