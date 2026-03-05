import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import StudentShell from "../../components/StudentShell";
import { getApiError } from "../../utils/apiError";
import styles from "./StudentMaterials.module.css";

function StudentMaterials() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const backendOrigin = (API.defaults.baseURL || "").replace(/\/api\/?$/, "");
  const materialHref = (fileUrl) => {
    const cleaned = String(fileUrl || "").replace(/\\/g, "/").trim();
    if (!cleaned) return "#";
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
    return `${backendOrigin}/${cleaned.replace(/^\/+/, "")}`;
  };

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const { data } = await API.get("/subjects");
        const filtered = user?.sectionId
          ? data.filter((s) => s.sectionId?._id === user.sectionId)
          : data;
        setSubjects(filtered);
        if (filtered.length) setSubjectId(filtered[0]._id);
      } catch (err) {
        setError(getApiError(err, "Failed to load subjects"));
      } finally {
        setIsLoading(false);
      }
    };
    loadSubjects();
  }, [user]);

  useEffect(() => {
    const loadMaterials = async () => {
      if (!subjectId) return;
      try {
        const { data } = await API.get(`/materials/${subjectId}`);
        setMaterials(data || []);
      } catch (err) {
        setError(getApiError(err, "Failed to load materials"));
      }
    };
    loadMaterials();
  }, [subjectId]);

  return (
    <StudentShell
      pageTitle="Study Materials"
      pageSubtitle="Browse uploaded notes, PDFs and resources by subject"
    >
      {error ? <p className={styles.error}>{error}</p> : null}
      <section className={styles.filterCard}>
        <label className={styles.label}>Subject</label>
        <select className={styles.input} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">Choose subject</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </section>

      <section className={styles.layoutGrid}>
        {isLoading ? <p className={styles.info}>Loading materials...</p> : null}
        {materials.map((m, idx) => (
          <article key={m._id} className={styles.card}>
            <img
              src={`https://images.unsplash.com/photo-${idx % 2 ? "1488190211105-8b0e65b80b4e" : "1454165804606-c3d57bc86b40"}?w=700&auto=format&fit=crop&q=80`}
              alt="Material preview"
              className={styles.cover}
            />
            <h3 className={styles.title}>{m.title}</h3>
            <p className={styles.meta}>{m.fileName}</p>
            <p className={styles.meta}>Uploaded by {m.uploadedBy?.name || "Unknown"}</p>
            <p className={styles.meta}>{new Date(m.createdAt).toLocaleString()}</p>
            <div className={styles.actions}>
              <a
                className={styles.openBtn}
                href={materialHref(m.fileUrl)}
                target="_blank"
                rel="noreferrer"
              >
                Open
              </a>
              <a
                className={styles.downloadBtn}
                href={materialHref(m.fileUrl)}
                download={m.fileName || "material"}
              >
                Download
              </a>
            </div>
          </article>
        ))}
        {!isLoading && !materials.length ? (
          <p className={styles.info}>No materials found for this subject.</p>
        ) : null}
      </section>
    </StudentShell>
  );
}

export default StudentMaterials;
