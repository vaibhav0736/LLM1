import { useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const ArticleForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/articles", { title, content });
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to create article: " + err.response?.data?.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Add New Article</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: "block", marginBottom: "1rem", width: "100%" }}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ display: "block", marginBottom: "1rem", width: "100%", minHeight: "200px" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Create
        </button>
      </form>
    </div>
  );
};

export default ArticleForm;
