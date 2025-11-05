import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import DashBoard from "./pages/DashBoard";
import WriteArticle from "./pages/WriteArticle";
import BlogTitles from "./pages/BlogTitles";
import GenrateImages from "./pages/GenrateImages";
import RemoveBackground from "./pages/RemoveBackground";
import RemoveObject from "./pages/RemoveObject";
import ReviewResume from "./pages/ReviewResume";
import Community from "./pages/Community";
import { useAuth } from "@clerk/clerk-react";
import {Toaster} from "react-hot-toast"
import NewResume from "./pages/NewResume";
import YouTubeAnalyzer from "./pages/YoutubeAnalyze";

const App = () => {
  const {getToken}=useAuth()
  useEffect(()=>{
    getToken().then((token)=>console.log(token))
  },[])
  return (
    <div className="bg-gray-50">
      <Toaster/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ai" element={<Layout />}>
          <Route index element={<DashBoard />} />
          <Route path="write-article" element={<WriteArticle />} />
          <Route path="blog-titles" element={<BlogTitles />} />
          <Route path="generate-images" element={<GenrateImages />} />
          <Route path="remove-background" element={<RemoveBackground />} />
          <Route path="remove-object" element={<RemoveObject/>} />
          <Route path="review-resume" element={<ReviewResume/>} />
          <Route path="youtube-analyze" element={<YouTubeAnalyzer/>} />
          <Route path="community" element={<Community/>} />



          <Route path="review-resume-new" element={<NewResume/>} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
