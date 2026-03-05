import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import TeacherShell from "../../components/TeacherShell";
import { getApiError } from "../../utils/apiError";
import { toPublicUrl } from "../../utils/media";
import styles from "./TeacherDashboard.module.css";

const covers = [
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=80",
];

function TeacherDashboard() {
  // 1) State initialization for API data, loading indicators, filters and pagination.
  const [dashboard, setDashboard] = useState({ totalSubjects: 0, subjects: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const avatarSrc = toPublicUrl(user?.avatarUrl);

  useEffect(() => {
    // 2) useEffect for initial page fetch on mount.
    // API mapping:
    // GET /dashboard/teacher
    // Expected response shape:
    // { totalSubjects: number, subjects: [{ subjectId, subjectName, totalClasses, totalStudents, averageAttendance, defaulters }] }
    const fetchDashboard = async () => {
      try {
        const { data } = await API.get("/dashboard/teacher");
        setDashboard({
          totalSubjects: data?.totalSubjects || 0,
          subjects: data?.subjects || [],
        });
      } catch (err) {
        setError(getApiError(err, "Failed to load dashboard"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const filteredSubjects = dashboard.subjects.filter((subject) => {
    const searchValue = searchTerm.trim().toLowerCase();
    const globalValue = globalSearch.trim().toLowerCase();
    const bySearch =
      !searchValue ||
      subject.subjectName.toLowerCase().includes(searchValue) ||
      (subject.programmeName || "").toLowerCase().includes(searchValue);
    const byGlobal =
      !globalValue ||
      subject.subjectName.toLowerCase().includes(globalValue) ||
      (subject.programmeName || "").toLowerCase().includes(globalValue);
    const attendance = Number(subject.averageAttendance || 0);
    const computedStatus =
      attendance >= 75 ? "active" : attendance >= 50 ? "warning" : "critical";
    const byStatus = statusFilter === "all" || statusFilter === computedStatus;
    return bySearch && byGlobal && byStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * rowsPerPage;
  const visibleRows = filteredSubjects.slice(pageStart, pageStart + rowsPerPage);

  const totalClasses = dashboard.subjects.reduce(
    (sum, item) => sum + (item.totalClasses || 0),
    0
  );
  const totalStudents = dashboard.subjects.reduce(
    (sum, item) => sum + (item.totalStudents || 0),
    0
  );
  const defaulters = dashboard.subjects.reduce(
    (sum, item) => sum + (item.defaulters || 0),
    0
  );
  const avgAttendance = dashboard.subjects.length
    ? (
        dashboard.subjects.reduce(
          (sum, item) => sum + Number(item.averageAttendance || 0),
          0
        ) / dashboard.subjects.length
      ).toFixed(1)
    : "0.0";

  const notifications = useMemo(() => {
    if (isLoading) {
      return [];
    }

    const items = [];
    if (defaulters > 0) {
      items.push({
        id: "defaulters",
        message: `${defaulters} students need intervention across your subjects.`,
        read: false,
      });
    }
    if (Number(avgAttendance) < 75 && dashboard.subjects.length) {
      items.push({
        id: "attendance",
        message: "Average attendance is below 75%. Review risk students.",
        read: false,
      });
    }
    if (!items.length) {
      items.push({
        id: "summary",
        message: "All caught up. No new alerts right now.",
        read: true,
      });
    }
    return items;
  }, [avgAttendance, dashboard.subjects.length, defaulters, isLoading]);

  return (
    <TeacherShell
      pageTitle="Teacher Dashboard"
      pageSubtitle="Advanced analytics, status tracking and section-level visibility"
      globalSearchValue={globalSearch}
      onGlobalSearchChange={(value) => {
        setGlobalSearch(value);
        setCurrentPage(1);
      }}
      notifications={notifications}
    >
      <section className={styles.heroGrid}>
        <article className={styles.heroCard}>
          <p className={styles.kicker}>Command Center</p>
          <h2 className={styles.heroTitle}>Welcome back, {user?.name || "Teacher"}</h2>
          <p className={styles.heroText}>
            Real-time visibility across attendance quality, student risk and course
            delivery progress with high-density dashboard controls.
          </p>
          <div className={styles.coverGrid}>
            {covers.map((cover) => (
              <img key={cover} src={cover} alt="Course cover thumbnail" className={styles.cover} />
            ))}
          </div>
        </article>

        <article className={styles.profileCard}>
          <img
            src={
              avatarSrc ||
              "https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80"
            }
            alt="Teacher profile"
            className={styles.profileImage}
          />
          <h3 className={styles.profileName}>{user?.name || "Teacher"}</h3>
          <p className={styles.profileMeta}>{user?.email || "teacher@lms.com"}</p>
          <div className={styles.profilePills}>
            <span className={styles.pill}>Faculty Active</span>
            <span className={styles.pill}>Role: {user?.role || "teacher"}</span>
          </div>
        </article>
      </section>

      <section className={styles.metricGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Subjects</p>
          <p className={styles.metricValue}>{dashboard.totalSubjects}</p>
          <p className={styles.metricDelta}>+6% this week</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Total Students</p>
          <p className={styles.metricValue}>{totalStudents}</p>
          <p className={styles.metricDelta}>+2% this week</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Total Classes</p>
          <p className={styles.metricValue}>{totalClasses}</p>
          <p className={styles.metricDelta}>+12% this month</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Avg Attendance</p>
          <p className={styles.metricValue}>{avgAttendance}%</p>
          <div className={styles.progressWrap}>
            <div className={styles.progressFill} style={{ width: `${avgAttendance}%` }} />
          </div>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Defaulters</p>
          <p className={styles.metricValue}>{defaulters}</p>
          <p className={styles.metricDeltaNegative}>Needs intervention</p>
        </article>
      </section>

      <section className={styles.tablePanel}>
        <div className={styles.tableHeader}>
          <div>
            <h3 className={styles.tableTitle}>Course Performance Table</h3>
            <p className={styles.tableSubtitle}>Search, filter and paginate complete course rows</p>
          </div>
          <div className={styles.filterRow}>
            <input
              className={styles.searchInput}
              placeholder="Search subject"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {isLoading ? <p className={styles.infoText}>Loading dashboard...</p> : null}
        {error ? <p className={styles.errorText}>{error}</p> : null}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Course</th>
                <th>Classes</th>
                <th>Students</th>
                <th>Attendance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((subject, idx) => {
                const attendance = Number(subject.averageAttendance || 0);
                const status =
                  attendance >= 75 ? "Active" : attendance >= 50 ? "Warning" : "Critical";
                const statusClass =
                  attendance >= 75
                    ? styles.statusActive
                    : attendance >= 50
                    ? styles.statusWarning
                    : styles.statusCritical;

                return (
                  <tr key={subject.subjectId} className={styles.tableRow}>
                    <td>
                      <div className={styles.courseCell}>
                        <img
                          src={covers[idx % covers.length]}
                          alt="Course cover"
                          className={styles.courseCover}
                        />
                        <div>
                          <p className={styles.courseName}>{subject.subjectName}</p>
                          <p className={styles.courseMeta}>
                            Programme: {subject.programmeName || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{subject.totalClasses}</td>
                    <td>{subject.totalStudents}</td>
                    <td>
                      <div className={styles.attendanceCell}>
                        <span>{attendance}%</span>
                        <div className={styles.progressWrapSmall}>
                          <div
                            className={styles.progressFillSmall}
                            style={{ width: `${Math.min(100, attendance)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusPill} ${statusClass}`}>{status}</span>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button type="button" className={styles.actionBtn}>
                          View
                        </button>
                        <button type="button" className={styles.actionBtn}>
                          Export
                        </button>
                        <span className={styles.tooltip}>Quick actions</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && !visibleRows.length ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    No rows match your current search/filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className={styles.paginationBar}>
          <p className={styles.paginationMeta}>
            Showing {visibleRows.length ? pageStart + 1 : 0}-
            {pageStart + visibleRows.length} of {filteredSubjects.length}
          </p>
          <div className={styles.paginationControls}>
            <button
              type="button"
              className={styles.paginationBtn}
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className={styles.pageNumber}>
              Page {safePage} / {totalPages}
            </span>
            <button
              type="button"
              className={styles.paginationBtn}
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </TeacherShell>
  );
}

export default TeacherDashboard;
