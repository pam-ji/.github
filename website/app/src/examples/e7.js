import   {start_animations,setMatrix,get_lerp_value, get_constant_row,set_duration, hard_reset, lambda_call, get_constant_number, reorient_duration, reorient_target, reorient_duration_by_distance, get_constant, reorient_duration_by_progress} from 'kooljs/worker_functions'
const animProps={
  animator: undefined,//                 <- animator               << Animator >> 
  animations: undefined,//           <- boxes dict             << div | MatrixLerp >> 
  boxes: undefined,//  <- anim id's              << Float32 >> 
}
function bg(val) { return `linear-gradient(to right, rgb(255,50,50), rgb(${val[3]}, ${val[4]}, ${val[5]})`}
function setStyle(items,prefix) {
  items.forEach((val,id)=>{
    // console.log("--------------")
    // console.log(id)
    // console.log(...val)
  const doc=document.getElementById(prefix+id)
  doc.style.transform = `translate(${val[0]}%,${val[1]}%)`;
  doc.style.opacity = `${val[2]}%`;
  doc.style.background = bg(val);
})
}
function Example(animator) {
  const length=3
  animProps.boxes = new Array(length)
  const reference_matrix = []
  animProps.animator = animator
  for (let i = 0; i < length; i++) {
    const normal= i/length
    const start_step=[100,-0.2,0,0,0,0]
    const end_step=[0,0,100,normal*150,normal*50,normal*255]
    reference_matrix.push([start_step,end_step])
    animProps.boxes[i] =  <div class="h-10 w-40 flex items-center rounded-md justify-center " id={"e7__" + i} key={"e7__" + i} style={{top: start_step[1] + "%",left:start_step[0] + "%"}}>
        <div id={"e7_" + i} key={"e7_" + i} class="w-full h-full truncate opacity-0 bg-white border-[#21d9cd] border-2 rounded-md flex-col gap-2 items-center justify-center" >
          <div class="text-center  "><b>Div No: {i}</b></div>
          <div class="text-left w-[80%] h-[10%] pl-2" >
            Line: --{1 + Math.floor(i / length)}--
          </div>
        </div>
      </div>
  }
 animProps.animations= animator.Matrix_Chain({
  reference_matrix:reference_matrix,
  length:length,
  delay:1,                  
  min_duration:10,
  max_duration:15,
  start_step:0,
  target_step:1,
  group_loop:false,
  id_prefix:"e7_",
  callback:setStyle,
  custom_delay:{
    callback:({animation_index,index,indices,progress,direction,target_step})=>{
      if(direction==1) {
          const new_delay=`${animProps.delay}`+(indices.length-index)*`${animProps.delay_spread}`
          return new_delay
        }
        else{
          const new_delay=`${animProps.delay}`+(index)*`${animProps.delay_spread}`
          return new_delay
        }
        
    },
    animProps:{
      delay:0,
      delay_spread:2
    }
  },

 })
  return (
    <div class="w-full h-full bg-slate-700">
      <div class="w-full h-full flex items-center justify-center">
        <div 
          class="w-[95%] h-[95%]  border-4 border-[#21d9cd]  flex flex-col rounded-md justify-center justify-items-center items-center">
          {animProps.boxes.map((e) => e)}
        </div>
      </div>
    </div>
  )
}
const start_sidebar=(()=>{
    animProps.animator.start_groups([animProps.animations.id],[1])
})
const reverse_sidebar=(()=>{
  animProps.animator.start_groups([animProps.animations.id],[0])
})
const set_sequence_1=(()=>{
  animProps.animator.set_group({id: animProps.animations.id,field:"sequence_length", value:1})
})
const set_sequence_2=(()=>{
  animProps.animator.set_group({id: animProps.animations.id,field:"sequence_length", value:2})
})
 
  // animProps.start_timeline = animator.Timeline({
  //   duration: 100,
  //   render_interval: 20,
  //   length: 1,
  //   loop: true,
  //   callback: {
  //     callback: (({ time }) => {
  //       if(time==0 || time==80) console.log("----------timeline event----------")
  //       console.log("time " + time)
  //       if (time == 0) {
  //         lambda_call(`${animProps.start_random.id}`)
  //       }
  //       else if (time == 80) {
  //         const selected_index = get_constant_number(`${animProps.selected.id}`)
  //         console.log("reverting animation " + selected_index)
  //         reorient_duration({index:selected_index,min_duration:3,max_duration:8})
  //         reorient_target({index:selected_index,step:0,direction:1, reference:get_constant_row(`${animProps.reference_matrix.id}`, 0),matrix_row:0, verbose:true})
  //         start_animations([selected_index])
         
  //       }
  //       if(time==0 || time==80)  console.log("--------------------------------")
  //     }),
  //     animProps: animProps
  //   }
  // })

