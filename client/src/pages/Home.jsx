import React from 'react'
import Navbar from '../components/NavBar'
import Hero from '../components/Hero'
import { AITools } from '../components/AITools'
import Plan from '../components/Plan'

const Home = () => {
  return (
    <>
        <Navbar/>
        <Hero/>
        <AITools/>
        <Plan/>
        
    </>
  )
}

export default Home