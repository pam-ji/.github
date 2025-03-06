import { get_lerp_value} from 'kooljs/worker_functions'
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
function FontAnimation(animator) {
  animProps.animator = animator
  const lines=[
    "",
    "Hi and welcome,",
    "we are Pamji, a team of developers",
    "we are currently working on a new project called kooljs",
    "Have a look around and also check our git!",
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
    value:lines
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
      callback:`(({id})=>{
        const value = this.get_lerp_value(id)
        value.map((v,i)=>{
            value[i]=Math.floor(v)
          })
      })`
    }
  })
  animProps.timeline = animator.Timeline({
    duration: 40,
    render_interval: 40,
    length: 1,
    loop: true,
     callback:{
      callback:`(({ time }) => {
        if(time==0){
        var current=this.get_constant_number(${animProps.selected.id})        
        const new_=current+1>4?0:current+1
        this.update_constant(${animProps.selected.id},"number",new_)
       this.reorient_target({ index: ${animProps.animations.id}, step: 0, direction: 1, reference: this.get_constant_row(${animProps.ref_const.id},new_), matrix_row: 1 })
       this.start_animations([${animProps.animations.id}])
        }

      })`}
  })
  return (
    <div class="w-full h-full bg-slate-700 flex items-center justify-center">
      <div class="-[65%] text-center text-5xl h-full flex items-center justify-end font-bold  text-white" id="text_container">
       {animProps.render_string}
      </div>
    </div>
  )
}
const start = (() => {
  animProps.animator.start_animations([animProps.timeline.id])
})
const stop = (() => {
  animProps.animator.stop_animations([animProps.timeline.id])
})

export { start, stop,FontAnimation }

