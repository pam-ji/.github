import { start_animations, setMatrix, get_lerp_value, get_constant_row, set_duration, hard_reset, lambda_call, get_constant_number, reorient_duration, reorient_target, reorient_duration_by_distance, get_constant, reorient_duration_by_progress, get_group_values, is_active, set_group_orientation, start_group, reverse_group_delays, stop_animations, set_sequence_length } from 'kooljs/worker_functions'
import { useEffect, useRef } from 'react'
const animProps = {
  reference_matrix_end :[20, -0, 0, 0, 0, 0],
  reference_matrix_start:[0, 0, 100, 33, 190, 205],
  animator: undefined,
  animations: new Map(),
  boxes: undefined,
  sidebar_animation: undefined,
  button_animation: undefined,
  start_animation: undefined,
  button_reference: undefined,
  sidebar_reference: undefined,
  timeline: undefined,
  timeline2: undefined,
  timelineid: undefined,
  timelineid2: undefined,
  sidebar_state: false,
  div_states: undefined,
  button_state: false,
  switch:undefined
}
const prefix = "e11_"
const prefix2 = "e11__"
function bg(val) { return `linear-gradient(to right, rgba(146, 33, 217,100 ), rgba(${val[3]}, ${val[4]}, ${val[5]},100)` }
function setStyle(val, id) {
  console.log(prefix + id + " " + val)
  const doc = document.getElementById(prefix + id)
  doc.style.transform = `translate(${val[0]}%,${val[1]}%)`;
  doc.style.opacity = `${val[2]}%`;
  doc.style.background = bg(val);
  const doc2 = document.getElementById("e11_" + id)
  doc2.style.opacity = `${val[2]}%`;
}
function sidebar_style(val) {
  const doc = document.getElementById("sidebar")
  doc.style.width = `${val[0]}%`;
  doc.style.background = `linear-gradient(to right, rgba(35, 43, 92,${val[1]}),rgba(${val[1]},${val[1]},${val[1]},0))`;
  doc.style.opacity = `${val[1]}%`;
}
function button_style(val) {
  var doc = document.getElementById("button_child")
  doc.style.opacity = `${val[2]}%`;
}
function OnBecomeVisible(args, targetNode) {
  // console.log("---------------")
   console.log("div" + targetNode + " intersecting: " + args[0].isIntersecting + "; Ratio: " + args[0].intersectionRatio)
  const pivot = (args[0].rootBounds.bottom + args[0].rootBounds.height / 2)
  const position = args[0].intersectionRect.y + args[0].rootBounds.height
  if (args[0].intersectionRatio ==0) {
    // if (position < pivot) {
    //   console.log(targetNode + " is popping in from the top")
    // }
    // else {
    //   console.log(targetNode + " is popping in from the bottom")
    // }
    // console.log((position))
    // console.log(pivot)
    // console.log(args[0].intersectionRect.y)
    // console.log("---------------")
    if (animProps.div_states[targetNode] == true) {
      animProps.div_states[targetNode] = false
      animProps.switch.call({
        index:animProps.animations.get(prefix+targetNode).id,
        direction:0
      })
    }
  }
  else if (animProps.div_states[targetNode] == false) {
    animProps.div_states[targetNode] = true
    animProps.switch.call({
      index:animProps.animations.get(prefix+targetNode).id,
      direction:1
    })
  }
}
function Body() {
  useEffect(() => {
    animProps.boxes.map((x, i) => {
      if (true) {//i==6 || i ==14){
        const node = document.getElementById(prefix + i)
        const options = {
          root: document.getElementById("root_div"),
          rootMargin: "0px",
          threshold: 1.0,
        };
        const observer = new IntersectionObserver(((args) => (OnBecomeVisible(args, i))), options);
        observer.observe(node);
      }
    });
  }, [])
  return (
    <div i="root_div" class="w-full h-full overflow-scroll  flex flex-col items-center justify-center">
      {animProps.boxes.map((e) => e)}
    </div>
  )
}
function Example(animator) {
  const length = 14
  animProps.boxes = new Array(length)
  animProps.div_states = new Array(length).fill(false)
  
  animProps.animator = animator
  for (let i = 0; i < length; i++) {
    animProps.animations.set(prefix + i, animator.Matrix_Lerp({
      render_callback: ((value)=>{
        setStyle(value, i)}),
      steps: [animProps.reference_matrix_end,animProps.reference_matrix_end],
      duration: 5,
      delay: 1,
      set_sequence_length: 3
    }))
    animProps.div_states[i] = false
    animProps.boxes[i] = <div class="transform h-10 w-40 left flex items-center bg-red-600 rounded-md justify-center "
      id={prefix + i} key={prefix + i} //style={{ transform: `translate(${animProps.reference_matrix_end[0]}%,${animProps.reference_matrix_end[1]}%)` }}
    >
      <div id={prefix2 + i} key={prefix2 + i} class="w-full h-full truncate   border-[#232b5c] border-2 rounded-md flex-col gap-2 items-center justify-center" >
        <div class="text-center  "><b>Div No: {i}</b></div>
        <div class="text-left w-[80%] h-[10%] pl-2" > 
          Line: --{1 + Math.floor(i / length)}--
        </div>
      </div>
    </div>
  }
  animProps.switch=animator.Lambda({callback:(({index,direction})=>{
    console.log(index)
    console.log(direction)
    reorient_duration_by_distance(
      {
        index:index,
        min_duration:5,
        max_duration:10,
        target:direction==1?[`${animProps.reference_matrix_start}`]:[`${animProps.reference_matrix_end}`],
        max_distance:205,
        mode:"max_distance"
      }
    )
    hard_reset(index)
    setMatrix(index,1, [`${animProps.reference_matrix_start}`]);
    start_animations([index])
  }),animProps:animProps})
  animProps.sidebar_reference = { start: [0, 0, 0], end: [14, 100, 100] }
  animProps.sidebar_animation = animator.Matrix_Lerp({
    render_callback: sidebar_style,
    steps: [animProps.sidebar_reference.start, animProps.sidebar_reference.end],
    duration: 15,
    delay: 3
  })
  animProps.button_reference = { start: [100, 100, 100], end: [0, 0, 0] }
  animProps.button_animation = animator.Matrix_Lerp({
    render_callback: button_style,
    steps: [animProps.button_reference.start, animProps.button_reference.end],
    duration: 5
  })
  animProps.timelineid = animator.get_size()
  animProps.timeline = animator.Timeline({
    duration: 6,
    render_interval: 2,
    length: 1,
    loop: false,
    callback: {
      callback: (({ time }) => {
        const button_state = get_lerp_value(`${animProps.button_animation.id}`)[0] == [`${animProps.button_reference.end}`][0]
        const sidebar_state = get_lerp_value(`${animProps.sidebar_animation.id}`)[0] == [`${animProps.sidebar_reference.end}`][0]
        const start = (animation, ref, min_duration, max_duration) => {
          reorient_target({ index: animation, step: 0, direction: 1, reference: ref, matrix_row: 1 })
          reorient_duration_by_progress({ index: animation, max_duration: max_duration, min_duration: min_duration, soft_reset: true, })
        }
        if (time == 0) {
          if (!button_state) {
            start(`${animProps.button_animation.id}`, [`${animProps.button_reference.end}`], 2, 4)
          }
          else if (!sidebar_state) {
            start(`${animProps.sidebar_animation.id}`, [`${animProps.sidebar_reference.end}`], 4, 6)
          }
        }
        else if (time == 2) {
          if (!sidebar_state) {
            start(`${animProps.sidebar_animation.id}`, [`${animProps.sidebar_reference.end}`], 4, 6)
          }
        }

      }),
      animProps: animProps
    }
  })
  animProps.timelineid2 = animator.get_size()
  animProps.timeline2 = animator.Timeline({
    duration: 20,
    render_interval: 1,
    length: 1,
    loop: false,
    callback: {
      callback: (({ time }) => {
        const start = (animation, ref, min, max) => {
          reorient_target({ index: animation, step: 0, direction: 1, reference: ref, matrix_row: 1 })
          reorient_duration_by_progress({ index: animation, max_duration: max, min_duration: min, soft_reset: true, })
        }
        if (time == 0) {

        }
        if (time == 2) {

          start(`${animProps.sidebar_animation.id}`, [`${animProps.sidebar_reference.start}`], 4, 4)
          start(`${animProps.button_animation.id}`, [`${animProps.button_reference.start}`], 10, 12)
        }
      }),
      animProps: animProps
    }
  })
  return (
    <div class="w-full h-full bg-slate-700">
      <div class="w-full h-full flex items-center justify-end" >
        <div id="button" class=" self-start justify-self-start min-h-[7%]  min-w-[5%] aspect-square">
          <button id="button_child" class="w-[90%] h-[90%] text-white bg-slate-800 border-4 border-[#216762]"
            onMouseEnter={(() => {
              if (animProps.button_state == false) {
                animProps.button_state = true
                start_sidebar()
              }
            })}
          >
            #
          </button>
        </div>
        <div id="sidebar" class="w-[0%] h-[43%] border-l-2 border-black  absolute z-10  rounded-md rounded-r-none ">
          <div class="w-full h-full flex flex-col justify-center gap-2 justify-items-center items-center"
            onMouseEnter={(() => {
              if (animProps.button_state == false)
                start_sidebar()
              animProps.button_state = true
            })}
            onMouseLeave={(() => { animProps.button_state = false; stop_sidebar() })}>
            <div class="w-full h-[8%] flex items-center text-center text-xl justify-center  border-b-2 border-black text-white">
              <h1>SideBar</h1>
            </div>
            <Body></Body>
          </div>
        </div>
      </div>
    </div>
  )
}
const start_sidebar = (() => {
  animProps.animator.stop_animations([animProps.timeline2.id, animProps.timeline.id])
  animProps.animator.reset_animations([animProps.timeline.id])
  animProps.animator.start_animations([animProps.timeline.id])
})
const stop_sidebar = (() => {
  animProps.animator.stop_animations([animProps.timeline2.id, animProps.timeline.id])
  animProps.animator.reset_animations([animProps.timeline2.id])
  animProps.animator.start_animations([animProps.timeline2.id])
})

const exampleProps = {

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

  \`\`\``, Controls: [
    {
      info: "calls the lambda start_animation with direction 1",
      button: {
        name: "start",
        onClick: start_sidebar
      },
    },
    {
      info: "stop the group",
      button: {
        name: "stop",
        onClick: stop_sidebar
      },
    },
  ],
  info: {
    name: "sidebar 2",
    description: `This is a demonstration on how to use MatrixChain. It will create a group of  animations for you. The MatrixChain class uses a reference matrix to switch between 2 states. You basically have a start step and a target step. The matrix lerp animations that get created have a step length of 2 however. You can update the target step, by calling the animator method.`,
    gitlink: "https://github.com/ji-podhead/kooljs/blob/main/livedemo_project/src/examples/e6.js",
  }
}
export { Example, exampleProps }

