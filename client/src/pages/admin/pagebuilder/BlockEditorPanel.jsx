import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateBlock } from '../../../api/pages.api';
import VisualBlockEditor from './VisualBlockEditor.jsx';
import './BlockEditorPanel.css';

/**
 * Dual-mode block editor: a generic Visual form (VisualBlockEditor.jsx,
 * driven off the block's actual props shape - no per-blockType component
 * needed) plus the original raw-JSON Code editor, kept as an alternate
 * mode for power users. Both modes share one `props` state object as the
 * single source of truth; switching modes just re-serializes/re-parses
 * between the object and its JSON text.
 */
function BlockEditorPanel({ block, slug, onClose, onSaved }) {
  const [mode, setMode] = useState('visual');
  const [props, setProps] = useState(block.props);
  const [json, setJson] = useState(JSON.stringify(block.props, null, 2));
  const [error, setError] = useState(null);

  const switchToVisual = () => {
    try {
      const parsed = JSON.parse(json);
      setProps(parsed);
      setError(null);
      setMode('visual');
    } catch {
      setError('Invalid JSON - please fix syntax before switching to Visual mode.');
    }
  };

  const switchToCode = () => {
    setJson(JSON.stringify(props, null, 2));
    setError(null);
    setMode('code');
  };

  const handleSave = async () => {
    let finalProps = props;
    if (mode === 'code') {
      try {
        finalProps = JSON.parse(json);
      } catch {
        setError('Invalid JSON - please fix syntax before saving.');
        return;
      }
    }
    try {
      await updateBlock(slug, block._id, { props: finalProps });
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

        <div className="block-editor-panel__tabs">
          <button
            type="button"
            className={`block-editor-panel__tab ${mode === 'visual' ? 'is-active' : ''}`}
            onClick={switchToVisual}
          >
            Visual
          </button>
          <button
            type="button"
            className={`block-editor-panel__tab ${mode === 'code' ? 'is-active' : ''}`}
            onClick={switchToCode}
          >
            Code
          </button>
        </div>

        <div className="block-editor-panel__body">
          {mode === 'visual' ? (
            <VisualBlockEditor blockType={block.blockType} value={props} onChange={setProps} />
          ) : (
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              rows={16}
              spellCheck={false}
            />
          )}
        </div>

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
