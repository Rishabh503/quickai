import { sql } from "../configs/db.js";

export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.auth();
    const creations =
      await sql`SELECT * FROM creations WHERE user_id=${userId} ORDER BY created_at DESC`;
    return res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
export const getPublishedCreations = async (req, res) => {
  try {
    const { userId } = req.auth();
    const creations = await sql`SELECT * FROM creations WHERE publish=true `;
    return res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
export const toogleLikeCreation = async (req, res) => {
  try {
    const { userId } = req.auth();
    const {id}=req.body

    const [creation ]= await sql`SELECT * FROM creations WHERE id=${id}`;
    if(!creation){
        return res.json({success:false,message:"creation not found"})
    }
    const currentLikes=creation.likes;  
     const userIdstr=userId.toString()
     let updatedLikes;
     let message;
    if(currentLikes.includes(userIdstr)){
        updatedLikes=currentLikes.filter((user)=>user!==userIdStr);
        message="creation unliked"
    }else{
        updatedLikes=[...currentLikes,userIdstr]
        message='creation failed'
    }
    const formattedArray=`{${updatedLikes.json(',')}}`
    await sql`UPDATE creations SET likes=${formattedArray}::text[] WHERE id=${id}`
    return res.json({ success: true, message });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
