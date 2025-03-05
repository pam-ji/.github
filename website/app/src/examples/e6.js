import   {start_animations,setMatrix,get_lerp_value, get_constant_row,set_duration, hard_reset, reorient_duration_by_distance} from "kooljs/worker_functions"
const animProps={
  animator:undefined,//                      <- animator               << Animator >> 
  start_animation:undefined,//               <- random values + start  << Animator.Lambda >>
  size_animation:undefined,//                <- single number lerp     << Lerp >>
  size_constant:undefined,//                 <- xy                     << Constant-Matrix >>
  color_animation:undefined,//               <- xyz                    << MatrixLerp >> 
  size_constant_id:undefined,//              <- we need before init    << Number >>
  size_duration_max:40//                     <- duration               << Number >>
}
function bg(val){
  return `linear-gradient(to right, rgb(0,0,0), rgb(${val[0]}, ${val[1]}, ${val[2]})`
}
function setStyle(val){
  //console.log(val)
  document.getElementById("inner").style.width = `${Math.floor(val[0])}%`;
  document.getElementById("inner").style.height = `${Math.floor(val[1])}%`;
}
function Example(animator) {
    animProps.animator=animator
    animProps.color_animation=animator.Matrix_Lerp({
      render_callback:((val)=>document.getElementById("main").style.background = (bg(val))),
      steps:[[0,0,0],[50,50,255]],
      duration:animProps.size_duration_max
    })
    animProps.size_animation=animator.Matrix_Lerp({ 
        render_callback:((val)=>setStyle(val)),
        duration: animProps.size_duration_max, 
        steps: [[1,1],[100,100]],
    })
    animProps.size_constant_id=animator.get_constant_size("matrix")+1
    animProps.start_animation = animator.Lambda({
      callback:  (()=>{
        setMatrix(`${animProps.color_animation.id}`,1, [Math.random()*50, Math.random()*50, Math.random()*255]);
        const current= get_lerp_value(`${animProps.size_animation.id}`)
        const target_matrix=get_constant_row(`${animProps.size_constant_id}`,0)
        if(target_matrix==current){
          target_matrix[0]+=1
          target_matrix[1]+=1
        }
        hard_reset(`${animProps.size_animation.id}`)
        setMatrix(`${animProps.size_animation.id}`,1, target_matrix);
        console.log("target " +target_matrix)
        console.log("current " +current)
        const duration = reorient_duration_by_distance({
            index:`${animProps.size_animation.id}`,
            target:target_matrix,
            max_distance:100,
            min_duration:2,
            max_duration:`${animProps.size_duration_max}`,
            mode: "max_distance"
        })
        console.log("new duration " +duration)
        start_animations([`${animProps.size_animation.id}`])
      }),
      animProps:animProps
    }) 
    animProps.size_constant=animator.constant({
      type:"matrix",
      value:[[1,1]],
      render_triggers:[animProps.color_animation.id],                       // the trigger fields starts color_animation
      render_callbacks:[{id:animProps.start_animation.id,args: undefined }] // the callback fields starts start_animation
    })

    return (
    <div class="w-full h-full bg-slate-700">
      <div class="w-full h-full flex items-center justify-center">
      <div id={"main"} key={"main"} class="w-[95%] h-[95%] bg-blackapp/src/examples/e6.js border-4 border-[#21d9cd] flex rounded-md justify-center justify-items-center items-center">
      <div id={"inner"} key={"inner"} class="w-1 h-1 bg-white">
          inner
      </div>
      </div>
    </div>
    </div>
  )}
const set_size=(()=>{
    animProps.animator.update_constant([{type:"matrix",id:animProps.size_constant.id,value:[[(30+Math.random()*70),30+Math.random()*70]]}])
})

