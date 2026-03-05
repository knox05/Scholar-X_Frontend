import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import StudentShell from "../../components/StudentShell";
import { getApiError } from "../../utils/apiError";
import styles from "./StudentDashboard.module.css";

function StudentDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await API.get("/dashboard/student");
        setData(data);
      } catch (err) {
        setError(getApiError(err, "Failed to load dashboard"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const notifications = useMemo(() => {
    if (!data) {
      return [];
    }
    const items = [];
    if (!data.overallEligible) {
      items.push({
        id: "eligibility",
        message: "Eligibility is below threshold. Improve attendance.",
        read: false,
      });
    }
    if (Number(data.overallPercentage || 0) < 75) {
      items.push({
        id: "attendance",
        message: "Overall attendance is below 75%.",
        read: false,
      });
    }
    if (items.length === 0) {
      items.push({
        id: "summary",
        message: "All caught up. Keep up the good work.",
        read: true,
      });
    }
    return items;
  }, [data]);

  const filteredSubjects = useMemo(() => {
    if (!data?.subjects?.length) return [];
    const term = globalSearch.trim().toLowerCase();
    if (!term) return data.subjects;
    return data.subjects.filter((subject) =>
      subject.subjectName.toLowerCase().includes(term)
    );
  }, [data, globalSearch]);

  return (
    <StudentShell
      pageTitle="Student Dashboard"
      pageSubtitle="Track attendance, eligibility and subject-level progress"
      globalSearchValue={globalSearch}
      onGlobalSearchChange={setGlobalSearch}
      notifications={notifications}
    >
      {isLoading ? <p className={styles.info}>Loading dashboard...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {data ? (
        <>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <p className={styles.kicker}>Academic Snapshot</p>
              <h2 className={styles.heroTitle}>Hello, {data.studentName}</h2>
              <p className={styles.heroText}>
                Keep your attendance above threshold and stay eligible for evaluations.
              </p>
            </div>
            <div className={styles.heroMedia}>
              <img
                src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=900&auto=format&fit=crop&q=80"
                alt="Student learning"
                className={styles.heroImage}
                onError={(e) => {
                  if (e.currentTarget.dataset.fallbackApplied) return;
                  e.currentTarget.dataset.fallbackApplied = "1";
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&auto=format&fit=crop&q=80";
                }}
              />
            </div>
          </section>

          <section className={styles.metricGrid}>
            <article className={styles.metric}>
              <p className={styles.metricLabel}>Overall Attendance</p>
              <p className={styles.metricValue}>{data.overallPercentage}%</p>
            </article>
            <article className={styles.metric}>
              <p className={styles.metricLabel}>Eligibility</p>
              <p className={styles.metricValue}>
                {data.overallEligible ? "Eligible" : "Not Eligible"}
              </p>
            </article>
            <article className={styles.metric}>
              <p className={styles.metricLabel}>Classes Attended</p>
              <p className={styles.metricValue}>
                {data.totalAttended}/{data.totalClasses}
              </p>
            </article>
          </section>

          <section className={styles.tablePanel}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Total Classes</th>
                    <th>Attended</th>
                    <th>Percentage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.subjectId}>
                      <td>{subject.subjectName}</td>
                      <td>{subject.totalClasses}</td>
                      <td>{subject.attended}</td>
                      <td>{subject.percentage}%</td>
                      <td>
                        <span
                          className={`${styles.pill} ${
                            subject.eligible ? styles.active : styles.warning
                          }`}
                        >
                          {subject.eligible ? "Healthy" : "Low"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!filteredSubjects.length ? (
                    <tr>
                      <td colSpan={5} className={styles.empty}>
                        No subjects match your search.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </StudentShell>
  );
}

export default StudentDashboard;
