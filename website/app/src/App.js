
import "./App.css";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Animator } from "kooljs/animator"
import { Example as E13 } from "./examples/e13"
import {  Header } from "./utils"
const Animated_Components = []
const animator = new Animator(50)
function App() {
  const Info  = useEffect(() => {
      const temp=E13(animator)     
      animator.init(true);
      return temp
  }, []);
  return (
    <div class="App  bg-[#242d36] w-full h-full flex   items-center justify-center  " style={{ width: window.innerWidth, height: window.innerHeight }}>
     <div class=" w-[96%]  h-[96%] flex flex-col items-center justify-center rounded-md border-4  border-[#BF8DE1] ">
      <div class=" w-full  h-[7%] " >
        <Header />
      </div>
      <div class="flex  w-full h-[93%] bg-red-50   items-center justify-center">
      <Info></Info>
        </div>
      </div>
    </div>
  );
}
export default App;
