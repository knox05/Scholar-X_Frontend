import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import StudentShell from "../../components/StudentShell";
import { getApiError } from "../../utils/apiError";
import styles from "./StudentSubjects.module.css";

function StudentSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await API.get("/subjects");
        const filtered = user?.sectionId
          ? data.filter((s) => s.sectionId?._id === user.sectionId)
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

  return (
    <StudentShell
      pageTitle="Subjects"
      pageSubtitle="Explore enrolled courses with teacher and semester details"
    >
      {isLoading ? <p className={styles.info}>Loading subjects...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      <section className={styles.layoutGrid}>
        {subjects.map((subject, idx) => (
          <article key={subject._id} className={styles.card}>
            <img
              src={`https://images.unsplash.com/photo-${idx % 2 ? "1513258496099-48168024aec0" : "1509062522246-3755977927d7"}?w=700&auto=format&fit=crop&q=80`}
              alt="Course cover"
              className={styles.cover}
            />
            <h3 className={styles.title}>{subject.name}</h3>
            <p className={styles.meta}>Teacher: {subject.teacherId?.name || "NA"}</p>
            <p className={styles.meta}>Course: {subject.courseId?.name || "NA"}</p>
            <p className={styles.meta}>Semester: {subject.semester}</p>
          </article>
        ))}
        {!isLoading && !subjects.length ? (
          <p className={styles.empty}>No subjects found for your section.</p>
        ) : null}
      </section>
    </StudentShell>
  );
}

export default StudentSubjects;
