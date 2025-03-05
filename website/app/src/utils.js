
import React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialOceanic } from 'react-syntax-highlighter/dist/esm/styles/prism'
// other styles you can use for rendering markdown: a11yDark, atomDark, base16AteliersulphurpoolLight, cb, coldarkCold, coldarkDark, coy, coyWithoutShadows, darcula, dark, dracula, duotoneDark, duotoneEarth, duotoneForest, duotoneLight, duotoneSea, duotoneSpace, funky, ghcolors, gruvboxDark, gruvboxLight, holiTheme, hopscotch, lucario, materialDark, materialLight, , nightOwl, nord, okaidia, oneDark, oneLight, pojoaque, prism, shadesOfPurple, solarizedDarkAtom, solarizedlight, synthwave84, tomorrow, twilight, vs, vscDarkPlus, xonokai, zTouch

async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const changeBackground = (element, color) => {
    document.getElementById(element).style.backgroundColor = color
    //  element.style.backgroundColor = 'red';
};
const changeBorder = (element, color) => {
    document.getElementById(element).style.borderColor = color
    //  element.style.backgroundColor = 'red';
};

function Header() {
    return (
        <div class="w-full h-full  bg-[#404d5a]   text-white text-xl flex items-center rounded-t-md">

            <div class="w-full justify-self-start text-[#ffffff] self-center text-4xl ">
                <b>Pamji</b>
                </div>
            <div class="w-[10%] h-full justify-self-end self-center gap-5 flex flex-row items-center justify-center px-5">
                {/* <div id="manual"  
                onMouseOver={()=>{changeBorder("manual","#C0E58B")}}
                onMouseOut={()=>{changeBorder("manual","white")}}
                class="bg-black h-[70%] aspect-square border-white border-2 rounded-md items-center justify-center flex overflow-hidden">
                    <a href="https://github.com/ji-podhead/kooljs" class="w-[50%] h-[50%] items-center flex">
                    <svg viewBox="0 0 128 128">
                            <path fill="#ffffff" d="M57.62 61.68c-1.7.24-2.87 1.78-2.62 3.43a3.07 3.07 0 0 0 2.22 2.54s7.47 2.46 20.18 3.51c10.21.85 21.8-.73 21.8-.73 1.7-.04 3.03-1.45 2.99-3.15a3.065 3.065 0 0 0-3.15-2.99c-.2 0-.4.04-.61.08 0 0-11.34 1.41-20.55.65-12.15-.97-18.77-3.19-18.77-3.19-.48-.16-1.01-.24-1.49-.16Zm0-15.22c-1.7.24-2.87 1.78-2.62 3.43a3.07 3.07 0 0 0 2.22 2.54s7.47 2.46 20.18 3.51c10.21.85 21.8-.73 21.8-.73 1.7-.04 3.03-1.45 2.99-3.15a3.065 3.065 0 0 0-3.15-2.99c-.2 0-.4.04-.61.08 0 0-11.34 1.41-20.55.65-12.15-.97-18.77-3.19-18.77-3.19-.48-.16-1.01-.24-1.49-.16Zm0-15.22c-1.7.24-2.87 1.78-2.62 3.43a3.07 3.07 0 0 0 2.22 2.54s7.47 2.46 20.18 3.51c10.21.85 21.8-.73 21.8-.73 1.7-.04 3.03-1.45 2.99-3.15a3.065 3.065 0 0 0-3.15-2.99c-.2 0-.4.04-.61.08 0 0-11.34 1.41-20.55.65-12.15-.97-18.77-3.19-18.77-3.19-.48-.16-1.01-.2-1.49-.16Zm0-15.18c-1.7.24-2.87 1.78-2.62 3.43a3.07 3.07 0 0 0 2.22 2.54s7.47 2.46 20.18 3.51c10.21.85 21.8-.73 21.8-.73 1.7-.04 3.03-1.45 2.99-3.15a3.065 3.065 0 0 0-3.15-2.99c-.2 0-.4.04-.61.08 0 0-11.34 1.41-20.55.65-12.15-.97-18.77-3.19-18.77-3.19a2.74 2.74 0 0 0-1.49-.16ZM36.31 0C20.32.12 14.39 5.05 14.39 5.05v119.37s5.81-5.01 24.54-4.24 22.57 7.35 45.58 7.79c23.01.44 28.78-3.55 28.78-3.55l.32-121.67S103.28 5.7 83.09 5.86C62.95 6.01 58.11.73 39.62.12 38.49.04 37.4 0 36.31 0Zm13.36 7.79s9.69 3.19 27.57 4.08c15.14.77 30.28-1.49 30.28-1.49v108.15s-7.67 4.04-26.84 2.66c-14.86-1.05-31.2-6.7-31.2-6.7l.2-106.69Zm-9.32 2.83c1.7 0 3.11 1.37 3.11 3.11s-1.37 3.11-3.11 3.11c0 0-5.01.04-8.07.32-5.13.52-8.64 2.38-8.64 2.38-1.49.81-3.39.2-4.16-1.29-.81-1.49-.2-3.39 1.29-4.16s4.56-2.42 10.9-3.03c3.67-.4 8.68-.44 8.68-.44Zm-2.99 15.26c1.7-.04 2.99 0 2.99 0 1.7.2 2.91 1.74 2.7 3.43a3.08 3.08 0 0 1-2.7 2.7s-5.01.04-8.07.32c-5.13.52-8.64 2.38-8.64 2.38-1.49.81-3.39.2-4.16-1.29-.81-1.49-.2-3.39 1.29-4.16 0 0 4.56-2.42 10.9-3.03 1.86-.24 4-.32 5.69-.36Zm2.99 15.18c1.7 0 3.11 1.37 3.11 3.11s-1.37 3.11-3.11 3.11c0 0-5.01-.04-8.07.28-5.13.52-8.64 2.38-8.64 2.38-1.49.81-3.39.2-4.16-1.29-.81-1.49-.2-3.39 1.29-4.16 0 0 4.56-2.42 10.9-3.03 3.67-.44 8.68-.4 8.68-.4Z"></path>
                        </svg> 
                    </a>
                </div> */}
                {/* <div id="npm"
                    onMouseOver={() => { changeBorder("npm", "#C0E58B") }}
                    onMouseOut={() => { changeBorder("npm", "white") }}
                    class="bg-black h-[70%] aspect-square border-white border-2 rounded-md items-center justify-center flex overflow-hidden">
                    <a href="https://www.npmjs.com/package/kooljs" class="w-[80%] h-[80%] items-center flex">
                        <svg viewBox="0 0 128 128">
                            <path fill="#ffffff" d="M2 38.5h124v43.71H64v7.29H36.44v-7.29H2zm6.89 36.43h13.78V53.07h6.89v21.86h6.89V45.79H8.89zm34.44-29.14v36.42h13.78v-7.28h13.78V45.79zm13.78 7.29H64v14.56h-6.89zm20.67-7.29v29.14h13.78V53.07h6.89v21.86h6.89V53.07h6.89v21.86h6.89V45.79z"></path>
                        </svg>
                    </a>
                </div>
                <div id="git"
                    onMouseOver={() => { changeBorder("git", "#C0E58B") }}
                    onMouseOut={() => { changeBorder("git", "white") }}
                    class="bg-black h-[70%] aspect-square border-white border-2 rounded-md items-center justify-center flex overflow-hidden">
                    <a href="https://github.com/ji-podhead/kooljs" class="w-[80%] ">
                        <img src="https://cdn.pixabay.com/photo/2022/01/30/13/33/github-6980894_960_720.png" />
                    </a>
                </div> */}
            </div>
        </div>
    )
}


export {  Header }



