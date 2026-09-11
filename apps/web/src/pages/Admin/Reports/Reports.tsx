import { useEffect, useState } from "react";
import { api } from "@onthitracnghiem/shared";
import { motion } from "framer-motion";
import "./Reports.css";

interface Report {
  id: number;
  target_type: string;
  target_id: number;
  reason: string;
  status: string;
  created_at: string;
  reporter?: {
    full_name: string;
    email: string;
  };
}

export default function Reports() {
  const [reports, setReports] =
    useState<Report[]>([]);

  const [status, setStatus] =
    useState("pending");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadReports();
  }, [status]);

  const loadReports = async () => {
    setLoading(true);

    try {
      const response = await api.get(
        "/admin/reports",
        {
          params: {
            status,
          },
        }
      );

      setReports(
        response.data.data.data ?? []
      );
    } catch (error) {
      console.error(
        "Không thể tải báo cáo:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (
    id: number,
    action: "resolve" | "reject" | "hide"
  ) => {
    try {
      await api.put(
        `/admin/reports/${id}/resolve`,
        {
          action,
        }
      );

      await loadReports();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="reports-page">
      <motion.div
        className="reports-header"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div>
          <h1>Báo cáo vi phạm</h1>
          <p>
            Tiếp nhận và xử lý báo cáo từ người dùng.
          </p>
        </div>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="pending">
            Chờ xử lý
          </option>

          <option value="resolved">
            Đã xử lý
          </option>

          <option value="rejected">
            Từ chối
          </option>
        </select>
      </motion.div>

      <div className="reports-table-wrapper">
        {loading ? (
          <div className="reports-empty">
            Đang tải...
          </div>
        ) : reports.length === 0 ? (
          <div className="reports-empty">
            Không có báo cáo.
          </div>
        ) : (
          <table className="reports-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người báo cáo</th>
                <th>Đối tượng</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>#{report.id}</td>

                  <td>
                    <strong>
                      {report.reporter?.full_name ??
                        "—"}
                    </strong>

                    <small>
                      {report.reporter?.email ??
                        ""}
                    </small>
                  </td>

                  <td>
                    {report.target_type} #
                    {report.target_id}
                  </td>

                  <td>{report.reason}</td>

                  <td>
                    <span
                      className={`report-status report-${report.status}`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td>
                    {report.status ===
                      "pending" && (
                      <div className="report-actions">
                        <button
                          onClick={() =>
                            handleReport(
                              report.id,
                              "resolve"
                            )
                          }
                        >
                          Xác nhận
                        </button>

                        <button
                          onClick={() =>
                            handleReport(
                              report.id,
                              "hide"
                            )
                          }
                        >
                          Ẩn nội dung
                        </button>

                        <button
                          onClick={() =>
                            handleReport(
                              report.id,
                              "reject"
                            )
                          }
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}