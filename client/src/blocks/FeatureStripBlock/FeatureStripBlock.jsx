import { ShieldCheck, Gift, Recycle, Butterfly } from '@phosphor-icons/react';
import './FeatureStripBlock.css';

const iconProps = { size: 40, weight: 'regular' };
const icons = [
  (props) => <ShieldCheck {...iconProps} {...props} />,
  (props) => <Gift {...iconProps} {...props} />,
  (props) => <Recycle {...iconProps} {...props} />,
  (props) => <Butterfly {...iconProps} {...props} />,
];

// Props: { items: [{ title, subtitle }] }
// Icons are fixed brand creative (matching HeroBlock's badge icons),
// mapped by position rather than sourced from CMS data.
function FeatureStripBlock({ items = [] }) {
  return (
    <section className="feature-strip">
      <div className="feature-strip__inner">
        {items.map((item, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div className="feature-strip__item" key={item.title}>
              <span className="feature-strip__icon">
                <Icon />
              </span>
              <div className="feature-strip__text">
                <h4>{item.title}</h4>
                <p>{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FeatureStripBlock;
