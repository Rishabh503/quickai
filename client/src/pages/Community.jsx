import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { dummyPublishedCreationData } from '../assets/assets';
import { Heart } from 'lucide-react';

import axios from "axios"
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
axios.defaults.baseUrl = import.meta.env.VITE_BASE_URL;
// get-publish-creations

const Community = () => {
  const [creations, setCreations] = useState([]);
  const { user } = useUser();
    const [loading,setLoading]=useState(false)
    const {getToken}=useAuth()
  const fetchCreations = async()=>{
    try {
      setLoading(true)
      const {data}=await axios.get('/api/user/get-publish-creations',
        {
        headers:{Authorization:`Bearer ${await getToken()}`}
      }
      )

    if(data.success){
        console.log('did data come ?',data.creations)
      setCreations(data.creations);
      setLoading(false)
    }
    
    } catch (error) {
      console.log(error,"this is the error")
      toast.error(error.message)
    }
  
  }

  const toggleLike = async (id) => {
  try {
    const { data } = await axios.post(
      "/api/user/toggle-like-creations",
      { id },
      {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      }
    );

    if (data.success) {
      toast.success(data.message);
      // update likes locally
      setCreations((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, likes: data.likes } : item
        )
      );
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error("Failed to like/unlike");
    console.error(error);
  }
};


  useEffect(()=>{
    if(user){
      fetchCreations()
    }
  },[user])

  return (
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      <h2 className="text-xl font-semibold">Welcome, {user?.firstName}</h2>
     <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
  {creations.map((creation, index) => (
    <div
      key={index}
      className='relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3'
    >
      <img
        src={creation.content}
        alt=""
        className='w-full h-full object-cover rounded-lg'
      />

     <div className="absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80 text-white">
  <p className="text-sm hidden group-hover:block">{creation.prompt}</p>
  <div className="flex gap-1 items-center">
    <p>{creation.likes.length}</p>
    <Heart
  onClick={() => toggleLike(creation.id)}
  className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${
    creation.likes.includes(user.id)
      ? "fill-red-500 text-red-600"
      : "text-white"
  }`}
/>

  </div>
</div>
    </div>
  ))}
</div>
    </div>
  );
};

export default Community;
