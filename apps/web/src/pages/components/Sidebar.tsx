import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { to: '/home', label: 'Trang chủ', icon: '🏠' },
  { to: '/subjects', label: 'Môn học', icon: '📚' },
  { to: '/exams', label: 'Đề thi', icon: '📝' },
  { to: '/history', label: 'Lịch sử', icon: '🕒' },
  { to: '/profile', label: 'Hồ sơ', icon: '👤' },
];

export const Sidebar: React.FC = () => (
  <aside className="sidebar">
    <div className="sidebar-logo">Brain Blitz</div>
    <nav className="sidebar-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => 'sidebar-link' + (isActive ? ' is-active' : '')}
        >
          <span className="sidebar-icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;