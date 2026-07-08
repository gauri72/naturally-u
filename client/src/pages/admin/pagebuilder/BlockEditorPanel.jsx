import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateBlock } from '../../../api/pages.api';
import './BlockEditorPanel.css';

/**
 * V1 block editor: edits `props` as raw JSON in a textarea.
 * This is intentionally generic so every block type "just works"
 * without a matching form. It is NOT the ideal long-term editing UX.
 *
 * UPGRADE PATH: once specific blocks stabilize, replace this with
 * per-blockType form components (e.g. HeroBlockEditor.jsx with proper
 * text inputs + image picker) registered in a small
 * `blockEditorRegistry` alongside client/src/blocks/registry. Swap
 * this component's body to look up that registry first and fall back
 * to the JSON editor for any block type that doesn't have one yet.
 */
function BlockEditorPanel({ block, slug, onClose, onSaved }) {
  const [json, setJson] = useState(JSON.stringify(block.props, null, 2));
  const [error, setError] = useState(null);

  const handleSave = async () => {
    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError('Invalid JSON - please fix syntax before saving.');
      return;
    }
    try {
      await updateBlock(slug, block._id, { props: parsed });
      toast.success('Block updated');
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save block');
    }
  };

  return (
    <div className="block-editor-panel__overlay">
      <div className="block-editor-panel">
        <h3>Edit: {block.blockType}</h3>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={16}
          spellCheck={false}
        />
        {error && <p className="block-editor-panel__error">{error}</p>}
        <div className="block-editor-panel__actions">
          <button onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default BlockEditorPanel;
