import { NavLink } from "react-router-dom";

function Sidebar({ heading, links = [] }) {
  return (
    <aside className="glass-card h-fit p-4 md:sticky md:top-4">
      <div className="mb-4 rounded-xl bg-gradient-to-r from-lavenderLight/40 to-white p-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          {heading}
        </p>
        <h1 className="mt-1 text-lg font-semibold text-darkText">ScholarX LMS</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-primary to-[#8f72d9] text-white shadow-[0_10px_20px_rgba(141,101,246,0.3)]"
                  : "bg-lavenderLight/35 text-darkText hover:bg-lavenderLight/70"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
