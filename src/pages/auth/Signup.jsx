import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { getApiError } from "../../utils/apiError";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    enrollmentNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      if (form.role === "student") {
        payload.enrollmentNumber = form.enrollmentNumber;
      }

      const { data } = await API.post("/auth/register", payload);
      setMessage(data.message || "Account created");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setError(getApiError(err, "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(248, 248, 252, 0.76), rgba(229, 217, 242, 0.82)), url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1800&auto=format&fit=crop&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(167,139,250,0.30),transparent_35%),radial-gradient(circle_at_85%_85%,rgba(124,58,237,0.20),transparent_40%)]" />
      <form onSubmit={handleSubmit} className="glass-card relative z-10 w-full max-w-lg p-8 shadow-2xl shadow-violet-200/60">
        <h2 className="mb-2 text-center text-3xl font-bold text-primary">
          Create Account
        </h2>
        <p className="mb-6 text-center text-sm text-darkText/70">
          Create your account and complete your profile from settings.
        </p>

        {error ? (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="input"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => onChange("password", e.target.value)}
          />
          <select
            className="input"
            value={form.role}
            onChange={(e) => onChange("role", e.target.value)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          {form.role === "student" ? (
            <>
              <input
                className="input"
                placeholder="Enrollment Number"
                value={form.enrollmentNumber}
                onChange={(e) => onChange("enrollmentNumber", e.target.value)}
              />
            </>
          ) : null}
        </div>

        <button className="btn-primary mt-6 w-full" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="mt-4 text-center text-sm text-darkText/70">
          Already registered?{" "}
          <Link className="font-semibold text-primary" to="/">
            Go to Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
