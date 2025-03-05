import { start_animations, setMatrix, get_lerp_value, get_constant_row, set_duration, hard_reset, lambda_call, get_constant_number, reorient_duration, reorient_target, reorient_duration_by_distance, get_constant, reorient_duration_by_progress, get_group_values, is_active, set_group_orientation, start_group, reverse_group_delays, stop_animations, setLerp, update_constant } from 'kooljs/worker_functions'
import { useRef } from 'react'
const animProps = {
  animator: undefined,
  animations: undefined,
  start_animation: undefined,
  render_string:"",
  ref_const:undefined,
  selected:undefined,
  timeline:undefined
}
function bg(val) { return `linear-gradient(to right, rgb(255,50,50), rgb(${val[3]}, ${val[4]}, ${val[5]})` }
function render(str) {
  str=animProps.render_string=intArrayToString(str)
  //console.log(str)
  const text_con=document.getElementById("text_container")
  text_con.textContent=animProps.render_string
}
function stringToIntArray(str) {
  return new Int8Array([...str].map(char => char.charCodeAt(0)));
}
function intArrayToString(arr) {
  //return String.fromCharCode(...arr);
  const text= String.fromCharCode(...arr)
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
return text.split(' ').map(word => {
            if (word.length > 15) {
                // Füge Leerzeichen nach 5 Buchstaben ein
                return word.match(/.{1,5}/g).join(' ');
            }
            return word;
        })
        .join(' ');
}
function Example(animator) {
  const length = 7
  animProps.boxes = new Array(length)
  
  animProps.animator = animator
  const lines=[
    "In Twitch Plays Pokémon, there was a notable Nidoking nicknamed AAAAAAAAAA (also known as The Fonz)",
    "This Pokémon became significant during the playthrough of Pokémon Red Version, starting its journey as a Nidorino caught during a Safari Zone expedition",
    "After surviving the infamous Bloody Sunday event where twelve Pokémon were released.",
    "it evolved into Nidoking after receiving a Moon Stone and became one of RED's key party"
  ]
  var longest=0
  lines.map((l,i)=>{
    const arr=stringToIntArray(l)
    if(arr.length>lines[longest].length)longest=i
    lines[i]= arr
  })
lines.map((l,i)=>{
  if(longest!=i){
    const fill_space=lines[longest].length-l.length
    const filler=new Array(fill_space).fill(0,0,fill_space)
    lines[i] = Array.from([...l,...filler])
    }
  })
  const reference_matrix = [lines[0],lines[1]]
  animProps.ref_const= animator.constant({
    type:"matrix",
    value:[lines[1],lines[2],lines[2],lines[3]]
  })
  animProps.selected=animator.constant({
    type:"number",
    value:0
  })
  animProps.animations = animator.Matrix_Lerp({
    render_callback: render,
    steps: reference_matrix,
    duration: 7,
    delay:0,
    loop:false,
    callback:{
      callback:(({id})=>{
        const value = get_lerp_value(id)
        value.map((v,i)=>{
            value[i]=Math.floor(v)
            
          })
      })
    }
  })
  animProps.timeline = animator.Timeline({
    duration: 40,
    render_interval: 40,
    length: 1,
    loop: true,
    callback: {
      callback: (({ time }) => {
        if(time==0){
        const current=get_constant_number(`${animProps.selected.id}`)        
        const possible = [0,1,2,3].filter((x)=>x!=current)
        const new_=possible[Math.floor(Math.random()*3)]
        update_constant(`${animProps.selected.id}`,"number",new_)
       reorient_target({ index: `${animProps.animations.id}`, step: 0, direction: 1, reference: get_constant_row(`${animProps.ref_const.id}`,new_), matrix_row: 1 })
       start_animations([`${animProps.animations.id}`])
        console.log("new " +new_)}
      }),
      animProps:animProps
    }
  })
  return (
    <div class="w-full h-full bg-slate-700 flex items-center justify-center">
      <div class="w-[50%] text-left h-full flex items-center justify-end  text-white" id="text_container">
       {animProps.render_string}
      </div>
    </div>
  )
}
const start_sidebar = (() => {
  animProps.animator.start_animations([animProps.timeline.id])
})
const stop_sidebar = (() => {
  animProps.animator.stop_animations([animProps.timeline.id])
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
    name: "Chain loop",
    description: `This is a demonstration on how to use MatrixChain. It will create a group of  animations for you. The MatrixChain class uses a reference matrix to switch between 2 states. You basically have a start step and a target step. The matrix lerp animations that get created have a step length of 2 however. You can update the target step, by calling the animator method.`,
    gitlink: "https://github.com/ji-podhead/kooljs/blob/main/livedemo_project/src/examples/e6.js",
  }
}
export { Example, exampleProps }

