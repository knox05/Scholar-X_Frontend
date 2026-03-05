import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { teacherLinks } from "../constants/navigation";
import { toPublicUrl } from "../utils/media";
import styles from "./TeacherShell.module.css";

function TeacherShell({
  pageTitle,
  pageSubtitle,
  children,
  globalSearchValue = "",
  onGlobalSearchChange,
  notifications = [],
}) {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };
  const [user, setUser] = useState(getStoredUser);

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const onUserUpdated = () => setUser(getStoredUser());
    window.addEventListener("user-updated", onUserUpdated);
    return () => window.removeEventListener("user-updated", onUserUpdated);
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const avatarSrc = toPublicUrl(user?.avatarUrl);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brandCard}>
          <img
            src={
              avatarSrc ||
              "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=200&auto=format&fit=crop&q=80"
            }
            alt="Teacher profile"
            className={styles.brandAvatar}
          />
          <div>
            <p className={styles.brandKicker}>Teacher Workspace</p>
            <p className={styles.brandName}>{user?.name || "Teacher"}</p>
          </div>
        </div>

        <nav className={styles.navStack}>
          {teacherLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <section className={styles.mainArea}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <p className={styles.pageSubtitle}>{pageSubtitle}</p>
          </div>

          <div className={styles.topbarActions}>
            <label className={styles.searchWrap}>
              <input
                type="search"
                placeholder="Search students, courses, material..."
                className={styles.searchInput}
                value={globalSearchValue}
                onChange={(e) => onGlobalSearchChange?.(e.target.value)}
              />
            </label>
            <div className={styles.notificationWrap} ref={notificationRef}>
              <button
                className={styles.bellButton}
                type="button"
                aria-label="Notifications"
                onClick={() => setIsNotificationOpen((prev) => !prev)}
              >
                {unreadCount > 0 ? <span className={styles.bellDot} /> : null}
                <span aria-hidden="true">Bell</span>
              </button>
              {isNotificationOpen ? (
                <div className={styles.notificationPanel}>
                  <p className={styles.notificationTitle}>Notifications</p>
                  {notifications.length ? (
                    notifications.map((item) => (
                      <p key={item.id} className={styles.notificationItem}>
                        {item.message}
                      </p>
                    ))
                  ) : (
                    <p className={styles.notificationEmpty}>No new notifications.</p>
                  )}
                </div>
              ) : null}
            </div>
            <button className={styles.profileTrigger} type="button" aria-label="Profile menu">
              <img
                src={
                  avatarSrc ||
                  "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80"
                }
                alt="User profile"
                className={styles.profileImage}
              />
              <span>{user?.name || "Profile"}</span>
            </button>
            <button onClick={onLogout} className={styles.logoutButton} type="button">
              Logout
            </button>
          </div>
        </header>

        <main className={styles.contentPane}>{children}</main>
      </section>
    </div>
  );
}

export default TeacherShell;
