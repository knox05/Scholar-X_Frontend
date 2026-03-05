import { useEffect, useState } from "react";
import API from "../../api/axios";
import StudentShell from "../../components/StudentShell";
import { getApiError } from "../../utils/apiError";
import styles from "./StudentAssignments.module.css";

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const { data } = await API.get("/assignments/student");
        setAssignments(data || []);
        if (data?.length) setSelectedId(data[0]._id);
      } catch (err) {
        setError(getApiError(err, "Failed to load assignments"));
      } finally {
        setIsLoading(false);
      }
    };
    loadAssignments();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const body = new FormData();
      body.append("assignmentId", selectedId);
      body.append("submissionText", submissionText);
      if (file) body.append("file", file);

      const { data } = await API.post("/assignments/submit", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(data?.message || "Submitted");
      setSubmissionText("");
      setFile(null);
    } catch (err) {
      setError(getApiError(err, "Submission failed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StudentShell
      pageTitle="Assignments"
      pageSubtitle="Submit work and monitor upcoming deadlines"
    >
      <section className={styles.layoutGrid}>
        <form className={styles.formCard} onSubmit={onSubmit}>
          <h2 className={styles.cardTitle}>Submit Assignment</h2>
          {error ? <p className={styles.error}>{error}</p> : null}
          {success ? <p className={styles.success}>{success}</p> : null}

          <label className={styles.label}>Assignment</label>
          <select
            className={styles.input}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            required
          >
            <option value="">Select assignment</option>
            {assignments.map((a) => (
              <option key={a._id} value={a._id}>
                {a.title}
              </option>
            ))}
          </select>

          <label className={styles.label}>Submission Text</label>
          <textarea
            className={styles.textarea}
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
          />

          <label className={styles.label}>File</label>
          <input className={styles.input} type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

          <button className={styles.submitBtn} type="submit" disabled={isSaving}>
            {isSaving ? "Submitting..." : "Submit"}
          </button>
        </form>

        <section className={styles.tablePanel}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className={styles.empty}>
                      Loading assignments...
                    </td>
                  </tr>
                ) : (
                  assignments.map((a) => (
                    <tr key={a._id}>
                      <td>{a.title}</td>
                      <td>{a.description || "-"}</td>
                      <td>{new Date(a.dueDate).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </StudentShell>
  );
}

export default StudentAssignments;
