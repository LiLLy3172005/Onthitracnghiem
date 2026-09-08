import React from 'react';
import Sidebar from '../components/Sidebar';

export const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="app-shell">
    <Sidebar />
    <main style={{ flex: 1, padding: '80px 40px', textAlign: 'center', color: 'var(--muted)' }}>
      <h2 style={{ fontFamily: 'Fraunces, serif', color: 'var(--ink)' }}>{title}</h2>
      <p>Tính năng này đang được xây dựng, sẽ sớm ra mắt.</p>
    </main>
  </div>
);

export default ComingSoon;