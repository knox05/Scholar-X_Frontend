import { useEffect, useState } from "react";
import API from "../../api/axios";
import TeacherShell from "../../components/TeacherShell";
import { getApiError } from "../../utils/apiError";
import { toPublicUrl } from "../../utils/media";
import styles from "./TeacherSettings.module.css";

function TeacherSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await API.get("/settings");
        setName(data.name || "");
        setEmail(data.email || "");
        setAvatarUrl(data.avatarUrl || "");
        if (data?._id) {
          const currentUser = (() => {
            try {
              return JSON.parse(localStorage.getItem("user") || "null");
            } catch {
              return null;
            }
          })();
          const nextUser = { ...(currentUser || {}), ...data };
          localStorage.setItem("user", JSON.stringify(nextUser));
          window.dispatchEvent(new Event("user-updated"));
        }
      } catch (err) {
        setError(getApiError(err, "Failed to load profile"));
      }
    };
    loadProfile();
  }, []);

  const onProfileSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSavingProfile(true);
    try {
      const { data } = await API.put("/settings/update", { name });
      setSuccess(data?.message || "Profile updated");
      if (data?.user) {
        const currentUser = (() => {
          try {
            return JSON.parse(localStorage.getItem("user") || "null");
          } catch {
            return null;
          }
        })();
        const nextUser = { ...(currentUser || {}), ...data.user };
        localStorage.setItem("user", JSON.stringify(nextUser));
        setAvatarUrl(nextUser.avatarUrl || "");
        window.dispatchEvent(new Event("user-updated"));
      }
    } catch (err) {
      setError(getApiError(err, "Profile update failed"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onAvatarSave = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      setError("Please choose an image to upload.");
      return;
    }
    setError("");
    setSuccess("");
    setIsSavingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const { data } = await API.put("/settings/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(data?.message || "Avatar updated");
      if (data?.user) {
        const currentUser = (() => {
          try {
            return JSON.parse(localStorage.getItem("user") || "null");
          } catch {
            return null;
          }
        })();
        const nextUser = { ...(currentUser || {}), ...data.user };
        localStorage.setItem("user", JSON.stringify(nextUser));
        setAvatarUrl(nextUser.avatarUrl || "");
        window.dispatchEvent(new Event("user-updated"));
      }
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (err) {
      setError(getApiError(err, "Avatar upload failed"));
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const onPasswordSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSavingPassword(true);
    try {
      const { data } = await API.put("/settings/change-password", {
        oldPassword,
        newPassword,
      });
      setSuccess(data?.message || "Password changed");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(getApiError(err, "Password update failed"));
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <TeacherShell
      pageTitle="Teacher Settings"
      pageSubtitle="Manage profile details and security credentials"
    >
      {error ? <p className={styles.error}>{error}</p> : null}
      {success ? <p className={styles.success}>{success}</p> : null}

      <section className={styles.layoutGrid}>
        <form className={styles.card} onSubmit={onProfileSave}>
          <h2 className={styles.cardTitle}>Profile Information</h2>
          <img
            src={
              avatarPreview ||
              toPublicUrl(avatarUrl) ||
              "https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80"
            }
            alt="Teacher profile"
            className={styles.profileImage}
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80";
            }}
          />
          <label className={styles.label}>Profile Photo</label>
          <input
            className={styles.input}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setAvatarFile(file || null);
              setAvatarPreview(file ? URL.createObjectURL(file) : "");
            }}
          />
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={onAvatarSave}
            disabled={isSavingAvatar}
          >
            {isSavingAvatar ? "Uploading..." : "Upload Photo"}
          </button>
          <label className={styles.label}>Name</label>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
          <label className={styles.label}>Email</label>
          <input className={styles.input} value={email} readOnly />
          <button className={styles.primaryBtn} disabled={isSavingProfile}>
            {isSavingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <form className={styles.card} onSubmit={onPasswordSave}>
          <h2 className={styles.cardTitle}>Security</h2>
          <p className={styles.helperText}>Update your password regularly for better account protection.</p>
          <label className={styles.label}>Old Password</label>
          <input
            className={styles.input}
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <label className={styles.label}>New Password</label>
          <input
            className={styles.input}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button className={styles.primaryBtn} disabled={isSavingPassword}>
            {isSavingPassword ? "Saving..." : "Change Password"}
          </button>
        </form>
      </section>
    </TeacherShell>
  );
}

export default TeacherSettings;
