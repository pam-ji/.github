
import "./App.css";
import { useState, useEffect, useMemo, useCallback, use } from "react";
import { Animator } from "kooljs/animator"
import { FontAnimation, start, stop } from "./main_animation"
import {  Header } from "./utils"
const animator = new Animator(50)
function Font() {
  var temp
  useMemo(() => {
     temp =  FontAnimation(animator)     
    animator.init(true);
    start()
}, []);
return temp
}
function App() {
 
  return (
    <div class="App  bg-[#242d36] w-full h-full flex   items-center justify-center  " style={{ width: window.innerWidth, height: window.innerHeight }}>
     <div class=" w-[96%]  h-[96%] flex flex-col items-center justify-center rounded-md border-4  border-[#020202] ">
      <div class=" w-full  h-[7%] " >
        <Header />
      </div>
      <div class="flex  w-full h-[93%] bg-white   items-center justify-center">
      <Font></Font>
        </div>
      </div>
    </div>
  );
}
export default App;
