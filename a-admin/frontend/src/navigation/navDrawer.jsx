import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export function MobileDrawer({ menu }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <div className="lg:hidden h-14 bg-white-100 flex items-center px-4">
        <button onClick={() => setOpen(true)}>
          <Menu />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-15 left-0 h-full w-64 bg-white z-50 p-4
        transform transition-transform
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button className="mb-4" onClick={() => setOpen(false)}>
          <X />
        </button>

        <nav className="space-y-2">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
