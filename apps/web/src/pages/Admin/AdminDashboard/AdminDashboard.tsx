import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@onthitracnghiem/shared';
import './AdminDashboard.css';

interface DashboardData {
  total_users: number;
  total_exams: number;
  total_attempts: number;
  active_instructors: number;

  pending_questions?: number;
  pending_exams?: number;
  pending_reports?: number;
}

const Dashboard: React.FC = () => {

  const [data, setData] = useState<DashboardData>({
    total_users: 0,
    total_exams: 0,
    total_attempts: 0,
    active_instructors: 0,
    pending_questions: 0,
    pending_exams: 0,
    pending_reports: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/admin/dashboard');

        if (response.data?.success) {
          setData(response.data.data);
        }

      } catch (error) {
        console.error('Không thể tải dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = [
    {
      icon: '🎓',
      value: data.total_users,
      label: 'Học viên',
      description: 'Tổng số tài khoản',
      className: 'gold',
    },
    {
      icon: '📝',
      value: data.total_exams,
      label: 'Đề thi',
      description: 'Đề thi trong hệ thống',
      className: 'blue',
    },
    {
      icon: '⚡',
      value: data.total_attempts,
      label: 'Lượt làm bài',
      description: 'Tổng lượt thi',
      className: 'green',
    },
    {
      icon: '👨‍🏫',
      value: data.active_instructors,
      label: 'Giảng viên',
      description: 'Đang hoạt động',
      className: 'purple',
    },
  ];

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      {/* HEADER */}

      <motion.div
        className="dashboard-heading"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="dashboard-pill">
            <span>●</span>
            ADMIN DASHBOARD
          </div>

          <h1>
            Tổng quan hệ thống
          </h1>

          <p>
            Theo dõi hoạt động và quản lý nền tảng Brain Blitz.
          </p>
        </div>
      </motion.div>


      {/* STATS */}

      <div className="admin-stat-grid">

        {stats.map((stat, index) => (

          <motion.div
            key={stat.label}
            className="admin-stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -4 }}
          >

            <div className={`stat-icon ${stat.className}`}>
              {stat.icon}
            </div>

            <div className="stat-content">

              <span className="stat-label">
                {stat.label}
              </span>

              <strong>
                {stat.value.toLocaleString('vi-VN')}
              </strong>

              <small>
                {stat.description}
              </small>

            </div>

          </motion.div>

        ))}

      </div>


      {/* MAIN GRID */}

      <div className="admin-dashboard-grid">

        {/* ACTIVITY */}

        <motion.div
          className="admin-panel activity-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >

          <div className="panel-header">

            <div>
              <h2>Hoạt động hệ thống</h2>
              <p>Thống kê hoạt động gần đây</p>
            </div>

            <button>
              Xem chi tiết →
            </button>

          </div>

          <div className="fake-chart">

            <div className="chart-y">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            <div className="chart-bars">

              {[45, 62, 48, 78, 66, 88, 72].map(
                (height, index) => (
                  <div
                    className="chart-column"
                    key={index}
                  >
                    <div
                      className="chart-bar"
                      style={{ height: `${height}%` }}
                    />
                    <span>
                      {['T2','T3','T4','T5','T6','T7','CN'][index]}
                    </span>
                  </div>
                )
              )}

            </div>

          </div>

        </motion.div>


        {/* PENDING */}

        <motion.div
          className="admin-panel pending-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >

          <div className="panel-header">
            <div>
              <h2>Cần xử lý</h2>
              <p>Các nội dung đang chờ duyệt</p>
            </div>
          </div>


          <div className="pending-list">

            <div className="pending-item">

              <div className="pending-icon question">
                ?
              </div>

              <div>
                <strong>Câu hỏi</strong>
                <span>Chờ kiểm duyệt</span>
              </div>

              <b>
                {data.pending_questions ?? 0}
              </b>

            </div>


            <div className="pending-item">

              <div className="pending-icon exam">
                □
              </div>

              <div>
                <strong>Đề thi</strong>
                <span>Chờ kiểm duyệt</span>
              </div>

              <b>
                {data.pending_exams ?? 0}
              </b>

            </div>


            <div className="pending-item">

              <div className="pending-icon report">
                !
              </div>

              <div>
                <strong>Báo cáo</strong>
                <span>Chưa xử lý</span>
              </div>

              <b>
                {data.pending_reports ?? 0}
              </b>

            </div>

          </div>

        </motion.div>

      </div>

    </div>
  );
};

export default Dashboard;