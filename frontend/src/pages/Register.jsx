// src/pages/Register.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import { useToast } from '../components/Toast.jsx';
import * as api from '../api.js';
import "./Register.css"
const logo = '/mnt/data/0e9c1eb7-05b1-4d2e-908a-3088e066d1fb.png';

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: 'Too short' };
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  const labels = ['Very weak', 'Weak', 'Okay', 'Good', 'Strong'];
  return { score, label: labels[Math.min(score, labels.length - 1)] };
}

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const { doRegister } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailAvailable, setEmailAvailable] = useState(null); // null = unknown, true/false
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  // password strength memo
  const strength = useMemo(() => passwordStrength(password), [password]);

  // debounce email availability check
  useEffect(() => {
    if (!email || email.length < 4 || !email.includes('@')) {
      setEmailAvailable(null);
      return;
    }
    let mounted = true;
    setCheckingEmail(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkEmailAvailability(email.trim());
        if (!mounted) return;
        setEmailAvailable(!!res.available);
      } catch (e) {
        if (!mounted) return;
        setEmailAvailable(null);
      } finally {
        if (mounted) setCheckingEmail(false);
      }
    }, 600);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [email]);

  // validations
  const emailValid = email && email.includes('@') && email.includes('.');
  const passwordValid = password && password.length >= 8;
  const confirmMatch = password === confirm;
  const canSubmit = name.trim() && emailValid && passwordValid && confirmMatch && (emailAvailable !== false);

  async function onSubmit(e) {
    e.preventDefault();
    setMessage('');
    if (!canSubmit) {
      setMessage('Please fix the errors before submitting');
      return;
    }
    setBusy(true);
    try {
      await doRegister(name.trim(), email.trim(), password);
      toast.push('Registered successfully. Please log in.', { type: 'success' });
      navigate('/login', { state: { info: 'Registration successful! Please log in.' } });
    } catch (err) {
      const msg = err?.message || 'Registration failed';
      toast.push(msg, { type: 'error' });
      setMessage(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-container">
      <img id="app-logo" alt="Mabel logo" src={logo} />
      <div className="auth-card">
        <h2>Create account</h2>

        <form onSubmit={onSubmit} noValidate>
          <label>
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label>
            Email
            <input
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailAvailable(null); }}
              type="email"
              required
            />
            <div className="small">
              {checkingEmail && <span>Checking email…</span>}
              {!checkingEmail && email && emailAvailable === true && <span style={{ color: 'green' }}>Email available</span>}
              {!checkingEmail && email && emailAvailable === false && <span style={{ color: 'crimson' }}>Email already registered</span>}
            </div>
          </label>

          <label>
            Password (min 8)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <div className="pw-meter">
              <div className={`meter meter-${strength.score}`} style={{ width: `${(strength.score/4)*100}%` }} />
              <div className="small">Strength: {strength.label}</div>
            </div>
          </label>

          <label>
            Confirm password
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {!confirmMatch && confirm.length > 0 && <div className="small" style={{ color: 'crimson' }}>Passwords do not match</div>}
          </label>

          <div className="form-row">
            <button type="submit" disabled={busy || !canSubmit}>
              {busy ? 'Creating...' : 'Register'}
            </button>
          </div>
        </form>

        {message && <div className="message" style={{ color: 'crimson' }}>{message}</div>}

        <p className="small">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
