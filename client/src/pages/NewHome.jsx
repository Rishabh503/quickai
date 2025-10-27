import React from 'react'
import { useLayoutEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import ScrollStack, { ScrollStackItem } from '../components/reactbits/ScrollStack';
// import ScrollStack, { ScrollStackItem } from './ScrollStack'
const NewHome = () => {
  return (
<>

<ScrollStack>
  <ScrollStackItem itemClassName='bg-red-200 text-2xl'>
    <h2>Card 1</h2>
    <p>This is the first card in the stack</p>
  </ScrollStackItem>
  <ScrollStackItem itemClassName='bg-green-200'>
    <h2>Card 2</h2>
    <p>This is the second card in the stack</p>
  </ScrollStackItem>
  <ScrollStackItem itemClassName='bg-blue-200' >
    <h2>Card 3</h2>
    <p>This is the third card in the stack</p>
  </ScrollStackItem>
</ScrollStack>
</>
  )
}

export default NewHome

