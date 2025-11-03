import React from 'react'
import queue from '../assets/patient.png'

const About = () => {
  return (
    <div id="about" className='w-full bg-[#f7f7f7]'>
      <div className='max-w-[1240px] mx-auto grid md:grid-cols-2'>
        <img className='w-[630px] mx-auto my-4 p-5' src={queue} alt="/" />
        <div className='flex flex-col justify-center'>
          <p className='text-[#059669] font-bold uppercase'>Patient Queue Status</p>
          <h1 className='md:text-4xl sm:text-3xl text-2xl font-bold py-2'>Real-time Queue Updates.</h1>
          <p>Walk-in or booked, Abante keeps you informed and alerts you when it’s nearly your turn. No more guesswork, no more crowding. Clinics run smoother, and patients feel reassured from the moment they arrive.</p>
        <button className='text-[#ffff] bg-[#059669] w-[200px] rounded-3xl font-medium my-6 mx-auto md:mx-0 py-3'>Request Demo</button>
        </div>
      </div>
    </div>
  )
}

export default About
