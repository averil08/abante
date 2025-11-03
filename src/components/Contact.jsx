import React from 'react'
import queue from '../assets/queue.png'
import onboard from '../assets/onboarding.png'
import ticket from '../assets/ticket.png'

const contact = () => {
  return (
    <div id="prices" className='w-full py-16 bg-[#f7f7f7] px-4'>
      <div className='max-w-[1240px] mx-auto grid lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <h1 className='md:text-4xl sm:text-3xl text-2xl font-bold py-2'>Want to integrate <span className='text-[#059669]'>Abante</span> to your workflow?</h1>
          <p>Send us your email to get in touch with us.</p>
        </div>

        <div className='my-[-10px]'>
          <div className='flex flex-col sm:flex-row items-center justify-between w-full p-3'>
            <input className='p-3 w-full rounded-md text-black' type="email" placeholder='Enter your email' />
            <button className='text-[#ffff] bg-[#059669] w-[200px] rounded-xl font-medium ml-4 my-6 px-6 py-3'>Send Now</button>
          </div>
          <p>We care about the protection of your data.</p>
        </div>
      </div>

      <div className='max-w-[1240px] mx-auto grid md:grid-cols-2 gap-8 mt-14'>
        <div className='w-full shadow-xl flex flex-col p-7 my-14 rounded-lg hover:scale-105 duration-300'>
          <img className='w-60 mx-auto mt-[-3rem]' src={onboard} alt="/" />
          <h2 className='text-[#555555] md:text-2xl sm:text-xl text-xl font-bold text-center py-3'>Onboard Licensing</h2>
          <h3 className='text-[#555555] text-center font-semibold'>₱++</h3>
          <div className='text-center font-medium text-[#555555] '>
             <p className='py-2 border-b mx-8 mt-8'>Patient booking</p>
             <p className='py-2 border-b mx-8'>Queue Management</p>
            <p className='py-2 border-b mx-8'>Clinic dashboard and analytics</p>
          </div>
        </div>

        <div className='w-full shadow-xl flex flex-col p-7 my-14 rounded-lg hover:scale-105 duration-300'>
          <img className='w-60 mx-auto mt-[-3rem]' src={ticket} alt="/" />
          <h2 className='text-[#555555] md:text-2xl sm:text-xl text-xl font-bold text-center py-3'>Queue Tickets</h2>
           <h3 className='text-[#555555] text-center font-semibold'>₱++</h3>
          <div className='text-center font-medium text-[#555555] '>
             <p className='py-2 border-b mx-8 mt-8'>100–300 tickets</p>
             <p className='py-2 border-b mx-8'>750 tickets</p>
            <p className='py-2 border-b mx-8'>1000 tickets</p>
          </div>
        </div>
      </div>
    </div>
  )   
}

export default contact
