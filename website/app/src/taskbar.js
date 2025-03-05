import { get_lerp_value,reorient_target,reorient_duration_by_progress,get_group_values,set_group_orientation,start_group,stop_animations } from 'kooljs/worker_functions'
const animProps = {
  animator: undefined,
  animations: undefined,
  boxes: undefined,
  sidebar_animation: undefined,
  button_animation: undefined,
  button_reference: undefined,
  sidebar_reference: undefined,
  timeline: undefined,
  timeline2: undefined,
  timelineid: undefined,
  timelineid2: undefined,
  sidebar_state: false,
  button_state: false
}
function bg(val) { return `linear-gradient(to right, rgba(146, 33, 217,100 ), rgba(${val[3]}, ${val[4]}, ${val[5]},100)` }
function setStyle(items, prefix) {
  items.forEach((val, id) => {
    //console.log(prefix+id+" " + val)
    const doc = document.getElementById(prefix + id)
    doc.style.transform = `translate(${val[0]}%,${val[1]}%)`;
    doc.style.opacity = `${val[2]}%`;
    doc.style.background = bg(val);
    const doc2 = document.getElementById("e11_" + id)
    doc2.style.opacity = `${val[2]}%`;
  })
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
function Taskbar(animator) {
  const length = 7
  animProps.boxes = new Array(length)
  const reference_matrix = []
  animProps.animator = animator
  const a = [20, -10, 0, 0, 0, 0]
  const b = [0, 0, 100, 33, 190, 205]
  const c = [-0, 50, 0, 0, 0, 0]
  reference_matrix.push([a, b, c]) // uni size reference matrix, so it can be used for all boxes
  for (let i = 0; i < length; i++) {
    animProps.boxes[i] = <div class="transform h-10 w-40 left flex items-center rounded-md justify-center " id={"e11__" + i} key={"e11__" + i} style={{ transform: `translate(0%,0%)` }}>
      <div id={"e11_" + i} key={"e11_" + i} class="w-full h-full truncate opacity-0  border-[#232b5c] border-2 rounded-md flex-col gap-2 items-center justify-center" >
        <div class="text-center  "><b>Div No: {i}</b></div>
        <div class="text-left w-[80%] h-[10%] pl-2" >
          Line: --{1 + Math.floor(i / length)}--
        </div>
      </div>
    </div>
  }
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
  animProps.animations = animator.Matrix_Chain({
    reference_matrix: reference_matrix,
    length: length,
    min_duration: 3,
    max_duration: 3,
    group_loop: false,
    sequence_length: 1,
    id_prefix: "e11__",
    callback: setStyle,
    custom_delay: {
      callback: ({ animation_index, index, indices, progress, direction, target_step }) => {
        const rev = (spread)=> `${animProps.delay}` + (indices.length - index) * (`${animProps.delay_spread}`)*spread
         const forw=(spread)=> `${animProps.delay}` + (index) * (`${animProps.delay_spread}`)*spread
      if (direction == 1) {
          if(target_step[0]==0){
          return forw(1)
        }
        return forw(1)
        }
        else {
          if(target_step[0]==1|| target_step[0]==0){
            return rev(1)
          }
            return forw(1)
        }
      },
      animProps: {delay: 0,delay_spread: 1}
    },
  })
  animProps.timelineid = animator.get_size()
  animProps.timeline = animator.Timeline({
    duration: 6,
    render_interval: 2,
    length: 1,
    loop: false,
    callback: {
      callback: (({ time }) => {
        const sidebar_state = get_lerp_value(`${animProps.sidebar_animation.id}`)[0]
        const start = (animation, ref, min_duration, max_duration) => {
          reorient_target({ index: animation, step: 0, direction: 1, reference: ref, matrix_row: 1 })
          reorient_duration_by_progress({ index: animation, max_duration: max_duration, min_duration: min_duration, soft_reset: true, })
        }
          const start_group_forward=(reorient)=>{
            set_group_orientation(`${animProps.animations.id}`, [0, 1])          
            start_group([1], [`${animProps.animations.id}`], reorient ? "progress" : true)
                }
        if (time == 0) {
          const button_state = get_lerp_value(`${animProps.button_animation.id}`)[0] == [`${animProps.button_reference.end}`][0]
          if (!button_state) {
            start(`${animProps.button_animation.id}`, [`${animProps.button_reference.end}`], 2, 4)
          }
          else if (sidebar_state!= [`${animProps.sidebar_reference.start}`][0]) {
            start(`${animProps.sidebar_animation.id}`, [`${animProps.sidebar_reference.end}`], 4, 6)
          }
          if(sidebar_state>5) { 
            start_group_forward(true)
            stop_animations([`${animProps.timelineid}`])
          }
        }
        else if (time == 2) {
           if (sidebar_state!= [`${animProps.sidebar_reference.end}`][0]){
            start(`${animProps.sidebar_animation.id}`, [`${animProps.sidebar_reference.end}`], 4, 6)
          }
           if(sidebar_state>5) { 
            start_group_forward(true)
            stop_animations([`${animProps.timelineid}`])
          }
        }
        else if (time == 6) {
          start_group_forward(false)
          stop_animations([`${animProps.timelineid}`])
        }
      }),
      animProps: animProps
    }
  })
  animProps.timelineid2 = animator.get_size()
  animProps.timeline2 = animator.Timeline({
    duration: 10,
    render_interval: 1,
    length: 1,
    loop: false,
    callback: {
      callback: (({ time }) => {
        const group_values = get_group_values(`${animProps.animations.id}`)
        const start = (animation, ref, min, max) => {
          reorient_target({ index: animation, step: 0, direction: 1, reference: ref, matrix_row: 1 })
          reorient_duration_by_progress({ index: animation, max_duration: max, min_duration: min, soft_reset: true, })
        }
        const start_group_backwards=()=>{
          set_group_orientation(`${animProps.animations.id}`, [2,1])
          start_group([0], [`${animProps.animations.id}`], true)
        }
        if (time == 0) {
          if (get_lerp_value(`${animProps.sidebar_animation.id}`)[0] > [`${animProps.sidebar_reference.end}`][0]/2) {
            start_group_backwards()
          }
          start(`${animProps.sidebar_animation.id}`, [`${animProps.sidebar_reference.start}`], 10, 10)
        }
        if ( time == 4) {
          start(`${animProps.button_animation.id}`, [`${animProps.button_reference.start}`], 10, 12)
           stop_animations([`${animProps.timelineid2}`])
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
              }})}
          >
            #
          </button>
        </div>
        <div id="sidebar" class="w-[0%] h-[43%] border-l-2 border-black  absolute z-10  rounded-md rounded-r-none ">
          <div class="w-full h-full flex flex-col justify-center gap-2 justify-items-center items-center overflow-hidden" // 
            onMouseEnter={(() => {
              if (animProps.button_state == false)
                start_sidebar()
              animProps.button_state = true
            })}
            onMouseLeave={(() => { animProps.button_state = false; stop_sidebar() })}>
            <div class="w-full h-[8%] flex items-center text-center text-xl justify-center  border-b-2 border-black text-white">
              <h1>SideBar</h1>
            </div>
            {animProps.boxes.map((e) => e)}
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
 mport { get_lerp_value,reorient_target,reorient_duration_by_progress,get_group_values,set_group_orientation,start_group,stop_animations } from 'kooljs/worker_functions'
const animProps = {
  animator: undefined,
  animations: undefined,
  boxes: undefined,
  sidebar_animation: undefined,
  button_animation: undefined,
  button_reference: undefined,
  sidebar_reference: undefined,
  timeline: undefined,
  timeline2: undefined,
  timelineid: undefined,
  timelineid2: undefined,
  sidebar_state: false,
  button_state: false
}
function bg(val) { return \`linear-gradient(to right, rgba(146, 33, 217,100 ), rgba(\${val[3]}, \${val[4]}, \${val[5]},100)\` }
function setStyle(items, prefix) {
  items.forEach((val, id) => {
    //console.log(prefix+id+" " + val)
    const doc = document.getElementById(prefix + id)
    doc.style.transform = \`translate(\${val[0]}%,\${val[1]}%)\`;
    doc.style.opacity = \`\${val[2]}%\`;
    doc.style.background = bg(val);
    const doc2 = document.getElementById("e11_" + id)
    doc2.style.opacity = \`\${val[2]}%\`;
  })
}
function sidebar_style(val) {
  const doc = document.getElementById("sidebar")
  doc.style.width = \`\${val[0]}%\`;
 doc.style.background = \`linear-gradient(to right, rgba(35, 43, 92,\${val[1]}),rgba(\${val[1]},\${val[1]},\${val[1]},0))\`;
 doc.style.opacity = \`\${val[1]}%\`;
}
function button_style(val) {
  var doc = document.getElementById("button_child")
  doc.style.opacity = \`\${val[2]}%\`;
}
function Example(animator) {
  const length = 7
  animProps.boxes = new Array(length)
  const reference_matrix = []
  animProps.animator = animator
  const a = [20, -10, 0, 0, 0, 0]
  const b = [0, 0, 100, 33, 190, 205]
  const c = [-0, 50, 0, 0, 0, 0]
  reference_matrix.push([a, b, c]) // uni size reference matrix, so it can be used for all boxes
  for (let i = 0; i < length; i++) {
    animProps.boxes[i] = <div class="transform h-10 w-40 left flex items-center rounded-md justify-center " id={"e11__" + i} key={"e11__" + i} style={{ transform: \`translate(0%,0%)\` }}>
      <div id={"e11_" + i} key={"e11_" + i} class="w-full h-full truncate opacity-0  border-[#232b5c] border-2 rounded-md flex-col gap-2 items-center justify-center" >
        <div class="text-center  "><b>Div No: {i}</b></div>
        <div class="text-left w-[80%] h-[10%] pl-2" >
          Line: --{1 + Math.floor(i / length)}--
        </div>
      </div>
    </div>
  }
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
  animProps.animations = animator.Matrix_Chain({
    reference_matrix: reference_matrix,
    length: length,
    min_duration: 3,
    max_duration: 3,
    group_loop: false,
    sequence_length: 1,
    id_prefix: "e11__",
    callback: setStyle,
    custom_delay: {
      callback: ({ animation_index, index, indices, progress, direction, target_step }) => {
        const rev = (spread)=> \`\${animProps.delay}\` + (indices.length - index) * (\`\${animProps.delay_spread}\`)*spread
         const forw=(spread)=> \`\${animProps.delay}\` + (index) * (\`\${animProps.delay_spread}\`)*spread
      if (direction == 1) {
          if(target_step[0]==0){
          return forw(1)
        }
        return forw(1)
        }
        else {
          if(target_step[0]==1|| target_step[0]==0){
            return rev(1)
          }
            return forw(1)
        }
      },
      animProps: {delay: 0,delay_spread: 1}
    },
  })
  animProps.timelineid = animator.get_size()
  animProps.timeline = animator.Timeline({
    duration: 6,
    render_interval: 2,
    length: 1,
    loop: false,
    callback: {
      callback: (({ time }) => {
        const sidebar_state = get_lerp_value(\`\${animProps.sidebar_animation.id}\`)[0]
        const start = (animation, ref, min_duration, max_duration) => {
          reorient_target({ index: animation, step: 0, direction: 1, reference: ref, matrix_row: 1 })
          reorient_duration_by_progress({ index: animation, max_duration: max_duration, min_duration: min_duration, soft_reset: true, })
        }
          const start_group_forward=(reorient)=>{
            set_group_orientation(\`\${animProps.animations.id}\`, [0, 1])          
            start_group([1], [\`\${animProps.animations.id}\`], reorient ? "progress" : true)
                }
        if (time == 0) {
          const button_state = get_lerp_value(\`\${animProps.button_animation.id}\`)[0] == [\`\${animProps.button_reference.end}\`][0]
          if (!button_state) {
            start(\`\${animProps.button_animation.id}\`, [\`\${animProps.button_reference.end}\`], 2, 4)
          }
          else if (sidebar_state!= [\`\${animProps.sidebar_reference.start}\`][0]) {
            start(\`\${animProps.sidebar_animation.id}\`, [\`\${animProps.sidebar_reference.end}\`], 4, 6)
          }
          if(sidebar_state>5) { 
            start_group_forward(true)
            stop_animations([\`\${animProps.timelineid}\`])
          }
        }
        else if (time == 2) {
           if (sidebar_state!= [\`\${animProps.sidebar_reference.end}\`][0]){
            start(\`\${animProps.sidebar_animation.id}\`, [\`\${animProps.sidebar_reference.end}\`], 4, 6)
          }
           if(sidebar_state>5) { 
            start_group_forward(true)
            stop_animations([\`\${animProps.timelineid}\`])
          }
        }
        else if (time == 6) {
          start_group_forward(false)
          stop_animations([\`\${animProps.timelineid}\`])
        }
      }),
      animProps: animProps
    }
  })
  animProps.timelineid2 = animator.get_size()
  animProps.timeline2 = animator.Timeline({
    duration: 10,
    render_interval: 1,
    length: 1,
    loop: false,
    callback: {
      callback: (({ time }) => {
        const group_values = get_group_values(\`\${animProps.animations.id}\`)
        const start = (animation, ref, min, max) => {
          reorient_target({ index: animation, step: 0, direction: 1, reference: ref, matrix_row: 1 })
          reorient_duration_by_progress({ index: animation, max_duration: max, min_duration: min, soft_reset: true, })
        }
        const start_group_backwards=()=>{
          set_group_orientation(\`\${animProps.animations.id}\`, [2,1])
          start_group([0], [\`\${animProps.animations.id}\`], true)
        }
        if (time == 0) {
          if (get_lerp_value(\`\${animProps.sidebar_animation.id}\`)[0] > [\`\${animProps.sidebar_reference.end}\`][0]/2) {
            start_group_backwards()
          }
          start(\`\${animProps.sidebar_animation.id}\`, [\`\${animProps.sidebar_reference.start}\`], 4, 6)
        }
        if ( time == 4) {
          start(\`\${animProps.button_animation.id}\`, [\`\${animProps.button_reference.start}\`], 10, 12)
           stop_animations([\`\${animProps.timelineid2}\`])
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
              }})}
          >
            #
          </button>
        </div>
        <div id="sidebar" class="w-[0%] h-[43%] border-l-2 border-black  absolute z-10  rounded-md rounded-r-none ">
          <div class="w-full h-full flex flex-col justify-center gap-2 justify-items-center items-center overflow-hidden" // 
            onMouseEnter={(() => {
              if (animProps.button_state == false)
                start_sidebar()
              animProps.button_state = true
            })}
            onMouseLeave={(() => { animProps.button_state = false; stop_sidebar() })}>
            <div class="w-full h-[8%] flex items-center text-center text-xl justify-center  border-b-2 border-black text-white">
              <h1>SideBar</h1>
            </div>
            {animProps.boxes.map((e) => e)}
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
    name: "sidebar 1",
    description: `This is a demonstration of a sidebar that has no scrolling animation. It uses several states in the matrix chain animation to lerp between them based on the paramers.`,
    gitlink: "https://github.com/ji-podhead/kooljs/blob/main/livedemo_project/src/examples/e6.js",
  }
}
export { Example, exampleProps }

