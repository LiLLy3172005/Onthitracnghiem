import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@onthitracnghiem/shared";
import "./ContentModeration.css";

type ContentType = "questions" | "exams";

interface ContentItem {
  id: number;
  title?: string;
  content?: string;
  code?: string;
  status: string;
  created_at: string;
  subject?: {
    id: number;
    name: string;
  };
  creator?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export default function ContentModeration() {
  const [type, setType] =
    useState<ContentType>("questions");

  const [status, setStatus] =
    useState("pending");

  const [search, setSearch] =
    useState("");

  const [items, setItems] =
    useState<ContentItem[]>([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    loadContents();
  }, [type, status]);

  const loadContents = async () => {
    setLoading(true);

    try {
      const response = await api.get(
        `/admin/${type}`,
        {
          params: {
            status,
            search: search || undefined,
          },
        }
      );

      setItems(
        response.data.data.data ?? []
      );
    } catch (error) {
      console.error(
        "Không thể tải nội dung:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    loadContents();
  };

  const approve = async (id: number) => {
    try {
      await api.put(
        `/admin/${type}/${id}/approve`
      );

      await loadContents();
    } catch (error) {
      console.error(error);
    }
  };

  const reject = async (id: number) => {
    try {
      await api.put(
        `/admin/${type}/${id}/reject`
      );

      await loadContents();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="content-moderation">
      <motion.div
        className="content-header"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <h1>Kiểm duyệt nội dung</h1>

        <p>
          Kiểm tra và xử lý câu hỏi, đề thi
          trước khi được công khai.
        </p>
      </motion.div>

      <div className="content-type-tabs">
        <button
          className={
            type === "questions"
              ? "active"
              : ""
          }
          onClick={() =>
            setType("questions")
          }
        >
          Câu hỏi
        </button>

        <button
          className={
            type === "exams"
              ? "active"
              : ""
          }
          onClick={() =>
            setType("exams")
          }
        >
          Đề thi
        </button>
      </div>

      <div className="content-toolbar">
        <form
          onSubmit={handleSearch}
          className="content-search"
        >
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder={
              type === "questions"
                ? "Tìm câu hỏi..."
                : "Tìm đề thi..."
            }
          />

          <button type="submit">
            Tìm kiếm
          </button>
        </form>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="pending">
            Chờ duyệt
          </option>

          <option value="approved">
            Đã duyệt
          </option>

          <option value="rejected">
            Từ chối
          </option>

          {type === "exams" && (
            <option value="hidden">
              Đã ẩn
            </option>
          )}
        </select>
      </div>

      <div className="content-table-wrapper">
        {loading ? (
          <div className="content-loading">
            Đang tải dữ liệu...
          </div>
        ) : items.length === 0 ? (
          <div className="content-empty">
            Không có dữ liệu.
          </div>
        ) : (
          <table className="content-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nội dung</th>
                <th>Môn học</th>
                <th>Người tạo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>

                  <td>
                    <div className="content-title">
                      {type === "questions"
                        ? item.content
                        : item.title}
                    </div>

                    {item.code && (
                      <small>
                        Mã: {item.code}
                      </small>
                    )}
                  </td>

                  <td>
                    {item.subject?.name ?? "—"}
                  </td>

                  <td>
                    {item.creator?.full_name ??
                      "—"}
                  </td>

                  <td>
                    <span
                      className={`status status-${item.status}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <div className="content-actions">
                      {item.status ===
                        "pending" && (
                        <>
                          <button
                            className="btn-approve"
                            onClick={() =>
                              approve(item.id)
                            }
                          >
                            Duyệt
                          </button>

                          <button
                            className="btn-reject"
                            onClick={() =>
                              reject(item.id)
                            }
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}