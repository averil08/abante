import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChartNoAxesCombined, TicketCheck, Calendar } from "lucide-react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import img1 from '../assets/logo-abante.png';


const Sidebar = ({ nav, handleNav }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-52 bg-gray-50 border-r border-gray-300 shadow-lg flex-col">
        <img className="w-[175px] m-4" src={img1} alt="Logo" />
        <ul className="mt-8 text-sm text-gray-700">
          <li
            className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white cursor-pointer"
            onClick={() => navigate("/dashboard")}>
            <Users className="w-5 h-5 text-green-600 group-hover:text-white" /> 
            Clinic Dashboard
          </li>
          <li
            className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white cursor-pointer"
            onClick={() => navigate("/analytics")}>
            <ChartNoAxesCombined className="w-5 h-5 text-green-600 group-hover:text-white" /> 
            Clinic Analytics
          </li>

          <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" onClick={() => navigate("/appointment")}>
            <Calendar className="w-5 h-5 text-green-600 group-hover:text-white" />
            Appointments
          </li>

          <li
            className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white cursor-pointer"
            onClick={() => navigate("/checkin")}>
            <TicketCheck className="w-5 h-5 text-green-600 group-hover:text-white" /> 
            Patient Check-In
          </li>
        </ul>
      </div>

      {/* MOBILE HAMBURGER ICON */}
      <div
        className="md:hidden fixed top-10 right-10 z-50"
        onClick={handleNav}>
        {nav ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
      </div>

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white z-50 shadow-lg transform transition-transform duration-300
          ${nav ? "translate-x-0" : "-translate-x-full"} md:hidden`}>
        <img className="w-[175px] m-10" src={img1} alt="Logo" />
        <ul className="mt-10 text-sm text-gray-700">
          <li
            className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white cursor-pointer"
            onClick={() => navigate("/dashboard")}>
            <Users className="w-5 h-5 text-green-600 group-hover:text-white" /> 
            Clinic Dashboard
          </li>
          <li
            className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white cursor-pointer"
            onClick={() => navigate("/analytics")}>
            <ChartNoAxesCombined className="w-5 h-5 text-green-600 group-hover:text-white" /> 
            Clinic Analytics
          </li>
          <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" onClick={() => navigate("/appointment")}>
            <Calendar className="w-5 h-5 text-green-600 group-hover:text-white" />
            Appointments
          </li>
          <li
            className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white cursor-pointer"
            onClick={() => navigate("/checkin")}>
            <TicketCheck className="w-5 h-5 text-green-600 group-hover:text-white" /> 
            Patient Check-In
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
