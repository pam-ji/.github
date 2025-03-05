import {  hard_reset, reorient_target ,get_constant_number, get_constant_row, lambda_call, reorient_duration, start_animations, stop_animations, update_constant } from "kooljs/worker_functions"

const length = 16       //          [opacity, w,  h, fontsize,      r,g,b]
const reference_matrix = [[-100, 0, 0, 0, 0, 0, 0], [100, 80, 40, 13, 100, 130, 255]]
const animProps = {
  animator: undefined,//                 <- animator               << Animator >> 
  idle_animation: undefined,//           <- idleAnims              << Lerp >> 
  boxes: new Array(length),//           <- boxes dict             << div | MatrixLerp >> 
  indices: new Float32Array(length),//  <- anim id's              << Float32 >> 
  selected: undefined,//                <- animator.const         << number >>
  mode: undefined,//                <- animator.const         << Float32 >>
  status: undefined,//                  <- animator.const         << number >>
  reference_matrix: undefined,//        <- animator.const         << Float32 >>
  stop_active: undefined,//             <- resetting animation    << Animator.Lambda >>
  start_random: undefined,//            <- start anim             << Animator.Lambda >>
  replace_indices: undefined,//          <- edit values            << Animator.Lambda >>
  stop_idle: undefined,//                <- stops idle+active      << Animator.Lambda >>
  start_idle: undefined,//                <- starts idle+active      << Animator.Lambda >>
  set_duration_lambda: undefined,//       <- smooth start/end        << Animator.Lambda >>
  manual_selection: undefined//          <- selection event        << Animator.Lambda >>

}
function bg(val) {
  return `linear-gradient(to right, rgb(0,0,0), rgb(${val[4]}, ${val[5]}, ${val[6]})`
}
function setStyle(id, val) {
  //console.log(val)
  document.getElementById("e5_child" + id).style.opacity = `${val[0]}%`;
  document.getElementById("e5_child" + id).style.width = `${val[1]}%`;
  document.getElementById("e5_child" + id).style.height = `${val[2]}%`;
  document.getElementById("e5_child" + id).style.fontSize = `${val[3] * 2}px`;
  document.getElementById("e5_child_small" + id).style.fontSize = `${val[3]}px`;
  document.getElementById("e5_" + id).style.background = bg(val);
}
function Example(animator) {
  animProps.animator = animator
  for (let i = 0; i < length; i++) {
    animProps.boxes[i] = {
      anim: animator.Matrix_Lerp({
        render_callback: ((val) => setStyle(i, val)),
        duration: 10,
        steps: reference_matrix,
        delay:1,
        loop: false,
      }),
      div: <div
        onMouseEnter={() => {start_selected(i)}}
        class="min-w-full min-h-full flex items-center rounded-md justify-center bg-black"
        id={"e5_" + i} key={"e5_" + i}>
        <div id={"e5_child" + i} key={"e5_child" + i} class="w-0 h-0 truncate opacity-0 bg-white border-[#21d9cd] border-2 rounded-md flex-col gap-2 items-center justify-center" >
          <div class="text-center  "><b>Div No: {i}</b></div>
          <div id={"e5_child_small" + i} class="text-left w-[80%] h-[10%] pl-2" >
            Line: --{1 + Math.floor(i / 4)}--
          </div>
        </div>
      </div>
    }
    animProps.indices[i] = animProps.boxes[i].anim.id
  }
  // a variable that represents our selected div on the worker
  animProps.selected = animator.constant({ type: "number", value: 0 })
  animProps.mode = animator.constant({ type: "matrix", value: [new Uint8Array(length).fill(1,0,length)] }) // we fill with one, cause its causing weird behav. ->
  // a constant that represents our reference matrix on the worker
  animProps.reference_matrix = animator.constant({
    type: "matrix",
    value: reference_matrix
  })

  // a constant that represents the indices of animated divs in our worker-registry 
  animProps.indices = animator.constant({
    type: "matrix",
    value: [animProps.indices]
  })
  // inverts all divs if their value is not the start value
  animProps.stop_active = animator.Lambda({
    callback: (() => {
      const indices=get_constant_row(`${animProps.indices.id}`, 0)
      //stop_animations(indices)
        indices.map((i,i2) => {
          //soft_reset(i)
          console.log(get_constant_row(`${animProps.mode.id}`, 0)[i2])
          if (get_constant_row(`${animProps.mode.id}`, 0)[i2]==1) {
            get_constant_row(`${animProps.mode.id}`, 0)[i2]=0
            console.log("reorienting animation " + i)
            hard_reset(i)
            reorient_duration({index:i,min_duration:3,max_duration:8})
            //reorient_duration_by_progress({index:i,min_duration:3,max_duration:8})
            reorient_target({index:i,step:0,direction:1, reference:get_constant_row(`${animProps.reference_matrix.id}`, 0),matrix_row:0, verbose:true})
            start_animations([i])
          }
      })
    }),
    animProps: animProps
  })
  // set duration to 10 if progress < 5

  animProps.start_random = animator.Lambda({
    callback: (() => {
      const indices = get_constant_row(`${animProps.indices.id}`, 0)
      const r=Math.floor(Math.random() * indices.length)
      const random_index = indices[r]
      console.log("new random selection is " + random_index)
      update_constant(`${animProps.selected.id}`, "number", random_index)
      reorient_duration({index:random_index,min_duration:5,max_duration:15})
      reorient_target({index:random_index,step:0,direction:1, reference:get_constant_row(`${animProps.reference_matrix.id}`, 1),matrix_row:0, verbose:true})
      start_animations([random_index])
      get_constant_row(`${animProps.mode.id}`, 0)[r]=1
      console.log(get_constant_row(`${animProps.mode.id}`, 0))
    }),
    animProps: animProps
  })
  // our idle animation that is stopped/started once a user-mouse-event interacts with the grid
  // we use the renderinterval and duration to create some sort of animation-timeline
  // this way we only fire 20 function calls on the worker during one animation ciclus
  animProps.idle_animation = animator.Timeline({
    duration: 100,
    render_interval: 20,
    length: 1,
    loop: true,
    callback: {
      callback: (({ time }) => {
        if(time==0 || time==80) console.log("----------timeline event----------")
        console.log("time " + time)
        if (time == 0) {
          lambda_call(`${animProps.start_random.id}`)
        }
        else if (time == 80) {
          const selected_index = get_constant_number(`${animProps.selected.id}`)
          console.log("reverting animation " + selected_index)
          reorient_duration({index:selected_index,min_duration:3,max_duration:8})
          reorient_target({index:selected_index,step:0,direction:1, reference:get_constant_row(`${animProps.reference_matrix.id}`, 0),matrix_row:0, verbose:true})
          start_animations([selected_index])
          get_constant_row(`${animProps.mode.id}`, 0)[`${animProps.selected.id}`]=1
         
        }
        if(time==0 || time==80)  console.log("--------------------------------")
      }),
      animProps: animProps
    }
  })
  // a function we can call to stop the idle animation
  animProps.stop_idle = animator.Lambda({
    callback: (() => {
      stop_animations([`${animProps.idle_animation.id}`])
      hard_reset(`${animProps.idle_animation.id}`)
      lambda_call(`${animProps.stop_active.id}`)
    }),
    animProps: animProps
  })
  animProps.start_idle = animator.Lambda({
    callback: (() => {
      hard_reset(get_constant_number(`${animProps.idle_animation.id}`))
      lambda_call(`${animProps.stop_active.id}`)
      start_animations([`${animProps.idle_animation.id}`])
    }),
    animProps: animProps
  })
animProps.manual_selection=animator.Lambda({
  callback:(({id})=>{
   
    const index=get_constant_row(`${animProps.indices.id}`, 0)[id]
    lambda_call(`${animProps.stop_idle.id}`,)
    console.log("starting manual animation with index " + index)
    update_constant(`${animProps.selected.id}`,"number", index)
    reorient_duration({index:index,min_duration:5,max_duration:15})
    reorient_target({index:index,step:0,direction:1, reference:get_constant_row(`${animProps.reference_matrix.id}`, 1),matrix_row:0, verbose:true})
    
    
    start_animations([index])
    get_constant_row(`${animProps.mode.id}`, 0)[id]=1
    console.log(get_constant_row(`${animProps.mode.id}`, 0))
  }),
  animProps:animProps
})
  return (
    <div class="w-full h-full bg-slate-700"
      onMouseEnter={start_idle}
      onMouseLeave={start_idle}
    >
      <div class="w-full h-full flex items-center justify-center">
        <div onMouseEnter={stop_idle}
          class="w-[95%] h-[95%] bg-[#21d9cd] border-4 border-[#21d9cd] grid grid-cols-4 gap-1 rounded-md justify-center justify-items-center items-center">
          {animProps.boxes.map((e) => e.div)}
        </div>
      </div>
    </div>
  )
}
const start_selected = ((id) => {
  requestAnimationFrame(() => {
    animProps.manual_selection.call({id:id})  
  })
  
})
const stop_idle = (() => {
  animProps.stop_idle.call()
})
const start_idle = (() => {
  animProps.start_idle.call()
})
const start = (() => {
  animProps.animator.start()
})
const stop = (() => {
  animProps.animator.stop()
})


