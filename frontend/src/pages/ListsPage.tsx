import { useState, useEffect } from 'react';
import { Plus, BookMarked, Trash2, Globe, Users, Lock, X } from 'lucide-react';
import Layout from '../components/Layout';
import { useListsStore, UserList } from '../store/listsStore';

const VISIBILITY_ICONS: Record<string, React.ReactNode> = {
  public:  <><Globe size={12} /> Public</>,
  friends: <><Users size={12} /> Friends</>,
  private: <><Lock size={12} /> Private</>,
};

function CreateListModal({ onClose, onCreate }: { onClose: () => void; onCreate: (title: string, desc: string, vis: string) => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [visibility, setVisibility] = useState('friends');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsLoading(true);
    try { await onCreate(title.trim(), desc.trim(), visibility); onClose(); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '-0.5px' }}>Create New List</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="input" placeholder="e.g. Best Sci-Fi Series" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="input" placeholder="// optional description…" value={desc} onChange={(e) => setDesc(e.target.value)}
              style={{ resize: 'vertical', minHeight: '80px' }} maxLength={1000} />
          </div>

          <div className="form-group">
            <label className="form-label">Visibility</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['public', 'friends', 'private'] as const).map((v) => (
                <button key={v} onClick={() => setVisibility(v)}
                  className={`btn btn-sm ${visibility === v ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textTransform: 'capitalize' }}>
                  {VISIBILITY_ICONS[v]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} className="btn btn-secondary btn-full">Cancel</button>
            <button onClick={handleCreate} className="btn btn-primary btn-full" disabled={!title.trim() || isLoading}>
              {isLoading ? 'Creating…' : 'Create List'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListsPage() {
  const { lists, isLoading, fetchLists, createList, deleteList } = useListsStore();
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchLists(); }, []);

  const handleCreate = async (title: string, desc: string, vis: string) => {
    await createList(title, desc, vis);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this list?')) return;
    setDeleting(id);
    try { await deleteList(id); } finally { setDeleting(null); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Layout>
      <div className="page-content page-enter">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px',
              letterSpacing: '-0.5px',
            }}>
              <BookMarked size={22} style={{
                display: 'inline', verticalAlign: 'middle', marginRight: '8px',
                color: '#FFD60A', filter: 'drop-shadow(0 0 8px rgba(255,214,10,0.4))',
              }} />
              My Lists
            </h1>
            <p style={{ color: '#8888AA', fontSize: '0.85rem' }}>// curate and share your favourite watches</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New List
          </button>
        </div>

        {isLoading ? (
          <div className="grid-2">
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '140px' }} />)}
          </div>
        ) : lists.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No lists yet</div>
              <div className="empty-state-desc">Create your first curated list and share it with friends.</div>
              <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: '8px' }}>
                <Plus size={16} /> Create First List
              </button>
            </div>
          </div>
        ) : (
          <div className="grid-2">
            {lists.map((list: UserList) => (
              <div key={list.id} className="card card-hover" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  <h3 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, letterSpacing: '-0.3px',
                  }}>{list.title}</h3>
                  <button onClick={() => handleDelete(list.id)} className="btn btn-ghost btn-sm"
                    style={{ color: '#FF453A', opacity: 0.7, flexShrink: 0 }} disabled={deleting === list.id}>
                    <Trash2 size={14} />
                  </button>
                </div>

                {list.description && (
                  <p style={{ color: '#8888AA', fontSize: '0.82rem', marginBottom: '12px', lineHeight: 1.6 }}>
                    {list.description}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="badge badge-genre" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {VISIBILITY_ICONS[list.visibility]}
                    </span>
                    {list.item_count !== undefined && (
                      <span style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '0.75rem', color: '#3A3A52',
                      }}>
                        {list.item_count} {Number(list.item_count) === 1 ? 'title' : 'titles'}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.7rem', color: '#3A3A52',
                  }}>
                    {formatDate(list.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateListModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </Layout>
  );
}
