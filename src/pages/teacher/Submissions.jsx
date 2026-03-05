import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import TeacherShell from "../../components/TeacherShell";
import { getApiError } from "../../utils/apiError";
import { toPublicUrl } from "../../utils/media";
import styles from "./Submissions.module.css";

function Submissions() {
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBaseData = async () => {
      setError("");
      try {
        const [sectionsRes, subjectsRes] = await Promise.all([
          API.get("/sections"),
          API.get("/subjects"),
        ]);
        setSections(Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
        setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
      } catch (err) {
        setError(getApiError(err, "Failed to load sections or subjects"));
      }
    };

    fetchBaseData();
  }, []);

  useEffect(() => {
    if (!subjectId || !sectionId) {
      setAssignments([]);
      return;
    }

    const fetchAssignments = async () => {
      setError("");
      setIsLoading(true);
      try {
        const { data } = await API.get("/assignments/teacher", {
          params: { subjectId, sectionId },
        });
        setAssignments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(getApiError(err, "Failed to load assignments"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [sectionId, subjectId]);

  useEffect(() => {
    if (!assignmentId) {
      setRows([]);
      return;
    }

    const fetchSubmissions = async () => {
      setError("");
      setIsLoading(true);
      try {
        const { data } = await API.get(`/assignments/submissions/${assignmentId}`);
        setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(getApiError(err, "Failed to fetch submissions"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  const filtered = useMemo(() => {
    return rows.filter((row) =>
      `${row.studentId?.name || ""} ${row.studentId?.enrollmentNumber || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [rows, search]);

  const semesters = useMemo(() => {
    const values = new Set();
    sections.forEach((section) => {
      if (section.semester) {
        values.add(String(section.semester));
      }
    });
    return Array.from(values).sort();
  }, [sections]);

  const sectionOptions = useMemo(() => {
    return sections.filter((section) => {
      if (!semester) {
        return true;
      }
      return String(section.semester) === String(semester);
    });
  }, [sections, semester]);

  const subjectOptions = useMemo(() => {
    return subjects.filter((subject) => {
      const subjectSemester = String(subject.semester || subject.sectionId?.semester || "");
      if (semester && subjectSemester !== String(semester)) {
        return false;
      }
      if (sectionId && subject.sectionId?._id !== sectionId) {
        return false;
      }
      return true;
    });
  }, [subjects, semester, sectionId]);

  return (
    <TeacherShell
      pageTitle="Submissions"
      pageSubtitle="Review student attempts with metadata and quick status indicators"
    >
      <section className={styles.headerRow}>
        <div className={styles.fetchCard}>
          <div className={styles.filterGrid}>
            <div>
              <label className={styles.label}>Semester</label>
              <select
                className={styles.select}
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  setSectionId("");
                  setSubjectId("");
                  setAssignmentId("");
                  setRows([]);
                }}
              >
                <option value="">Select semester</option>
                {semesters.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.label}>Section</label>
              <select
                className={styles.select}
                value={sectionId}
                onChange={(e) => {
                  setSectionId(e.target.value);
                  setSubjectId("");
                  setAssignmentId("");
                  setRows([]);
                }}
              >
                <option value="">Select section</option>
                {sectionOptions.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.sectionName || section._id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.label}>Subject</label>
              <select
                className={styles.select}
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setAssignmentId("");
                  setRows([]);
                }}
              >
                <option value="">Select subject</option>
                {subjectOptions.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.label}>Assignment</label>
              <select
                className={styles.select}
                value={assignmentId}
                onChange={(e) => setAssignmentId(e.target.value)}
                disabled={!subjectId || !sectionId}
              >
                <option value="">Select assignment</option>
                {assignments.map((assignment) => (
                  <option key={assignment._id} value={assignment._id}>
                    {assignment.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error ? <p className={styles.error}>{error}</p> : null}
        </div>

        <article className={styles.bannerCard}>
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80"
            alt="Submission review"
            className={styles.bannerImage}
          />
        </article>
      </section>

      <section className={styles.tablePanel}>
        <div className={styles.tableTop}>
          <h3 className={styles.tableTitle}>Submission Table</h3>
          <input
            className={styles.searchInput}
            placeholder="Search by student name or enrollment"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Enrollment</th>
                <th>Text</th>
                <th>File</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row._id}>
                  <td>
                    <div className={styles.userCell}>
                      {row.studentId?.avatarUrl ? (
                        <img
                          src={toPublicUrl(row.studentId.avatarUrl)}
                          alt="Student avatar"
                          className={styles.avatar}
                        />
                      ) : (
                        <span className={styles.avatarFallback}>
                          {(row.studentId?.name || "S").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span>{row.studentId?.name || "NA"}</span>
                    </div>
                  </td>
                  <td>{row.studentId?.enrollmentNumber || "NA"}</td>
                  <td>{row.submissionText || "-"}</td>
                  <td>{row.fileName || "-"}</td>
                  <td>
                    <span className={`${styles.pill} ${row.isLate ? styles.late : styles.onTime}`}>
                      {row.isLate ? "Late" : "On Time"}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && !filtered.length ? (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    No submissions to show.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </TeacherShell>
  );
}

export default Submissions;
