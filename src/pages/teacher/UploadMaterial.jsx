import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import TeacherShell from "../../components/TeacherShell";
import { getApiError } from "../../utils/apiError";
import styles from "./UploadMaterial.module.css";

function UploadMaterial() {
  // 1) State initialization for subject data, form values, upload file and async statuses.
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    subjectId: "",
  });
  const [file, setFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    // 2) useEffect mount fetch:
    // API mapping:
    // GET /subjects -> filter for logged-in teacher to populate dropdown.
    const fetchSubjects = async () => {
      try {
        const { data } = await API.get("/subjects");
        const filtered = user?._id
          ? data.filter((subject) => subject.teacherId?._id === user._id)
          : data;
        setSubjects(filtered);
      } catch (err) {
        setError(getApiError(err, "Failed to load subjects"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, [user]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0] || null;
    setFile(droppedFile);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsUploading(true);

    try {
      const selectedSubject = subjects.find((subject) => subject._id === form.subjectId);
      if (!selectedSubject) {
        throw new Error("Choose a valid subject before upload.");
      }
      if (!file) {
        throw new Error("Select a file from drag-and-drop zone.");
      }

      // 3) API submit mapping:
      // POST /materials/upload
      // 4) FormData payload structure:
      // title: string
      // subjectId: string
      // sectionId: string (derived from selected subject)
      // file: binary
      // description/tags are UI metadata fields for future backend extension.
      const body = new FormData();
      body.append("title", form.title);
      body.append("subjectId", form.subjectId);
      body.append(
        "sectionId",
        selectedSubject.sectionId?._id || selectedSubject.sectionId
      );
      body.append("file", file);

      const { data } = await API.post("/materials/upload", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(data?.message || "Material uploaded successfully.");
      setForm({ title: "", description: "", tags: "", subjectId: "" });
      setFile(null);
      if (selectedSubject?._id) {
        const materialRes = await API.get(`/materials/${selectedSubject._id}`);
        setMaterials(materialRes.data || []);
      }
    } catch (err) {
      if (err instanceof Error && !err.response) {
        setError(err.message);
      } else {
        setError(getApiError(err, "Upload failed"));
      }
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const loadMaterials = async () => {
      if (!form.subjectId) {
        setMaterials([]);
        return;
      }
      try {
        const { data } = await API.get(`/materials/${form.subjectId}`);
        setMaterials(data || []);
      } catch (err) {
        setError(getApiError(err, "Failed to load materials list"));
      }
    };
    loadMaterials();
  }, [form.subjectId]);

  return (
    <TeacherShell
      pageTitle="Upload Material"
      pageSubtitle="Media-rich content publishing with metadata and drag-drop upload"
    >
      <section className={styles.pageGrid}>
        <article className={styles.formPanel}>
          <header className={styles.panelHeader}>
            <p className={styles.kicker}>Content Publisher</p>
            <h2 className={styles.title}>Upload classroom material with metadata</h2>
            <p className={styles.subtitle}>
              Use detailed tags and description for better student search and retrieval.
            </p>
          </header>

          {isLoading ? <p className={styles.info}>Loading subjects...</p> : null}
          {error ? <p className={styles.error}>{error}</p> : null}
          {success ? <p className={styles.success}>{success}</p> : null}

          <form onSubmit={onSubmit} className={styles.formStack}>
            <label className={styles.label}>Material Title</label>
            <input
              className={styles.input}
              value={form.title}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="e.g. DBMS Unit 4 PPT"
              required
            />

            <label className={styles.label}>Subject</label>
            <select
              className={styles.input}
              value={form.subjectId}
              onChange={(e) => onChange("subjectId", e.target.value)}
              required
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              rows={4}
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="Add what this resource covers and where students should use it."
            />

            <label className={styles.label}>Tags</label>
            <input
              className={styles.input}
              value={form.tags}
              onChange={(e) => onChange("tags", e.target.value)}
              placeholder="dbms, unit4, indexing, exam-prep"
            />

            <button className={styles.submitBtn} type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Publish Material"}
            </button>
          </form>
        </article>

        <section
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ""}`}
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
        >
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80"
            alt="Upload visual"
            className={styles.heroImage}
          />
          <h3 className={styles.dropTitle}>Massive Drag & Drop Zone</h3>
          <p className={styles.dropText}>
            Drop PDF, DOCX, JPG or PNG files here.
          </p>
          <label className={styles.browseBtn}>
            Browse Local File
            <input type="file" className={styles.hiddenInput} onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <p className={styles.fileName}>{file ? `Selected: ${file.name}` : "No file selected"}</p>

          <div className={styles.thumbGrid}>
            <img
              src="https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&auto=format&fit=crop&q=80"
              alt="Student avatar"
              className={styles.thumb}
            />
            <img
              src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&auto=format&fit=crop&q=80"
              alt="Course media"
              className={styles.thumb}
            />
            <img
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop&q=80"
              alt="Teaching material"
              className={styles.thumb}
            />
          </div>
        </section>
      </section>

      <section className={styles.materialListPanel}>
        <h3 className={styles.materialListTitle}>Recent Materials</h3>
        {!materials.length ? (
          <p className={styles.materialListInfo}>Select subject to view attached files.</p>
        ) : (
          <div className={styles.materialListGrid}>
            {materials.map((m) => (
              <article key={m._id} className={styles.materialCard}>
                <p className={styles.materialTitle}>{m.title}</p>
                <p className={styles.materialMeta}>{m.fileName}</p>
                <div className={styles.materialActions}>
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
          </div>
        )}
      </section>
    </TeacherShell>
  );
}

export default UploadMaterial;
