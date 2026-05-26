import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../../services/authAPI';
import useAuth from '../../hooks/useAuth';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName]   = useState(user?.last_name  || '');
  const [saved, setSaved]         = useState(false);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => updateProfile({ first_name: firstName, last_name: lastName }),
    onSuccess: ({ data }) => {
      setUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const fieldStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: '10px 14px',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderTopColor: 'rgba(255,255,255,0.18)',
      borderRadius: 22,
      padding: 24,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
      maxWidth: 440,
    }}>
      <h3 style={{ fontWeight: 600, fontSize: 15, color: 'rgba(255,255,255,0.92)', marginBottom: 20 }}>
        Profile
      </h3>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Email</label>
        <input
          style={{ ...fieldStyle, opacity: 0.5, cursor: 'not-allowed' }}
          value={user?.email || ''}
          readOnly
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>First name</label>
          <input
            style={fieldStyle}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            onFocus={e => { e.target.style.borderColor = 'rgba(0,113,227,0.6)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Last name</label>
          <input
            style={fieldStyle}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            onFocus={e => { e.target.style.borderColor = 'rgba(0,113,227,0.6)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          />
        </div>
      </div>

      <button
        className="btn-primary"
        style={saved ? { background: '#34c759', width: '100%' } : { width: '100%' }}
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {saved ? 'Saved!' : mutation.isPending ? 'Saving…' : 'Save changes'}
      </button>

      {mutation.isError && (
        <p style={{ color: '#ff3b30', fontSize: 12, marginTop: 8 }}>
          {mutation.error?.response?.data?.error || 'Failed to save'}
        </p>
      )}
    </div>
  );
};

export default Profile;
