import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosInstance";

const ArticleView = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  const fetchArticle = async () => {
    try {
      const res = await api.get(`/articles/${id}`);
      setArticle(res.data);
    } catch (err) {
      console.error("Error fetching article:", err);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  if (!article) return <div style={{ padding: "2rem" }}>Loading...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{article.title}</h2>
      <p style={{ whiteSpace: "pre-line" }}>{article.content}</p>
      <h4>Summary:</h4>
      <p>{article.summary || "Not summarized yet"}</p>
    </div>
  );
};

export default ArticleView;
