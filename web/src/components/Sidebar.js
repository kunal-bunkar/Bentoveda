import React from 'react';

function Sidebar() {
  return (
    <aside className="hidden md:block w-64 bg-gray-800 text-white p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Bentoveda</h2>
      <nav className="space-y-4">
        <a href="#home" className="block py-2 px-4 rounded hover:bg-gray-700 transition">
          Home
        </a>
        <a href="#about" className="block py-2 px-4 rounded hover:bg-gray-700 transition">
          About
        </a>
        <a href="#services" className="block py-2 px-4 rounded hover:bg-gray-700 transition">
          Services
        </a>
        <a href="#contact" className="block py-2 px-4 rounded hover:bg-gray-700 transition">
          Contact
        </a>
      </nav>
    </aside>
  );
}

export default Sidebar;
