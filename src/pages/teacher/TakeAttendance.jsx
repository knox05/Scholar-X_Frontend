import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import TeacherShell from "../../components/TeacherShell";
import { getApiError, isObjectId } from "../../utils/apiError";
import { toPublicUrl } from "../../utils/media";
import styles from "./TakeAttendance.module.css";

function TakeAttendance() {
  // 1) State initialization: filters, students, loading and error states.
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    // 2) useEffect for initial page fetch.
    // API mapping:
    // GET /subjects to load subject dropdown.
    // Optional future endpoint integration:
    // GET /students?sectionId=<id>&batch=<value> to replace seeded roster.
    const loadPageData = async () => {
      try {
        const [{ data: subjectData }, { data: sectionData }] = await Promise.all([
          API.get("/subjects"),
          API.get("/sections"),
        ]);

        const teacherSubjects = user?._id
          ? subjectData.filter((subject) => subject.teacherId?._id === user._id)
          : subjectData;
        setSubjects(teacherSubjects);
        setSections(sectionData || []);
      } catch (err) {
        setError(getApiError(err, "Unable to load attendance configuration"));
      } finally {
        setIsLoading(false);
      }
    };
    loadPageData();
  }, [user]);

  useEffect(() => {
    const selectedSubject = subjects.find((subject) => subject._id === subjectId);
    const linkedSectionId =
      selectedSubject?.sectionId?._id || selectedSubject?.sectionId || "";
    if (linkedSectionId) {
      setSelectedSectionId(linkedSectionId);
    }
  }, [subjectId, subjects]);

  useEffect(() => {
    const loadStudentsForSelectedSubject = async () => {
      if (!selectedSectionId) {
        setRows([]);
        return;
      }

      try {
        if (!isObjectId(selectedSectionId)) {
          setRows([]);
          return;
        }

        let data = [];
        try {
          const res = await API.get(`/students/section/${selectedSectionId}`);
          data = res.data || [];
        } catch (primaryErr) {
          // Fallback to section-based route in case student route isn't available in runtime.
          const fallbackRes = await API.get(`/sections/${selectedSectionId}/students`);
          data = fallbackRes.data || [];
        }

        const mappedRows = (data || []).map((student) => ({
          _id: student._id,
          name: student.name,
          enrollmentNumber: student.enrollmentNumber || "-",
          avatar: student.avatarUrl ? toPublicUrl(student.avatarUrl) : "",
          status: "Present",
        }));

        setRows(mappedRows);
      } catch (err) {
        setError(getApiError(err, "Unable to load students for this section"));
      }
    };

    loadStudentsForSelectedSubject();
  }, [selectedSectionId]);

  const onStatusChange = (studentId, status) => {
    setRows((prev) => prev.map((row) => (row._id === studentId ? { ...row, status } : row)));
  };

  const submitAttendance = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const finalSectionId = selectedSectionId;

      if (!isObjectId(subjectId)) {
        throw new Error("Select a valid subject before submit.");
      }
      if (!isObjectId(finalSectionId)) {
        throw new Error("Select a valid section.");
      }
      if (!date) {
        throw new Error("Attendance date is required.");
      }

      // 3) API submit location:
      // POST /attendance
      // 4) Payload structure from UI:
      // {
      //   subjectId: "ObjectId from Subject dropdown",
      //   sectionId: "ObjectId from subject.sectionId or manual fallback",
      //   date: "ISO string",
      //   records: [{ studentId: "...", status: "Present" | "Absent" }]
      // }
      // UI has "Late" option for richer UX; backend enum only allows Present/Absent.
      // So we map Late -> Present to avoid server enum errors without backend changes.
      const payload = {
        subjectId,
        sectionId: finalSectionId,
        date: new Date(date).toISOString(),
        records: rows.map((row) => ({
          studentId: row._id,
          status: row.status === "Late" ? "Present" : row.status,
        })),
      };

      const { data } = await API.post("/attendance", payload);
      setSuccess(data?.message || "Attendance submitted successfully.");
    } catch (err) {
      if (err instanceof Error && !err.response) {
        setError(err.message);
      } else {
        setError(getApiError(err, "Failed to submit attendance"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TeacherShell
      pageTitle="Take Attendance"
      pageSubtitle="Interactive roster with status controls and sticky submit footer"
    >
      <section className={styles.filterPanel}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Subject</label>
          <select
            className={styles.input}
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Date</label>
          <input className={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Section</label>
          <select
            className={styles.input}
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
          >
            <option value="">Select section</option>
            {sections.map((section) => (
              <option key={section._id} value={section._id}>
                {section.sectionName}
                {section.semester ? ` - Sem ${section.semester}` : ""}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isLoading ? <p className={styles.info}>Loading page data...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
      {success ? <p className={styles.success}>{success}</p> : null}

      <section className={styles.gridPanel}>
        <header className={styles.gridHeader}>
          <span>Student</span>
          <span>Present</span>
          <span>Absent</span>
          <span>Late</span>
        </header>
        <div className={styles.gridBody}>
          {rows.map((student) => (
            <div className={styles.studentRow} key={student._id}>
              <div className={styles.studentCell}>
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className={styles.studentAvatar}
                  />
                ) : (
                  <div className={styles.studentAvatarFallback}>
                    {(student.name || "S").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className={styles.studentName}>{student.name}</p>
                  <p className={styles.studentMeta}>{student.enrollmentNumber}</p>
                </div>
              </div>

              {["Present", "Absent", "Late"].map((status) => (
                <label key={`${student._id}-${status}`} className={styles.toggleLabel}>
                  <input
                    className={styles.toggleInput}
                    type="radio"
                    name={`status-${student._id}`}
                    checked={student.status === status}
                    onChange={() => onStatusChange(student._id, status)}
                  />
                  <span className={styles.togglePill}>{status}</span>
                </label>
              ))}
            </div>
          ))}
          {!rows.length ? (
            <div className={styles.emptyRow}>
              No students found for selected section.
            </div>
          ) : null}
        </div>
      </section>

      <footer className={styles.stickyFooter}>
        <p className={styles.footerHint}>
          Review all rows before submit. Status "Late" is supported in UI and mapped safely for backend.
        </p>
        <button
          type="button"
          className={styles.submitBtn}
          disabled={isSubmitting}
          onClick={submitAttendance}
        >
          {isSubmitting ? "Submitting..." : "Submit Attendance"}
        </button>
      </footer>
    </TeacherShell>
  );
}

export default TakeAttendance;