//old
// animProps.reference_matrix= animator.constant({
//   type: "matrix",
//   value: reference_matrix
// })
// animProps.indices= animator.constant({
//   type: "matrix",
//   value: [animProps.indices]
// })
// animProps.reorient = animator.Lambda({
//   callback:  (({indices,direction,ref_matrix,max_distance,max_duration,min_duration})=>{
//     indices.map((index,i)=>{
//       const current= get_lerp_value(index)
//       const ref=ref_matrix.get((i*2)+direction)
//       if(ref[1]==current){
//         return console.log("target animation is reachead")
//       }
//       max_distance=0
//       current.map((c,i)=>{
//         const distance =Math.abs(c-ref[i])
//        max_distance=max_distance<distance?distance:max_distance
//        }
//        )
//       hard_reset(index)
//       reorient_target({
//         index:index,
//         step:0,
//         direction:1,
//         matrix_row:0,
//         verbose:true,
//         reference:ref
//       });
//       const duration = reorient_duration_by_progress({
//         index:index,
//         min_duration:min_duration,
//         max_duration:max_duration,
//     })
//     console.log(`index: ${index} i: ${i} 
//       new_duration ${duration}
//       current_position: ${current[0]}, ${current[1]} target_position ${ref[0]}, ${ref[1]} `
//     )
//     })
//   })
// })
// animProps.start_animation = animator.Lambda({
//   callback:  ((direction)=>{
//     const ref_matrix=get_constant(`${animProps.reference_matrix.id}`,"matrix")
//     const indices=get_constant_row(`${animProps.indices.id}`,0)
//     lambda_call(`${animProps.reorient.id}`,{
//       indices:indices,
//       direction:direction,
//       ref_matrix:ref_matrix,
//       max_distance:`${animProps.max_distance}`,
//       max_duration:`${animProps.max_duration}`,
//       min_duration:`${animProps.min_duration}`
//     })
//     start_animations(indices)
//   }),
//   animProps:animProps
// }) 
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
    info:"calls the lambda start_animation with direction 1",
    button:{
      name:"start forward",
      onClick: start_sidebar
    },
  },  
  {
    info:"calls the lambda start_animation with direction 0",
    button:{
      name:"start reverse",
      onClick: reverse_sidebar
    },
  },
  {
    info:"sets the sequence length to 1",
    button:{
      name:"set length: 1",
      onClick: set_sequence_1
    },
  },
  {
    info:"sets the sequence length to 2",
    button:{
      name:"set length: 2",
      onClick: set_sequence_2
    },
  },
  
],
info:{
  name:"Chains",
  description:`This is a demonstration on how to use MatrixChain. It will create a group of  animations for you. The MatrixChain class uses a reference matrix to switch between 2 states. You basically have a start step and a target step. The matrix lerp animations that get created have a step length of 2 however. You can update the target step, by calling the animator method.`,
  gitlink:"https://github.com/ji-podhead/kooljs/blob/main/livedemo_project/src/examples/e6.js",
}
}
export { Example, exampleProps}

