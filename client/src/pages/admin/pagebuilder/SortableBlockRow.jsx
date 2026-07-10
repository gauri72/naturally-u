import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical, Eye, EyeSlash, PencilSimple, Trash } from '@phosphor-icons/react';
import { blockMeta } from '../../../blocks/registry/blockRegistry';
import './SortableBlockRow.css';

function SortableBlockRow({ block, onToggleVisibility, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const meta = blockMeta[block.blockType];

  return (
    <div ref={setNodeRef} style={style} className={`block-row ${!block.visible ? 'block-row--hidden' : ''}`}>
      <span className="block-row__handle icon-btn" {...attributes} {...listeners} title="Drag to reorder">
        <DotsSixVertical size={18} weight="bold" />
      </span>
      <span className="block-row__label">{meta?.label || block.blockType}</span>
      <div className="block-row__actions">
        <button className="icon-btn" onClick={onToggleVisibility} title={block.visible ? 'Hide section' : 'Show section'}>
          {block.visible ? <Eye size={18} /> : <EyeSlash size={18} />}
        </button>
        <button className="icon-btn" onClick={onEdit} title="Edit content">
          <PencilSimple size={18} />
        </button>
        <button className="icon-btn icon-btn--danger" onClick={onDelete} title="Delete section">
          <Trash size={18} />
        </button>
      </div>
    </div>
  );
}

export default SortableBlockRow;
