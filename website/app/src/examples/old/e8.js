// import { Prop, Animator, Lerp,  Constant,  } from "../kooljs/animations"
// import { useState, useEffect, useMemo, useCallback } from 'react';
// const animationObjects = {}
// var animationProps={
//   w:0,
//   setw:(()=>{}),
//   h:0,
//   seth:(()=>{}),
//   t:0,
//   sett:(()=>{}),
// }
// function e1_init(animator) {
//   const screenWidthProp = new Prop("useState", [animationProps.w, animationProps.wset])
//   const screenHeightProp = new Prop("useState", [animationProps.h, animationProps.hset])
//   const triggerProp = new Prop("useState", [animationProps.t, animationProps.tset])
//   const callback1={callback:'((index,value,progress)=>get_value(1)*-1)'}
//   const constant1= new Constant(animator,"number",2)
//   animationObjects.triggerobj = new Lerp(animator, triggerProp, 10, 1,undefined,undefined,undefined,1,10)
//   //animationObjects.screenWidth = new Lerp(animator,screenWidthProp,50,1,30, new Trigger(animationObjects.triggerobj,5))
//   animationObjects.screenHeight = new Lerp(animator,screenHeightProp,50,1,30,undefined,undefined, undefined,undefined)
//   window.addEventListener('resize', zoom);
//   window.addEventListener('orientationchange', zoom);
//   window.onbeforeunload = function () {
//     window.removeEventListener('resize', zoom);
//     window.removeEventListener('orientationchange', zoom);
//     return ({})
//   };
//   async function zoom() {
//     try {
//       animator.update_constant([
//         {
//           constant:constant1,
//           value: constant1.value+1
//         }
//       ])
//       animator.update_lerp([
//         {   
//           animObject: animationObjects.screenWidth,
//           value: {
//             min: animationProps.w,
//             max: window.innerWidth,
//           }
//         },
//         {
//           animObject: animationObjects.screenHeight,
//           value: {
//             min: animationProps.h,
//             max: window.innerHeight,
//           }
//         },
//       ])
//     } catch (error) {
//       console.log(error);
//     }
//   }
// }

// function E1() {
//    // ----------------------------------------------------------------------
//   //  Those are the the parameters we define for managing the Animations.
//   //  We also define some UseState Values that will get animated in exampleMain.js.
//   //  w & h are the animated  screenSize parameter we use in the other examples.
//   // -----------------------------------------------------------------------
//   const [w, wset] = new useState(window.innerWidth)
//   const [h, hset] = new useState(window.innerHeight)
//   const [t, tset] = new useState(0)
//   useEffect(() => {
//     animationProps={w,wset,h,hset,t,tset}
//   })
//   useMemo(() => {
//     console.log("---------------------------")
//     console.log(`${w} ${window.innerWidth} | ${h} ${window.innerHeight}  | ${t}   `)
//     console.log("---------------------------")
//   }, [w,h,t])
//   return (
//     <div class="w-full h-full">
//       {w}
//       <div class="bg-black w-full h-full font-size-xl"  style={{ width: w, height: h, }}>
//       </div>
//     </div>
//   )
// }
// export { e1_init, E1 }