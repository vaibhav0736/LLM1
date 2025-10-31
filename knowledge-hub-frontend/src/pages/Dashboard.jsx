import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const Dashboard = () => {
  const [articles, setArticles] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedContent, setUpdatedContent] = useState("");

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
      const res = await api.post(`/articles/${id}/summarize?provider=gemini`);
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

  
  const openEditModal = (article) => {
    setEditingArticle(article);
    setUpdatedTitle(article.title);
    setUpdatedContent(article.content || "");
  };

  // Save update
  const handleUpdate = async () => {
    if (!editingArticle) return;

    try {
      const res = await api.put(`/articles/${editingArticle._id}`, {
        title: updatedTitle,
        content: updatedContent,
      });

      const updated = res.data;
      setArticles((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a))
      );

      setEditingArticle(null);
    } catch (error) {
      console.error("Error updating article:", error);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your Articles</h2>
      {articles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        articles.map((a) => (
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
              <button onClick={() => openEditModal(a)}>Update</button>
              <button onClick={() => deleteArticle(a._id)}>Delete</button>
            </div>
          </div>
        ))
      )}

      {/* Update Modal */}
      {editingArticle && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>Update Article</h3>
            <label>Title</label>
            <input
              type="text"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
              style={{ width: "100%", marginBottom: "1rem" }}
            />
            <label>Content</label>
            <textarea
              value={updatedContent}
              onChange={(e) => setUpdatedContent(e.target.value)}
              rows="5"
              style={{ width: "100%", marginBottom: "1rem" }}
            />
            <div style={{ display: "flex", gap: "1rem", justifyContent: "end" }}>
              <button onClick={() => setEditingArticle(null)}>Cancel</button>
              <button onClick={handleUpdate}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