const exampleProps = {
// this is just util stuff for the example project
 mdFile: `\`\`\`javascript
import { get_time, stop_animations, setMatrix, get_lerp_value, soft_reset, hard_reset, set_duration, get_constant_number, get_constant_row, update_constant, lambda_call,start_animations, get_active, is_active, set_delta_t, set_time, reorient_target, reorient_duration } from "kooljs/worker"
const length = 16       //          [opacity, w,  h, fontsize,      r,g,b]
const reference_matrix = [[-100, 0, 0, 0, 0, 0, 0], [100, 80, 40, 13, 100, 130, 255]]
const animProps = {
  animator: undefined,//                 <- animator               << Animator >> 
  idle_animation: undefined,//           <- idleAnims              << Lerp >> 
  boxes: new Array(length),//           <- boxes dict             << div | MatrixLerp >> 
  indices: new Float32Array(length),//  <- anim id's              << Float32 >> 
  selected: undefined,//                <- animator.const         << number >>
  status: undefined,//                  <- animator.const         << number >>
  reference_matrix: undefined,//        <- animator.const         << Float32 >>
  stop_active: undefined,//             <- resetting animation    << Animator.Lambda >>
  start_random: undefined,//            <- start anim             << Animator.Lambda >>
  replace_indices: undefined,//          <- edit values            << Animator.Lambda >>
  stop_idle: undefined,//                <- stops idle+active      << Animator.Lambda >>
  start_idle: undefined,//                <- starts idle+active      << Animator.Lambda >>
  set_duration_lambda: undefined,//       <- smooth start/end        << Animator.Lambda >>
  manual_selection: undefined//          <- selection event        << Animator.Lambda >>
}
function bg(val) {
  return \`linear-gradient(to right, rgb(0,0,0), rgb(\${val[4]}, \${val[5]}, \${val[6]})\`
}
function setStyle(id, val) {
  //console.log(val)
  document.getElementById("e5_child" + id).style.opacity = \`\${val[0]}%\`;
  document.getElementById("e5_child" + id).style.width = \`\${val[1]}%\`;
  document.getElementById("e5_child" + id).style.height = \`\${val[2]}%\`;
  document.getElementById("e5_child" + id).style.fontSize = \`\${val[3] * 2}px\`;
  document.getElementById("e5_child_small" + id).style.fontSize = \`\${val[3]}px\`;
  document.getElementById("e5_" + id).style.background = bg(val);
}
function Example(animator) {
  animProps.animator = animator
  for (let i = 0; i < length; i++) {
    animProps.boxes[i] = {
      anim: animator.Matrix_Lerp({
        render_callback: ((val) => setStyle(i, val)),
        duration: 10,
        steps: reference_matrix,
        delay:2,
        loop: false,
      }),
      div: <div
        onMouseEnter={() => {start_selected(animProps.indices.value[0][i])}}
        class="min-w-full min-h-full flex items-center rounded-md justify-center bg-black"
        id={"e5_" + i} key={"e5_" + i}>
        <div id={"e5_child" + i} key={"e5_child" + i} class="w-0 h-0 truncate opacity-0 bg-white border-[#21d9cd] border-2 rounded-md flex-col gap-2 items-center justify-center" >
          <div class="text-center  "><b>Div No: {i}</b></div>
          <div id={"e5_child_small" + i} class="text-left w-[80%] h-[10%] pl-2" >
            Line: --{1 + Math.floor(i / 4)}--
          </div>
        </div>
      </div>
    }
    animProps.indices[i] = animProps.boxes[i].anim.id
  }
  // a variable that represents our selected div on the worker
  animProps.selected = animator.constant({ type: "number", value: 0 })
  // a constant that represents our reference matrix on the worker
  animProps.reference_matrix = animator.constant({
    type: "matrix",
    value: reference_matrix
  })

  // a constant that represents the indices of animated divs in our worker-registry 
  animProps.indices = animator.constant({
    type: "matrix",
    value: [animProps.indices]
  })
  // inverts all divs if their value is not the start value
  animProps.stop_active = animator.Lambda({
    callback: (() => {
      const indices=get_constant_row(\`\${animProps.indices.id}\`, 0)
      indices.map((i) => {
          if (get_constant_row(\`\${animProps.reference_matrix.id}\`, 0) != get_lerp_value(i)) {
            reorient_duration({index:i,min_duration:3,max_duration:8})
            reorient_target({index:i,step:0,direction:1, reference:get_constant_row(\`\${animProps.reference_matrix.id}\`, 0),matrix_row:0, verbose:true})
            
            start_animations([i])
          }

      })
    }),
    animProps: animProps
  })
  // set duration to 10 if progress < 5

  animProps.start_random = animator.Lambda({
    callback: (() => {
      const indices = get_constant_row(\`\${animProps.indices.id}\`, 0)
      const random_index = indices[Math.floor(Math.random() * indices.length)]
      console.log("new random selection is " + random_index)
      update_constant(\`\${animProps.selected.id}\`, "number", random_index)
      reorient_duration({index:random_index,min_duration:5,max_duration:15})
      reorient_target({index:random_index,step:0,direction:1, reference:get_constant_row(\`\${animProps.reference_matrix.id}\`, 1),matrix_row:0, verbose:true})
      start_animations([random_index])
    }),
    animProps: animProps
  })
  // our idle animation that is stopped/started once a user-mouse-event interacts with the grid
  // we use the renderinterval and duration to create some sort of animation-timeline
  // this way we only fire 20 function calls on the worker during one animation ciclus
  animProps.idle_animation = animator.Timeline({
    duration: 100,
    render_interval: 20,
    length: 1,
    loop: true,
    callback: {
      callback: (({ time }) => {
        if(time==0 || time==80) console.log("----------timeline event----------")
        console.log("time " + time)
        if (time == 0) {
          lambda_call(\`\${animProps.start_random.id}\`)
        }
        else if (time == 80) {
          const selected_index = get_constant_number(\`\${animProps.selected.id}\`)
          console.log("reverting animation " + selected_index)
          reorient_duration({index:selected_index,min_duration:3,max_duration:8})
          reorient_target({index:selected_index,step:0,direction:1, reference:get_constant_row(\`\${animProps.reference_matrix.id}\`, 0),matrix_row:0, verbose:true})
          start_animations([selected_index])
         
        }
        if(time==0 || time==80)  console.log("--------------------------------")
      }),
      animProps: animProps
    }
  })
  // a function we can call to stop the idle animation
  animProps.stop_idle = animator.Lambda({
    callback: (() => {
      stop_animations([\`\${animProps.idle_animation.id}\`])
      hard_reset(\`\${animProps.idle_animation.id}\`)
      lambda_call(\`\${animProps.stop_active.id}\`)
    }),
    animProps: animProps
  })
  animProps.start_idle = animator.Lambda({
    callback: (() => {
      hard_reset(get_constant_number(\`\${animProps.idle_animation.id}\`))
      lambda_call(\`\${animProps.stop_active.id}\`)
      start_animations([\`\${animProps.idle_animation.id}\`])
    }),
    animProps: animProps
  })
animProps.manual_selection=animator.Lambda({
  callback:(({id})=>{
    lambda_call(\`\${animProps.stop_idle.id}\`,)
    console.log("starting manual animation with index " + id)
    update_constant(\`\${animProps.selected.id}\`,"number", id)
    reorient_duration({index:id,min_duration:5,max_duration:15})
    reorient_target({index:id,step:0,direction:1, reference:get_constant_row(\`\${animProps.reference_matrix.id}\`, 1),matrix_row:0, verbose:true})
    
    start_animations([id])
  }),
  animProps:animProps
})
  return (
    <div class="w-full h-full bg-slate-700"
      onMouseEnter={start_idle}
      onMouseLeave={start_idle}
    >
      <div class="w-full h-full flex items-center justify-center">
        <div onMouseEnter={stop_idle}
          class="w-[95%] h-[95%] bg-[#21d9cd] border-4 border-[#21d9cd] grid grid-cols-4 gap-1 rounded-md justify-center justify-items-center items-center">
          {animProps.boxes.map((e) => e.div)}
        </div>
      </div>
    </div>
  )
}
const start_selected = ((id) => {
  animProps.manual_selection.call({id:id})
})
const stop_idle = (() => {
  animProps.stop_idle.call()
})
const start_idle = (() => {
  animProps.start_idle.call()
})
const start = (() => {
  animProps.animator.start()
})
const stop = (() => {
  animProps.animator.stop_animations("all")
})

// we use a lot of reorient here. I originally wrote the code for hose function for this example, but i noticed it comes in handy for a lot of stuff, so i added it to the worker.
// this lets you revert animations so you can smoothly play a backwards animation
// animProps.replace_indices = animator.Lambda({
  //   callback: (({ index, ref_step }) => {
  //     console.log("replacing indices " + index)
  //     setMatrix(index, 0, get_lerp_value(index))
  //     setMatrix(index, 1, get_constant_row(\`\${animProps.reference_matrix.id}\`, ref_step))
  //     soft_reset(index)
  //     const time=is_active(index)?get_time(index):0
  //     if(ref_step==1){
  //       const duration = time < 5 ? Math.floor(15 - time) : 15
  //       set_duration(index, duration)
  //       console.log("new start_duration for " + index + " is " + duration)
  //     }
  //     else{
  //       const duration = time < 3 ? 8-time:8
  //       set_duration(index, duration )
  //       console.log("new revert_duration for " + index + " is " + duration)
  //     }
      
  //     console.log("started" + ref_step==0?"reverting":"start"+"_animation with index " + index)
  //   }),
  //   animProps: animProps
  // })
  \`\`\``,
Controls : [
  {
    info: "Stops the animation sequence using the function thats running on the worker.",
    button: {
      name: "idle start",
      onClick: start_idle
    },
  },
  {
    info: "Stops the animation sequence using the function thats running on the worker.",
    button: {
      name: "stop idle",
      onClick: stop_idle
    },
  },
  {
    info: "This event will continues to play any animation, that was running before calling stop().",
    button: {
      name: "start",
      onClick: start
    }
  },
  {
    info: "This event will pause the animation-loop, but any running animations wont reset when you call start() again.",
    button: {
      name: "stop",
      onClick: stop
    },
  },
],
info :{
  gitlink: "https://github.com/ji-podhead/kooljs/blob/main/livedemo_project/src/examples/e3.js",
  name: "callbacks",
  description : `This example demonstrates how to create animations using a sequence instead of min/max values.
  you can change the sequence by calling animator.update(). If you dont specify the max length of the sequence using the sequence_max_lengt argument, the length of the initial array will be used.
  `
}
}
export { Example, exampleProps }

