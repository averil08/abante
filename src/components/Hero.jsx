import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div id="home" className='text-[#0003]'>
      <div className='max-w-[800px] mt-[-98px] w-full h-screen mx-auto text-center flex flex-col justify-center'>
        <h1 className='text-[#059669] md:text-7xl sm:text-6xl text-4xl font-bold'>Queue Management: Walk-ins and Appointments</h1>  
        <p className='text-black md:text-2xl sm:text-xl text-xl font-semibold pt-6'>Smart Waiting, Better Healing</p>
        <p className='text-black text-lg p-2'>Relieve up to 25% of front desk workload with smarter queueing, real-time updates and automated reminders</p>
        <Link to="/register">
          <button className='text-[#ffff] bg-[#059669] w-[200px] rounded-3xl font-medium my-6 mx-auto py-3'>Sign Up</button>
        </Link>
      </div>
    </div>
  )
}

export default Hero;
