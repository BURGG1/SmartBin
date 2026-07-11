import { NavLink } from "react-router-dom";

export function BottomNav({ menu }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 lg:hidden">
      <div className="flex justify-around py-2">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center text-xs
               ${isActive ? "text-green-600" : "text-gray-500"}`
            }
          >
            <item.icon size={22} />
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
