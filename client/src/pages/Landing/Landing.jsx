import { useEffect, useState } from "react";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
  useAuth,
} from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { resolveRole } from "../../lib/roles";
import "./Landing.css";
import Footer from "../../components/Footer/Footer";

const features = [
  {
    icon: "📚",
    title: "Structured Courses",
    desc: "Access carefully curated course materials organized for efficient learning.",
  },
  {
    icon: "🎯",
    title: "Track Progress",
    desc: "Monitor your learning journey with clear milestones and progress indicators.",
  },
  {
    icon: "👩‍🏫",
    title: "Expert Instructors",
    desc: "Learn directly from experienced instructors who guide you every step of the way.",
  },
];

export function Landing() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    async function handleRedirect() {
      if (!isLoaded || !isSignedIn) return;
      let role = resolveRole(user);

      if (!role) {
        setSyncing(true);
        setSyncError(null);
        try {
          const token = await getToken();

          // ── Step 1: Try student sync ──────────────────────────────────────
          const studentRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/students/sync`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (studentRes.ok) {
            const data = await studentRes.json();
            role = data.role ?? null;
            await user.reload();
          } else if (studentRes.status === 404) {
            // ── Step 2: Not a student — try instructor sync ─────────────────
            const instructorRes = await fetch(
              `${import.meta.env.VITE_API_URL}/api/instructors/sync`,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (instructorRes.ok) {
              const data = await instructorRes.json();
              role = data.role ?? null;
              await user.reload();
            } else if (instructorRes.status === 404) {
              // Not a student or instructor — unregistered user
              navigate("/not-registered", { replace: true });
              return;
            } else {
              const body = await instructorRes.text().catch(() => "(no body)");
              setSyncError(
                `Instructor sync failed (${instructorRes.status}): ${body}`,
              );
              return;
            }
          } else {
            const body = await studentRes.text().catch(() => "(no body)");
            setSyncError(`Sync failed (${studentRes.status}): ${body}`);
            return;
          }
        } catch (err) {
          setSyncError(`Network error: ${err.message}`);
          return;
        } finally {
          setSyncing(false);
        }
      }

      if (role === "student") navigate("/student", { replace: true });
      else if (role === "admin") navigate("/admin", { replace: true });
      else if (role === "instructor")
        navigate("/instructor", { replace: true });
      else navigate("/unauthorized", { replace: true });
    }
    handleRedirect();
  }, [getToken, isLoaded, isSignedIn, user, navigate]);

  if (syncing) {
    return (
      <div className="landing-loading">
        <div className="loading-spinner" />
        <p>Setting up your account…</p>
      </div>
    );
  }

  if (syncError) {
    return (
      <div className="landing-error">
        <strong>Something went wrong</strong>
        <pre>{syncError}</pre>
      </div>
    );
  }

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="nav-name">Benago</span>
        </div>
        <div className="nav-actions">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="btn btn-ghost">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn btn-primary">Get Started</button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </nav>

      {/* Hero */}
      <main className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Learn smarter,
            <br />
            <span className="hero-accent">grow faster.</span>
          </h1>
          <p className="hero-subtitle">
            Benago connects students with instructors through a structured,
            results-driven learning experience.
          </p>
          <div className="hero-cta">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="btn btn-primary btn-lg">
                  Start Learning
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="btn btn-outline btn-lg">Sign In</button>
              </SignInButton>
            </Show>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card">
            <div className="card-dot green" />
            <div className="card-dot yellow" />
            <div className="card-dot red" />
            <div className="card-lines">
              <div className="card-line w-70" />
              <div className="card-line w-50" />
              <div className="card-line w-90" />
              <div className="card-line w-60" />
            </div>
            <div className="card-progress-row">
              <span>Progress </span>
              <span>65%</span>
            </div>
            <div className="card-progress-bar">
              <div className="card-progress-fill" style={{ width: "65%" }} />
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="landing-features">
        {features.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