const exampleProps={
  
  // this is just util stuff for the example project
 mdFile: `\`\`\`javascript
 import   {start_animations,setMatrix,get_lerp_value, get_constant_row,set_duration} from 'kooljs/worker'
const animProps={
  animator:undefined,//                      <- animator               << Animator >> 
  start_animation:undefined,//               <- random values + start  << Animator.Lambda >>
  size_animation:undefined,//                <- single number lerp     << Lerp >>
  size_constant:undefined,//                 <- xy                     << Constant-Matrix >>
  color_animation:undefined,//               <- xyz                    << MatrixLerp >> 
  size_constant_id:undefined,//              <- we need before init    << Number >>
  size_duration_max:10//                     <- duration               << Number >>
}
function bg(val){
  return \`linear-gradient(to right, rgb(0,0,0), rgb(\${val[0]}, \${val[1]}, \${val[2]})\`
}
function setStyle(val){
  //console.log(val)
  document.getElementById("inner").style.width = \`\${Math.floor(val[0])}%\`;
  document.getElementById("inner").style.height = \`\${Math.floor(val[1])}%\`;
}
function Example(animator) {
    animProps.animator=animator

    animProps.color_animation=animator.Matrix_Lerp({
      render_callback:((val)=>document.getElementById("main").style.background = (bg(val))),
      steps:[[0,0,0],[50,50,255]],
      duration:animProps.size_duration_max
    })
    animProps.size_animation=animator.Matrix_Lerp({ 
        render_callback:((val)=>setStyle(val)),
        duration: animProps.size_duration_max, 
        steps: [[1,1],[100,100]],
    })
    animProps.size_constant_id=animator.get_constant_size("matrix")+1

    animProps.start_animation = animator.Lambda({
      callback:  (()=>{
        setMatrix(\`\${animProps.color_animation.id}\`,1, [Math.random()*50, Math.random()*50, Math.random()*255]);
        // for the size animations of the div
        console.log(\`\${animProps.size_animation.id}\`)
        const current= get_lerp_value(\`\${animProps.size_animation.id}\`)
        const target=get_constant_row(\`\${animProps.size_constant_id}\`,0)
        if(target==current){
          target[0]+=1
          target[1]+=1
        }
        const duration = (Math.max(...target.map((val, index) => Math.abs((val - current[index])+0.1)))/70)+1*\`\${animProps.size_duration_max}\`;
        console.log("duration " +duration)
        setMatrix(\`\${animProps.size_animation.id}\`,1, target);
        set_duration(\`\${animProps.size_animation.id}\`, duration )
        start_animations([\`\${animProps.size_animation.id}\`])
      }),
      animProps:animProps
    }) 

    animProps.size_constant=animator.constant({
      type:"matrix",
      value:[[70,70]],
      render_triggers:[animProps.color_animation.id],                       // the trigger fields starts color_animation
      render_callbacks:[{id:animProps.start_animation.id,args: undefined }] // the callback fields starts start_animation
    })

    return (
    <div class="w-full h-full bg-slate-700">
      <div class="w-full h-full flex items-center justify-center">
      <div id={"main"} key={"main"} class="w-[95%] h-[95%] bg-[#21d9cd] border-4 border-[#21d9cd] flex rounded-md justify-center justify-items-center items-center">
      <div id={"inner"} key={"inner"} class="w-10 h-10 bg-white">
          inner
      </div>
      </div>
    </div>
    </div>
  )}
const set_size=(()=>{
    animProps.animator.update_constant([{type:"matrix",id:animProps.size_constant.id,value:[[(30+Math.random()*70),30+Math.random()*70]]}])
})

  \`\`\``, Controls:[
  {
    info:"updates the constant and starts one animation by trigger and one by callback",
    button:{
      name:"set random size",
      onClick: set_size
    },
  },
],
info:{
  name:"constant triggers",
  description:` This is a demonstration about how to use constant triggers and callbacks when updating it. You can use the render_triggers and render_callbacks fields in the constant contstructor. They will get trigger/called when you update the constructor.`,
  gitlink:"https://github.com/ji-podhead/kooljs/blob/main/livedemo_project/src/examples/e6.js",
}
}
export { Example, exampleProps}

