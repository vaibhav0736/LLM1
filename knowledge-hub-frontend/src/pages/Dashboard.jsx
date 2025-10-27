import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [articles, setArticles] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const fetchArticles = async () => {
    try {
      const res = await api.get("/articles");
      setArticles(res.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  const summarizeArticle = async (id) => {
    try {
      setLoadingId(id);
      const res = await api.post(`/articles/${id}/summarize?provider=openai`);
      const summary = res.data.summary || res.data.article?.summary;

      setArticles((prev) =>
        prev.map((a) => (a._id === id ? { ...a, summary } : a))
      );
    } catch (error) {
      console.error("Error summarizing article:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const deleteArticle = async (id) => {
    try {
      await api.delete(`/articles/${id}`);
      setArticles((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your Articles</h2>
      {articles.map((a) => (
        <div
          key={a._id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "8px",
          }}
        >
          <h3>{a.title}</h3>
          <p>{a.summary || "No summary yet"}</p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => summarizeArticle(a._id)}
              disabled={loadingId === a._id}
            >
              {loadingId === a._id ? "Summarizing..." : "Summarize"}
            </button>
            <button onClick={() => deleteArticle(a._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
