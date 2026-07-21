import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical, Eye, EyeSlash, PencilSimple, Trash } from '@phosphor-icons/react';
import { blockIcon, blockLabel, blockSummary } from './blockDisplay';
import './SortableBlockRow.css';
import { useLang } from '../../../i18n/LanguageContext.jsx';

function SortableBlockRow({ block, onToggleVisibility, onEdit, onDelete }) {
  const { t } = useLang();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = blockIcon(block.blockType);
  const summary = blockSummary(block);

  return (
    <div ref={setNodeRef} style={style} className={`block-row ${!block.visible ? 'block-row--hidden' : ''}`}>
      <span className="block-row__handle icon-btn" {...attributes} {...listeners} title={t('Drag to reorder')}>
        <DotsSixVertical size={18} weight="bold" />
      </span>
      <span className="block-row__icon" aria-hidden="true">
        <Icon size={20} weight="regular" />
      </span>
      <div className="block-row__text">
        <div className="block-row__title-line">
          <span className="block-row__label">{t(blockLabel(block.blockType))}</span>
          <code className="block-row__chip">{block.blockType}</code>
          {block.props?.variant && block.props.variant !== 'default' && block.props.variant !== 'plain' && (
            <code className="block-row__chip block-row__chip--variant">{block.props.variant}</code>
          )}
          {!block.visible && <span className="block-row__hidden-chip">{t('Hidden')}</span>}
        </div>
        {summary && <p className="block-row__summary">{summary}</p>}
      </div>
      <div className="block-row__actions">
        <button className="icon-btn" onClick={onToggleVisibility} title={block.visible ? t('Hide section') : t('Show section')}>
          {block.visible ? <Eye size={18} /> : <EyeSlash size={18} />}
        </button>
        <button className="icon-btn" onClick={onEdit} title={t('Edit content')}>
          <PencilSimple size={18} />
        </button>
        <button className="icon-btn icon-btn--danger" onClick={onDelete} title={t('Delete section')}>
          <Trash size={18} />
        </button>
      </div>
    </div>
  );
}

export default SortableBlockRow;
