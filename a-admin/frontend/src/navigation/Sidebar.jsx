import { NavLink } from "react-router-dom";

export function Sidebar({ menu }) {
  return (
    <aside className="hidden lg:flex w-64 bg-white border-r min-h-screen p-4">
      <nav className="fixed space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
               ${isActive
                 ? "bg-green-100 text-green-700"
                 : "text-gray-600 hover:bg-gray-100"}`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
