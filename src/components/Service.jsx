import React from 'react'
import feature from '../assets/features.png'
import dashboard from '../assets/dashboard1.png'
import queue from '../assets/queue.png'
import analytics from '../assets/analytics.png'


const Service = () => {
  return (
    <div className='w-full bg-[#ffff]'>
        <img className='w-[1000px] mt-20 mx-auto' src={feature} alt="/" />
        <div className='mx-auto text-center flex flex-col justify-center'>
          <h1 className='text-[#059669] md:text-3xl sm:text-2xl text-xl font-bold pt-9 pb-2 uppercase'>Phases of Smarter Patient Queueing</h1>
          <p>From booking to departure, discover how technology keeps queues moving smoothly.</p>
        </div>

        <div className='w-full py-[10rem] px-4'>
          <div className='max-w-[1240px] mx-auto grid md:grid-cols-3 gap-8'>
            <div className='w-full shadow-xl flex flex-col p-10 my-10 rounded-lg hover:scale-105 duration-300'>
              <img className='w-60 mx-auto mt-[-7rem] '
              src={queue} alt="/" />
              <h2 className='text-[#555555] md:text-2xl sm:text-xl text-xl font-bold text-center py-3'>Registration & Notifications</h2>
              <p className='text-center text-1xl font-normal'>Whether walk-in or booked, patients easily register, join the queue, and get automatic alerts on their turn.</p>
            </div>

            <div className='w-full shadow-xl flex flex-col p-10 my-10 rounded-lg hover:scale-105 duration-300'>
              <img className='w-60 mx-auto mt-[-7rem]'
              src={dashboard} alt="/" />
              <h2 className='text-[#555555] md:text-2xl sm:text-xl text-xl font-bold text-center py-3'>Clinic Dashboard</h2>
              <p className='text-center text-1xl font-normal'>Manage queues on any device and see real-time updates — smooth operations, even on hectic days.</p>
            </div>

             <div className='w-full shadow-xl flex flex-col p-10 my-10 rounded-lg hover:scale-105 duration-300'>
                <img className='w-60 mx-auto mt-[-7rem] '
                src={analytics} alt="/" />
                <h2 className='text-[#555555] md:text-2xl sm:text-xl text-xl font-bold text-center py-3'>Analytics</h2>
                <p className='text-center text-1xl font-normal'>Get instant insights on patient flow and staff efficiency to make smarter, faster decisions.</p>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Service
