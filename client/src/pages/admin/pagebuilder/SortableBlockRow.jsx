import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
      <span className="block-row__handle" {...attributes} {...listeners} title="Drag to reorder">⠿</span>
      <span className="block-row__label">{meta?.label || block.blockType}</span>
      <div className="block-row__actions">
        <button onClick={onToggleVisibility} title={block.visible ? 'Hide section' : 'Show section'}>
          {block.visible ? '👁' : '🚫'}
        </button>
        <button onClick={onEdit} title="Edit content">✏️</button>
        <button onClick={onDelete} title="Delete section">🗑</button>
      </div>
    </div>
  );
}

export default SortableBlockRow;
