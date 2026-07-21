import { useEffect, useMemo, useRef, useState } from 'react';
import {
  X, Sliders, Code, FloppyDisk, MagicWand, CheckCircle, WarningCircle,
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { updateBlock } from '../../../api/pages.api';
import VisualBlockEditor from './VisualBlockEditor.jsx';
import { blockIcon, blockLabel, blockSummary } from './blockDisplay';
import './BlockEditorPanel.css';
import { useLang } from '../../../i18n/LanguageContext.jsx';

// Plain-textarea JSON editor with a synced line-number gutter and Tab
// support - enough structure for hand-editing block props without pulling
// a code-editor dependency into the admin bundle.
function JsonEditor({ value, onChange }) {
  const gutterRef = useRef(null);
  const lineCount = value.split('\n').length;

  const handleScroll = (e) => {
    if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop;
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const el = e.target;
    const { selectionStart, selectionEnd } = el;
    onChange(`${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`);
    requestAnimationFrame(() => {
      el.selectionStart = selectionStart + 2;
      el.selectionEnd = selectionStart + 2;
    });
  };

  return (
    <div className="json-editor">
      <div className="json-editor__gutter" ref={gutterRef} aria-hidden="true">
        {Array.from({ length: lineCount }, (_, i) => <span key={i}>{i + 1}</span>)}
      </div>
      <textarea
        className="json-editor__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        wrap="off"
      />
    </div>
  );
}

/**
 * Dual-mode block editor drawer: a generic Visual form (VisualBlockEditor,
 * driven off the block's actual props shape - no per-blockType component
 * needed) plus a raw-JSON Code editor for power users. Both modes share one
 * `props` state object as the single source of truth; switching modes just
 * re-serializes/re-parses between the object and its JSON text.
 */
function BlockEditorPanel({ block, slug, onClose, onSaved }) {
  const { t } = useLang();
  const [mode, setMode] = useState('visual');
  const [props, setProps] = useState(block.props);
  const [json, setJson] = useState(JSON.stringify(block.props, null, 2));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const initialJson = useMemo(() => JSON.stringify(block.props, null, 2), [block.props]);
  const dirty = (mode === 'visual' ? JSON.stringify(props, null, 2) : json) !== initialJson;

  // Live JSON validity for the Code tab's status chip
  const jsonError = useMemo(() => {
    try {
      JSON.parse(json);
      return null;
    } catch (err) {
      return err.message;
    }
  }, [json]);

  const requestClose = () => {
    if (dirty && !window.confirm(t('Discard unsaved changes to this block?'))) return;
    onClose();
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') requestClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, mode, props, json]);

  const switchToVisual = () => {
    try {
      const parsed = JSON.parse(json);
      setProps(parsed);
      setError(null);
      setMode('visual');
    } catch {
      setError(t('Invalid JSON - please fix syntax before switching to Visual mode.'));
    }
  };

  const switchToCode = () => {
    setJson(JSON.stringify(props, null, 2));
    setError(null);
    setMode('code');
  };

  const handleFormat = () => {
    try {
      setJson(JSON.stringify(JSON.parse(json), null, 2));
      setError(null);
    } catch {
      setError(t('Cannot format: the JSON has a syntax error.'));
    }
  };

  const handleSave = async () => {
    let finalProps = props;
    if (mode === 'code') {
      try {
        finalProps = JSON.parse(json);
      } catch {
        setError(t('Invalid JSON - please fix syntax before saving.'));
        return;
      }
    }
    setSaving(true);
    try {
      await updateBlock(slug, block._id, { props: finalProps });
      toast.success(t('Block updated'));
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || t('Failed to save block'));
      setSaving(false);
    }
  };

  const Icon = blockIcon(block.blockType);
  const summary = blockSummary(block);

  return (
    <div className="block-drawer__overlay" onClick={requestClose}>
      <div
        className="block-drawer"
        role="dialog"
        aria-label={`${t('Edit')} ${t(blockLabel(block.blockType))}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="block-drawer__header">
          <span className="block-drawer__header-icon" aria-hidden="true">
            <Icon size={22} weight="regular" />
          </span>
          <div className="block-drawer__header-text">
            <h3>{t(blockLabel(block.blockType))}</h3>
            {summary && <p className="block-drawer__header-summary">{summary}</p>}
          </div>
          <button type="button" className="icon-btn" onClick={requestClose} aria-label={t('Close editor')}>
            <X size={20} />
          </button>
        </div>

        <div className="block-drawer__toolbar">
          <div className="block-drawer__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'visual'}
              className={`block-drawer__tab ${mode === 'visual' ? 'is-active' : ''}`}
              onClick={switchToVisual}
            >
              <Sliders size={15} weight="bold" /> {t('Visual')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'code'}
              className={`block-drawer__tab ${mode === 'code' ? 'is-active' : ''}`}
              onClick={switchToCode}
            >
              <Code size={15} weight="bold" /> {t('Code')}
            </button>
          </div>

          {mode === 'code' && (
            <div className="block-drawer__code-tools">
              <span className={`json-status ${jsonError ? 'json-status--invalid' : 'json-status--valid'}`}>
                {jsonError
                  ? <><WarningCircle size={14} weight="fill" /> {t('Invalid JSON')}</>
                  : <><CheckCircle size={14} weight="fill" /> {t('Valid JSON')}</>}
              </span>
              <button type="button" className="btn btn--sm btn--secondary block-drawer__format-btn" onClick={handleFormat}>
                <MagicWand size={14} weight="bold" /> {t('Format')}
              </button>
            </div>
          )}
        </div>

        <div className={`block-drawer__body ${mode === 'code' ? 'block-drawer__body--code' : ''}`}>
          {mode === 'visual' ? (
            <VisualBlockEditor blockType={block.blockType} value={props} onChange={setProps} />
          ) : (
            <JsonEditor value={json} onChange={setJson} />
          )}
        </div>

        <div className="block-drawer__footer">
          <p className="block-drawer__error">{error || (mode === 'code' && jsonError ? jsonError : '')}</p>
          <button type="button" className="block-drawer__cancel" onClick={requestClose}>Cancel</button>
          <button
            type="button"
            className="btn btn--primary block-drawer__save"
            onClick={handleSave}
            disabled={saving || (mode === 'code' && !!jsonError)}
          >
            <FloppyDisk size={16} weight="bold" />
            {saving ? t('Saving…') : t('Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlockEditorPanel;
