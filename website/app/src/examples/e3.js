const length = 30
const elements=new Array(length)
const indices= new Float32Array(length)
const min_width=30
var animator_instance,new_min,width
var red,green,blue,bg_gradient

function bg(val){
  red= (255*(val/100))/4
  green= 0
  blue= (255*(val/100))
  bg_gradient=`linear-gradient(to right, rgb(20,0,40), rgb(${red}, ${green}, ${blue})`
  return bg_gradient
}
function setWidth(id,val){
  document.getElementById("e3_"+id).style.width = `${val}%`;
  document.getElementById("e3_"+id).style.background=bg(val);
}
function randomWidth(min,max){
  new_min=(Math.random()*(max-min))
  return([min+new_min,Math.random()*(max-new_min)])
}
function Example(animator) {
    animator_instance=animator
    for (let i=0;i<length;i++){
      width=randomWidth(min_width,100)
      elements[i]=
        {
          anim: animator.Lerp({ 
          render_callback:((val)=>setWidth(i,val)), 
          duration: Math.floor(10+(60*Math.random())), 
          delay:Math.floor(Math.random()*60),
          steps: [width[0],width[1],width[0]],
          loop:true,
          }),
          div: <div id={"e3_"+i} key={"e3_"+i} style={{width:width[0]+"%", height: 100/length+"%",  backgroundImage: bg(width[0])}}>i: {i}</div>,
          width: width
      }
      indices[i]=elements[i].anim.id
    }
    return (
    <div class="w-full h-full bg-slate-700 flex items-center content center justify-center">
      <div class="w-[95%] h-[95%]  rounded-md  border-4 border-[#21d9cd] ">
        
        <div class="shrink-0 items-start justify-center w-full h-full font-size-xl flex flex-col">
          {
            elements.map((e)=>(e.div))
          }          
        </div>
      </div>
    </div>
  )}
const start=(()=>{
    animator_instance.start_animations(indices)
})
const stop=(()=>{
  animator_instance.stop_animations("all")
})
const reset=(()=>{
  animator_instance.reset_animations(indices)
})
const init=(()=>{
  animator_instance.init()
})
const exampleProps = {
  
  // this is just util stuff for the example project
  mdFile:`\`\`\`javascript
  const length = 30
const elements=new Array(length)
const indices= new Float32Array(length)
const min_width=30
var animator_instance,new_min,width
var red,green,blue,bg_gradient
function bg(val){
  red= (255*(val/100))/4
  green= 0
  blue= (255*(val/100))
  bg_gradient=\`linear-gradient(to right, rgb(20,0,40), rgb(${red}, ${green}, ${blue})\`
  return bg_gradient
}
function setWidth(id,val){
  document.getElementById("e3_"+id).style.width = \`\${val}%\`;
  document.getElementById("e3_"+id).style.background=bg(val);
}
function randomWidth(min,max){
  new_min=(Math.random()*(max-min))
  return([min+new_min,Math.random()*(max-new_min)])
}
function Example(animator) {
    animator_instance=animator
    for (let i=0;i<length;i++){
      width=randomWidth(min_width,100)
      elements[i]=
        {
          anim: animator.Lerp({ 
          render_callback:((val)=>setWidth(i,val)), 
          duration: Math.floor(10+(60*Math.random())), 
          delay:Math.floor(Math.random()*60),
          steps: [width[0],width[1],width[0]],
          loop:true,
          }),
          div: <div id={"e3_"+i} key={"e3_"+i} style={{width:width[0]+"%", height: 100/length+"%",  backgroundImage: bg(width[0])}}>i: {i}</div>,
          width: width
      }
      indices[i]=elements[i].anim.id
    }
    return (
    <div class="w-full h-full bg-[#ffffff]">
      <div class="w-full h-full">
        <div class="shrink-0 items-start justify-center w-full h-full font-size-xl flex flex-col">
          {
            elements.map((e)=>(e.div))
          }          
        </div>
      </div>
    </div>
  )}
const start=(()=>{
    animator_instance.start_animations(indices)
})
const stop=(()=>{
  animator_instance.stop_animations("all")
})
const reset=(()=>{
  animator_instance.reset_animations("all")
})
const init=(()=>{
  animator_instance.init()
})
  \`\`\``,
Controls:[
  {
    info:" This Event will start the animation with the values lerpPoint values that where set the last time. The initial values are the ones we have used for the initialisation of the Lerpclass: [0.1, 400.1 ,0.1 ,100, 20, 30, 40, 500, 0]",
    button:{
      name:"start",
      onClick: start
    }
  },
  {
    info:"Stops the animation sequence.",
    button:{
      name:"stop",
      onClick:() => {stop() }
    },
  },
  {
    info:"Resets the animation sequence.",
    button:{
      name:"reset",
      onClick:() => {reset() }
    },
  },
  {
    info:"initliazes the animator. Note that if you updated the sequence, the original sequece will get copied to the worker, since this is the initial value that is stored in the animator.",
    button:{
      name:"initialize Animator",
      onClick:() => {init() }
    }
  },   
],
info:{
  name:"Animation Squences",
description:`This example demonstrates how to create animations using a sequence instead of min/max values.
you can change the sequence by calling animator.update(). If you dont specify the max length of the sequence using the sequence_max_lengt argument, the length of the initial array will be used.
`,
  gitlink:"https://github.com/ji-podhead/kooljs/blob/main/livedemo_project/src/examples/e3.js",
}
}
export { Example, exampleProps }

