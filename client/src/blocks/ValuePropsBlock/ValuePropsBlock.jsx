import { Plant, HandHeart, SealCheck, Globe } from '@phosphor-icons/react';
import './ValuePropsBlock.css';

const iconProps = { size: 56, weight: 'regular' };
const icons = [
  (props) => <Plant {...iconProps} {...props} />,
  (props) => <HandHeart {...iconProps} {...props} />,
  (props) => <SealCheck {...iconProps} {...props} />,
  (props) => <Globe {...iconProps} {...props} />,
];

// Props: { items: [{ title, subtitle }] }
// Icons are fixed brand creative (matching FeatureStripBlock's approach),
// mapped by position rather than sourced from CMS data.
function ValuePropsBlock({ items = [] }) {
  return (
    <section className="value-props-block">
      {items.map((item, i) => {
        const Icon = icons[i % icons.length];
        return (
          <div className="value-props-block__item" key={item.title}>
            <span className="value-props-block__icon">
              <Icon />
            </span>
            <div className="value-props-block__text">
              <h4>{item.title}</h4>
              <p>{item.subtitle}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default ValuePropsBlock;
