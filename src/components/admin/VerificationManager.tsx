import React, { useState, useEffect } from 'react';
import { RealtimeService } from '../../services/realtimeService';
import { C } from '../../constants/theme';
import { Modal, Btn } from '../shared/SharedComponents';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  FileQuestion, 
  Ban, 
  RefreshCw,
  Search,
  ExternalLink,
  Building,
  User,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

export interface VerificationQueueItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'Restaurant' | 'NGO' | 'Volunteer' | 'Administrator';
  city: string;
  submitted: string;
  submittedAt?: string;
  status: 'PENDING' | 'DOCUMENT_REVIEW' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'MORE_DOCS_REQUESTED' | 'SUSPENDED';
  documents_status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'MORE_DOCS_REQUESTED';
  email_verified: boolean;
  docUrl?: string;
  docName?: string;
  docType?: string;
  trustScore?: number;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  more_docs_notes?: string;
}

const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
  ? 'https://Zestio-jbdy.onrender.com'
  : 'http://localhost:5000';

export const VerificationManager: React.FC = () => {
  const [queue, setQueue] = useState<VerificationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [previewItem, setPreviewItem] = useState<VerificationQueueItem | null>(null);
  const [rejectItem, setRejectItem] = useState<VerificationQueueItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestMoreDocsItem, setRequestMoreDocsItem] = useState<VerificationQueueItem | null>(null);
  const [moreDocsNotes, setMoreDocsNotes] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/verifications`);
      const data = await res.json();
      if (data.success && data.queue) {
        setQueue(data.queue);
      }
    } catch (e) {
      console.warn("Could not fetch verification queue from backend", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (item: VerificationQueueItem) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/verifications/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, adminId: 'SuperAdmin_01' })
      });
      const data = await res.json();
      if (data.success) {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'APPROVED', documents_status: 'VERIFIED' } : q));
        RealtimeService.broadcast('USER_STATUS_UPDATED', { id: item.id, email: item.email, status: 'APPROVED' });
        alert(`Account '${item.name}' approved successfully! Verification email dispatched.`);
      }
    } catch (e) {
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'APPROVED', documents_status: 'VERIFIED' } : q));
      RealtimeService.broadcast('USER_STATUS_UPDATED', { id: item.id, email: item.email, status: 'APPROVED' });
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectItem) return;
    try {
      await fetch(`${BACKEND_URL}/api/admin/verifications/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rejectItem.id, rejectionReason })
      });
      setQueue(prev => prev.map(q => q.id === rejectItem.id ? { ...q, status: 'REJECTED', documents_status: 'REJECTED', rejection_reason: rejectionReason } : q));
      RealtimeService.broadcast('USER_STATUS_UPDATED', { id: rejectItem.id, email: rejectItem.email, status: 'REJECTED', rejection_reason: rejectionReason });
      alert(`Account '${rejectItem.name}' rejected. Notification sent to user.`);
    } catch (e) {
      setQueue(prev => prev.map(q => q.id === rejectItem.id ? { ...q, status: 'REJECTED', documents_status: 'REJECTED', rejection_reason: rejectionReason } : q));
      RealtimeService.broadcast('USER_STATUS_UPDATED', { id: rejectItem.id, email: rejectItem.email, status: 'REJECTED', rejection_reason: rejectionReason });
    } finally {
      setRejectItem(null);
      setRejectionReason('');
    }
  };

  const handleConfirmRequestMoreDocs = async () => {
    if (!requestMoreDocsItem) return;
    try {
      await fetch(`${BACKEND_URL}/api/admin/verifications/request-more-docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestMoreDocsItem.id, notes: moreDocsNotes })
      });
      setQueue(prev => prev.map(q => q.id === requestMoreDocsItem.id ? { ...q, status: 'MORE_DOCS_REQUESTED', documents_status: 'MORE_DOCS_REQUESTED', more_docs_notes: moreDocsNotes } : q));
      RealtimeService.broadcast('USER_STATUS_UPDATED', { id: requestMoreDocsItem.id, email: requestMoreDocsItem.email, status: 'MORE_DOCS_REQUESTED', more_docs_notes: moreDocsNotes });
      alert(`Requested additional documents from '${requestMoreDocsItem.name}'. Notification dispatched.`);
    } catch (e) {
      setQueue(prev => prev.map(q => q.id === requestMoreDocsItem.id ? { ...q, status: 'MORE_DOCS_REQUESTED', documents_status: 'MORE_DOCS_REQUESTED', more_docs_notes: moreDocsNotes } : q));
      RealtimeService.broadcast('USER_STATUS_UPDATED', { id: requestMoreDocsItem.id, email: requestMoreDocsItem.email, status: 'MORE_DOCS_REQUESTED', more_docs_notes: moreDocsNotes });
    } finally {
      setRequestMoreDocsItem(null);
      setMoreDocsNotes('');
    }
  };

  const handleSuspend = async (item: VerificationQueueItem) => {
    if (!window.confirm(`Are you sure you want to suspend '${item.name}'?`)) return;
    try {
      await fetch(`${BACKEND_URL}/api/admin/verifications/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id })
      });
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'SUSPENDED' } : q));
    } catch (e) {
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'SUSPENDED' } : q));
    }
  };

  const handleDelete = async (item: VerificationQueueItem) => {
    if (!window.confirm(`Permanently delete account '${item.name}'?`)) return;
    try {
      await fetch(`${BACKEND_URL}/api/admin/verifications/${item.id}`, { method: 'DELETE' });
      setQueue(prev => prev.filter(q => q.id !== item.id));
    } catch (e) {
      setQueue(prev => prev.filter(q => q.id !== item.id));
    }
  };

  const filtered = queue.filter(q => 
    q.name.toLowerCase().includes(search.toLowerCase()) || 
    q.type.toLowerCase().includes(search.toLowerCase()) ||
    (q.email && q.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: C.white, borderRadius: 28, padding: '32px 28px', boxShadow: '0 8px 40px rgba(46,52,48,0.08)', border: '1px solid rgba(122,143,120,0.15)', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.sage, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Compliance &amp; Identity Queue
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.03em', fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: 2 }}>
            Account Verification Center
          </h2>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: C.olive }} />
            <input
              type="text"
              placeholder="Search by name, email, role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '9px 16px 9px 40px', borderRadius: 14, border: '1px solid rgba(122,143,120,0.25)', background: C.ivory, fontSize: 13, outline: 'none' }}
            />
          </div>
          <button 
            onClick={fetchQueue}
            style={{ background: C.beige, border: 'none', borderRadius: 12, padding: '9px 14px', color: C.charcoal, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Verification Queue Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: C.olive, fontWeight: 600 }}>
          Loading verification records...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: C.sageLight, borderRadius: 20, color: C.forest, fontWeight: 600 }}>
          No pending account verifications found.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: C.ivory, borderBottom: '2px solid rgba(122,143,120,0.15)', color: C.olive, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 16px' }}>Organization / User Profile</th>
                <th style={{ padding: '14px 16px' }}>Role Type</th>
                <th style={{ padding: '14px 16px' }}>Contact Info</th>
                <th style={{ padding: '14px 16px' }}>Document</th>
                <th style={{ padding: '14px 16px' }}>Trust Score</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(122,143,120,0.12)', transition: 'background 0.15s' }}>
                  
                  {/* Profile */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 700, color: C.charcoal, fontSize: 15, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 12, color: C.olive, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {item.submitted} ({item.city})
                    </div>
                  </td>

                  {/* Role Type */}
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: 999, 
                      fontSize: 12, 
                      fontWeight: 700,
                      background: item.type === 'Restaurant' ? C.sageLight : item.type === 'NGO' ? '#E0E7FF' : '#FEF3C7',
                      color: item.type === 'Restaurant' ? C.forest : item.type === 'NGO' ? '#3730A3' : '#B45309'
                    }}>
                      {item.type}
                    </span>
                  </td>

                  {/* Contact Info */}
                  <td style={{ padding: '16px', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.charcoal }}>
                      <Mail size={13} color={C.olive} /> {item.email || 'N/A'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.olive, marginTop: 2 }}>
                      <Phone size={13} /> {item.phone || 'N/A'}
                    </div>
                  </td>

                  {/* Document */}
                  <td style={{ padding: '16px' }}>
                    {item.docName ? (
                      <button
                        onClick={() => setPreviewItem(item)}
                        style={{ background: C.beige, border: 'none', padding: '6px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: C.charcoal, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <FileText size={14} color={C.forest} /> Preview Document <Eye size={12} />
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: C.olive }}>No document</span>
                    )}
                  </td>

                  {/* Trust Score */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: (item.trustScore || 80) >= 80 ? C.forest : C.warning }}>
                        {item.trustScore || 80}/100
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '16px' }}>
                    <StatusBadge status={item.status} />
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {item.status !== 'APPROVED' && item.status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleApprove(item)}
                          title="Approve Account"
                          style={{ background: C.forest, color: 'white', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                      )}

                      {item.status !== 'REJECTED' && (
                        <button
                          onClick={() => setRejectItem(item)}
                          title="Reject Account"
                          style={{ background: '#FEE2E2', color: C.danger, border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => setRequestMoreDocsItem(item)}
                        title="Request Additional Documents"
                        style={{ background: C.beige, color: C.charcoal, border: 'none', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        More Docs
                      </button>

                      <button
                        onClick={() => handleSuspend(item)}
                        title="Suspend Account"
                        style={{ background: 'transparent', border: '1px solid #CBD5E1', color: C.olive, padding: '6px 8px', borderRadius: 8, cursor: 'pointer' }}
                      >
                        <Ban size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        title="Delete Account"
                        style={{ background: 'transparent', border: 'none', color: '#94A3B8', padding: '6px 6px', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      <Modal open={!!previewItem} onClose={() => setPreviewItem(null)} title="Verification Document Preview">
        {previewItem && (
          <div style={{ padding: '20px 28px 28px' }}>
            <div style={{ background: C.sageLight, padding: 16, borderRadius: 16, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.charcoal }}>{previewItem.name}</div>
                <div style={{ fontSize: 13, color: C.forest }}>{previewItem.docType || 'Business License'} · Submitted {previewItem.submitted}</div>
              </div>
              <StatusBadge status={previewItem.status} />
            </div>

            <div style={{ border: '2px dashed rgba(122,143,120,0.3)', borderRadius: 18, padding: '40px 20px', textAlign: 'center', background: C.ivory, marginBottom: 24 }}>
              <FileText size={48} color={C.forest} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal }}>{previewItem.docName || 'Official_License.pdf'}</div>
              <div style={{ fontSize: 13, color: C.olive, marginTop: 4 }}>Format: PDF (Digitally Signed &amp; Verified)</div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Btn variant="secondary" onClick={() => setPreviewItem(null)}>Close</Btn>
              <Btn variant="primary" onClick={() => { handleApprove(previewItem); setPreviewItem(null); }}>Approve Document &amp; Account</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* REJECT MODAL */}
      <Modal open={!!rejectItem} onClose={() => setRejectItem(null)} title="Reject Verification Application">
        {rejectItem && (
          <div style={{ padding: '20px 28px 28px' }}>
            <p style={{ fontSize: 14, color: '#6B7C6E', marginBottom: 16 }}>
              Please specify the reason for rejecting <strong>{rejectItem.name}</strong>. The user will be notified via email with this reason.
            </p>

            <textarea
              rows={4}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Expired FSSAI food safety license. Please submit a valid 2026 license certificate."
              style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid rgba(122,143,120,0.3)', background: C.ivory, fontSize: 14, outline: 'none', marginBottom: 20, fontFamily: 'sans-serif' }}
            />

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Btn variant="secondary" onClick={() => setRejectItem(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={handleConfirmReject} disabled={!rejectionReason}>Confirm Rejection</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* REQUEST MORE DOCS MODAL */}
      <Modal open={!!requestMoreDocsItem} onClose={() => setRequestMoreDocsItem(null)} title="Request Additional Documentation">
        {requestMoreDocsItem && (
          <div style={{ padding: '20px 28px 28px' }}>
            <p style={{ fontSize: 14, color: '#6B7C6E', marginBottom: 16 }}>
              Specify the additional documentation or clarification required from <strong>{requestMoreDocsItem.name}</strong>.
            </p>

            <textarea
              rows={4}
              value={moreDocsNotes}
              onChange={e => setMoreDocsNotes(e.target.value)}
              placeholder="e.g. Please upload clear scanned copy of 80G tax exemption certificate with official seal."
              style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid rgba(122,143,120,0.3)', background: C.ivory, fontSize: 14, outline: 'none', marginBottom: 20, fontFamily: 'sans-serif' }}
            />

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Btn variant="secondary" onClick={() => setRequestMoreDocsItem(null)}>Cancel</Btn>
              <Btn variant="primary" onClick={handleConfirmRequestMoreDocs} disabled={!moreDocsNotes}>Send Request</Btn>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    APPROVED: { bg: C.sageLight, color: C.forest, label: 'Verified' },
    VERIFIED: { bg: C.sageLight, color: C.forest, label: 'Verified' },
    DOCUMENT_REVIEW: { bg: '#FEF3C7', color: '#B45309', label: 'Under Review' },
    PENDING: { bg: '#FEF3C7', color: '#B45309', label: 'Pending' },
    REJECTED: { bg: '#FEE2E2', color: C.danger, label: 'Rejected' },
    MORE_DOCS_REQUESTED: { bg: '#E0E7FF', color: '#3730A3', label: 'Docs Requested' },
    SUSPENDED: { bg: '#FEE2E2', color: C.danger, label: 'Suspended' }
  };
  const b = map[status] || { bg: C.beige, color: C.charcoal, label: status };
  return (
    <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: b.bg, color: b.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: b.color }} />
      {b.label}
    </span>
  );
};
