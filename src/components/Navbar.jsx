//useState for functionality (JS)
import React, {useState} from 'react';
import img1 from '../assets/logo-abante.png';
import {AiOutlineClose, AiOutlineMenu} from 'react-icons/ai';

const Navbar = () => {
  //variable nav initially set to false | setNav variable soon override's nav's false 
  const [nav, setNav] = useState(false)
  const handleNav = () => {
    setNav(!nav)
  }

  return ( //items-center = inline objects
    <div className='flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 text-black'>
      <img className='w-[175px]' src={img1} alt=""/>
      
      <ul className='hidden md:flex'>
        <li className='p-4'><a href="#home">Home</a></li>
        <li className='p-4'><a href="#about">About</a></li>
        <li className='p-4'><a href="#prices">Prices</a></li>
        <li className='p-4'><a href="#contact">Contact</a></li>
      </ul>
    
      {/* once clicked, setNav will be able to override nav (close icon: Aioutlineclose) it will be true (shows menu icon: AiOutlineMenu) */}
      <div onClick={handleNav} className='block md:hidden'>
        {nav ? <AiOutlineClose className='fixed' size={20}/> : <AiOutlineMenu size={20} />}
      </div> 

      {/* visibility of sidebar. !nav = not nav so if nav = true, !nav = false vice versa. If menu (nav) = nonvisible(false) place sidebar at left-0 (visible). If menu = visible(true) push it left -100% disappears screen */}
      <div className= {nav ? 'fixed left-0 top-0 w-[70%] h-full border-r border-r-gray-400 bg-[#ffff] ease-in-out duration-500' : 'fixed left-[-100%]'}>
      <h1 className='w-full text-3xl font-bold m-4'>
        <span className='text-[#2e8b57]'>ABA</span>
        <span className='text-[#1c382a]'>NTE</span>
      </h1>

        <ul className='uppercase p-4'>
            <li className='p-4 border-b border-gray-300'><a href="#home">Home</a></li>
            <li className='p-4 border-b border-gray-300'><a href="#about">About</a></li>
            <li className='p-4 border-b border-gray-300'><a href="#prices">Prices</a></li>
            <li className='p-4 border-b border-gray-300'><a href="#contact">Contact</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
