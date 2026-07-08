import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import toast from 'react-hot-toast';
import {
  getPageForAdmin, reorderBlocks, updateBlock, deleteBlock, addBlock, setPageStatus,
} from '../../../api/pages.api';
import { blockMeta } from '../../../blocks/registry/blockRegistry';
import SortableBlockRow from './SortableBlockRow.jsx';
import BlockEditorPanel from './BlockEditorPanel.jsx';
import './PageBuilderPage.css';

/**
 * Admin Page Builder
 * ------------------
 * Loads a Page's blocks, lets the admin:
 *   - drag-reorder blocks (persists via PUT /pages/:slug/reorder)
 *   - toggle visibility per block
 *   - edit a block's props (opens BlockEditorPanel)
 *   - add a new block from the registry
 *   - delete a block
 *   - publish/unpublish the page
 *
 * This is the UI surface that satisfies "move sections around and
 * edit via admin panel."
 */
function PageBuilderPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const loadPage = () => {
    getPageForAdmin(slug).then((res) => setPage(res.data)).catch(() => toast.error('Failed to load page'));
  };

  useEffect(loadPage, [slug]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = page.blocks.findIndex((b) => b._id === active.id);
    const newIndex = page.blocks.findIndex((b) => b._id === over.id);
    const newBlocks = arrayMove(page.blocks, oldIndex, newIndex);

    setPage({ ...page, blocks: newBlocks }); // optimistic update

    try {
      await reorderBlocks(slug, newBlocks.map((b) => b._id));
    } catch {
      toast.error('Failed to save new order');
      loadPage(); // revert on failure
    }
  };

  const handleToggleVisibility = async (block) => {
    try {
      await updateBlock(slug, block._id, { visible: !block.visible });
      loadPage();
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  const handleDelete = async (block) => {
    if (!window.confirm(`Delete "${blockMeta[block.blockType]?.label || block.blockType}" block?`)) return;
    try {
      await deleteBlock(slug, block._id);
      loadPage();
    } catch {
      toast.error('Failed to delete block');
    }
  };

  const handleAddBlock = async (blockType) => {
    try {
      await addBlock(slug, { blockType, props: blockMeta[blockType].defaultProps });
      loadPage();
    } catch {
      toast.error('Failed to add block');
    }
  };

  const handlePublishToggle = async () => {
    const nextStatus = page.status === 'published' ? 'draft' : 'published';
    try {
      await setPageStatus(slug, nextStatus);
      toast.success(`Page ${nextStatus}`);
      loadPage();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (!page) return <p>Loading…</p>;

  return (
    <div className="page-builder">
      <div className="page-builder__header">
        <h2>{page.title} <span className={`status-pill status-pill--${page.status}`}>{page.status}</span></h2>
        <div className="page-builder__actions">
          <select onChange={(e) => e.target.value && handleAddBlock(e.target.value)} value="">
            <option value="">+ Add Block</option>
            {Object.entries(blockMeta).map(([type, meta]) => (
              <option key={type} value={type}>{meta.label}</option>
            ))}
          </select>
          <button className="btn btn--primary" onClick={handlePublishToggle}>
            {page.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={page.blocks.map((b) => b._id)} strategy={verticalListSortingStrategy}>
          <div className="page-builder__list">
            {page.blocks.map((block) => (
              <SortableBlockRow
                key={block._id}
                block={block}
                onToggleVisibility={() => handleToggleVisibility(block)}
                onEdit={() => setEditingBlock(block)}
                onDelete={() => handleDelete(block)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editingBlock && (
        <BlockEditorPanel
          block={editingBlock}
          slug={slug}
          onClose={() => setEditingBlock(null)}
          onSaved={() => { setEditingBlock(null); loadPage(); }}
        />
      )}
    </div>
  );
}

export default PageBuilderPage;
