import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import TeacherShell from "../../components/TeacherShell";
import { getApiError } from "../../utils/apiError";
import styles from "./CreateAssignment.module.css";

function CreateAssignment() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subjectId: "",
    dueDate: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        const filtered = user?._id
          ? data.filter((s) => s.teacherId?._id === user._id)
          : data;
        setSubjects(filtered);
      } catch (err) {
        setError(getApiError(err, "Failed to load subjects"));
      } finally {
        setIsLoading(false);
      }
    };
    loadSubjects();
  }, [user]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const selected = subjects.find((s) => s._id === form.subjectId);
      if (!selected) throw new Error("Select a valid subject.");

      const payload = {
        title: form.title,
        description: form.description,
        subjectId: form.subjectId,
        sectionId: selected.sectionId?._id || selected.sectionId,
        dueDate: form.dueDate,
      };

      const { data } = await API.post("/assignments/create", payload);
      setSuccess(data?.message || "Assignment created");
      setForm({ title: "", description: "", subjectId: "", dueDate: "" });
    } catch (err) {
      if (err instanceof Error && !err.response) setError(err.message);
      else setError(getApiError(err, "Failed to create assignment"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TeacherShell
      pageTitle="Create Assignment"
      pageSubtitle="Design, schedule and publish assignments with section mapping"
    >
      <section className={styles.layoutGrid}>
        <article className={styles.hero}>
          <p className={styles.kicker}>Assessment Studio</p>
          <h2 className={styles.title}>Build assignment tasks with deadlines</h2>
          <p className={styles.subtitle}>
            Use this panel to define assignment metadata, link subject and section,
            and schedule due date in one flow.
          </p>
          <img
            src="https://images.unsplash.com/photo-1513258496099-48168024aec0?w=900&auto=format&fit=crop&q=80"
            alt="Assignment workspace"
            className={styles.heroImage}
          />
        </article>

        <form className={styles.formPanel} onSubmit={onSubmit}>
          {isLoading ? <p className={styles.info}>Loading subjects...</p> : null}
          {error ? <p className={styles.error}>{error}</p> : null}
          {success ? <p className={styles.success}>{success}</p> : null}

          <label className={styles.label}>Assignment Title</label>
          <input
            className={styles.input}
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
            required
          />

          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            rows={5}
          />

          <label className={styles.label}>Subject</label>
          <select
            className={styles.input}
            value={form.subjectId}
            onChange={(e) => onChange("subjectId", e.target.value)}
            required
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <label className={styles.label}>Due Date</label>
          <input
            className={styles.input}
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) => onChange("dueDate", e.target.value)}
            required
          />

          <button className={styles.submitBtn} type="submit" disabled={isSaving}>
            {isSaving ? "Publishing..." : "Create Assignment"}
          </button>
        </form>
      </section>
    </TeacherShell>
  );
}

export default CreateAssignment;
