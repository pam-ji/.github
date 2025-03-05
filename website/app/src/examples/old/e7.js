import { Prop, Animator, Lerp, Callback, Constant, Trigger } from "../../kooljs/animations"
import { useState, useEffect, useMemo, useCallback } from 'react';
var animationProps={
  a:1,
  seta:((val)=>{animate_div("a",val)}),
  b:2,
  setb:((val)=>{animate_div("b",val)}),
  c:3,
  setc:((val)=>{animate_div("c",val)}),
  animFunc:(()=>{})
}
var elem
function animate_div(id,val){
  elem=document.getElementById(id)
  elem.style.transform=`translate(${val}%)`
  console.log(elem.style.transform)
}
function e2_init(animator) {
  const aLerp = animator.Lerp({render_callback:animationProps.seta,duration:50})
  const bLerp = animator.Lerp({render_callback:animationProps.setb,duration:50})
  const cLerp = animator.Lerp({render_callback:animationProps.setc,duration:50})
  console.log(document.getElementById("a"))
  animationProps.animFunc=animate
  console.log(animationProps)
  async function animate() {
    console.log("funcs")
    try {
      animator.update_lerp([
        {   
          animObject:aLerp,
          value: {
            min: animationProps.a,
            max: 10,
          }
        },
        {
          animObject: bLerp,
          value: {
            min: animationProps.b,
            max: 20,
          }
        },
        {
          animObject: cLerp,
          value: {
            min: animationProps.c,
            max: 300,
          }
        },
      ])
    } catch (error) {
      console.log(error);
    }
  }
}
function E2(){
  return (
    <div class="w-full h-full">
      <div clas="h-15 w-full bg-slate-400">
      <button onClick={()=>{console.log("click");animationProps.animFunc()}} class="bg-white border-1 w-10 h-full">
      animate
      </button>
      </div>
      <div class="bg-red-100  w-full h-full font-size-xl flex flex-row">
        <div id="a" class="w-10 h-10 bg-blue-300">a</div>
        <div id="b" class="w-10 h-10 bg-blue-400">b</div>
        <div id="c" class="w-10 h-10 bg-blue-500">c</div>
      </div>
    </div>
  )
}
export {E2, e2_init}