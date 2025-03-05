import ExampleDescription from "../utils/utils";

// this is our placeholder dict for the elements that get animated
var animationProps = {
  set: ((val,id) => {
    // if(val==0){
    // console.log(`val ${val} id ${id}`)  
    // }
    document.getElementById(`e3_${id}`).style.transform = `translate(0%,${val}%)`;
    }),
    animationTrigger:undefined,
    trigger_set:((val,id) => {
    // console.log(val)
     document.getElementById('trigger_3').style.width = `${val}%`;

    }),
    animator:undefined,
}
// utility functions to start the animation and update the sequence
const start=(()=>{
    animationProps.animator.start_animations([animationProps.animationTrigger.id])
   })
// the divs that get animated
function Example(animator) {
    animationProps.animator=animator
    const div_containers=[]
    const triggerduration=200
    const triggers=[]
    var t
    const amount = 50
    for (let i=1; i<=amount;i++){
      t=(animator.Lerp({render_callback: animationProps.set, duration: 10, steps: [0, 100,0],}))
      triggers.push({
        step:0,
        start:i*(4),
        target:t.id
      })
      div_containers.push(
        <div key={`e3_${t.id}`} id={`e3_${t.id}`} className="w-[1px] h-10 bg-blue-400 "           
        style={{width: `calc(100%/${amount})`,  backgroundColor: `rgba(0, 0, 255, ${0.1 + (i / 10)})` }}>
        {/* {t.id} */}
        </div>
      )
    }
    // our animation trigger lerp  the getter of the accessor is undefined cause we dont need that here
    animationProps.animationTrigger=animator.Lerp({ 
      render_callback: animationProps.trigger_set,
      duration: triggerduration,
      steps: [10,100,10],
      animationTriggers:triggers,
      loop:true

    })
  
    return (
    <div class="w-full h-full bg-white">
      {/* <ExampleDescription header={header} description={exampleDiscription}/> */}
      <div class="z-10 w-1/2 h-1/4 absolute flex pointer-events-none  flex-col items-center" style={{ width:window.innerWidth*0.67}}>
      <div class=" rounded-b-md   max-w-[45%]  text-black bg-[#5C8F8D]  items-center bg-opacity-45 border-b-2 border-l-2 border-r-2 border-black">
      <div class=" text-xl ">
        Example 3: Triggers
      </div>
      <div class=" text-sm pl-5> text-left text-wrap w-[90%]">
        This example demonstrates how to create animations using a sequence instead of min/max values.
        you can change the sequence by calling animator.update(). If you dont specify the max length of the sequence using the sequence_max_lengt argument, the length of the initial array will be used.
      </div>
      </div>
      </div>
      <div class="w-full h-full items-center justify-center flex shrink-0">
        <div class="w-[50%] h-20 flex flex-col shrink-0">
        <div key={"trigger_3"} id={"trigger_3"} class="w-[10%] h-10 bg-red-600">Trigger</div>
        <div class="shrink-0 items-center justify-center w-full h-full font-size-xl flex flex-row text-white">
        <div  className="w-[10%] h-10 bg-black" ></div> 
          {
            div_containers.map((val)=>{return val})
          }
          </div>        
        </div>
      </div>
    </div>
  )}


  // this is just util stuff for the example project
  const mdFile = `\`\`\`javascript
  // this is our placeholder dict for the elements that get animated
  var animationProps = {
    setc: ((val) => {
        document.getElementById("b").style.transform = \`translate(\${val}%)\`;
        console.log(document.getElementById("b").style.transform) 
      }),
      animator:undefined,
      target:undefined
  }
  
  // utility functions to start the animation and update the sequence
  const update=(() => {
      animationProps.animator.update_lerp([{animObject: animationProps.target,value: [0.0, 100.0, 0.0]}])
     })
  const start=(()=>{
      animationProps.animator.start([animationProps.target.id])
     })
    
  // the divs that get animated
  function E3(animator) {
      animationProps.animator=animator
      animationProps.target=animator.Lerp({ accessor: [animationProps.c, animationProps.setc], duration: 10, steps: [0.1, 400.1, 0.1, 100, 20, 30, 40, 500, 0],sequence_max_lengt:10 })
    return (
      <div class="w-full h-full flex flex-row">
        <div class="w-full h-full items-center justify-center flex flex-col ">
          <div class="shrink-1 items-center justify-center w-full h-full font-size-xl flex flex-row">
            <div id="a" class="w-10 h-10 bg-blue-400">a</div>
            <div id="b" class="w-10 h-10 bg-blue-500">b</div>
          </div>
        </div>
      </div>
    )}
  \`\`\``
const Controls=[
  {
    name:"Start Animation",
    info:" This Event will start the animation with the values lerpPoint values that where set the last time. The initial values are the ones we have used for the initialisation of the Lerpclass: [0.1, 400.1 ,0.1 ,100, 20, 30, 40, 500, 0]",
    button:{
      name:"start",
      onClick: start
    }
  }
]
  

const TutorialWidget={
  name:"Animation_Sequence_1",
  info: "This Examples shows how to use Lerp animation with a sequence.",
  gitlink:"https://github.com/ji-podhead/kooljs/blob/main/livedemo_project/src/examples/e2.js",
  mdfile:mdFile
}

export { Example,Controls,TutorialWidget }

