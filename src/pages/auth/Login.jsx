import { useState } from "react";
import API from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { getApiError } from "../../utils/apiError";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "student") {
        navigate("/student/dashboard", { replace: true });
      } else if (data.user.role === "teacher") {
        navigate("/teacher/dashboard", { replace: true });
      } else if (data.user.role === "admin") {
        navigate("/teacher/dashboard", { replace: true });
      }
    } catch (err) {
      setError(getApiError(err, "Invalid credentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen grid place-items-center overflow-hidden p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(247, 244, 255, 0.72), rgba(238, 231, 255, 0.82)), url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1800&auto=format&fit=crop&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.30),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_40%)]" />
      <form
        onSubmit={handleLogin}
        className="glass-card relative z-10 w-full max-w-md overflow-hidden p-8 shadow-2xl shadow-violet-200/60"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-lavenderLight/70" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-primary/15" />
        <h2 className="mb-2 text-center text-3xl font-bold text-primary">
          ScholarX LMS Login
        </h2>
        <p className="mb-6 text-center text-sm text-darkText/70">
          A professional white and lavender learning workspace
        </p>

        {error ? (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <input
          type="email"
          placeholder="Email"
          className="input mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="input mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-sm text-darkText/70">
          New user?{" "}
          <Link className="font-semibold text-primary" to="/signup">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
