import {Terminal} from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import {WebContainer} from "@webcontainer/api";

import 'xterm/css/xterm.css';
import {useEffect, useRef} from "react";
import {observer} from "mobx-react-lite";
import {useStore} from "../../../store";

// const files = {
//     'package.json': {
//         file: {
//             contents: `
//         {
//           "name": "vite-starter",
//           "private": true,
//           "version": "0.0.0",
//           "type": "module",
//           "scripts": {
//             "dev": "vite",
//             "build": "vite build",
//             "preview": "vite preview"
//           },
//           "devDependencies": {
//             "vite": "^4.0.4"
//           }
//         }`,
//         },
//     },
// };
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const Term = observer( ({webcontainerInstance, buildNumber,deployNumber, fileSystemTreeCreate }: {webcontainerInstance: WebContainer | undefined, buildNumber: number, fileSystemTreeCreate(): Promise<void>, deployNumber: number}) => {
    const isBooted = useRef(false); // используем useRef чтобы хранить флаг

    const {
        rootDirectory
    } = useStore().store.fileStore;

    async function startShell(terminal: Terminal, command?: string) {
       if(!webcontainerInstance) return ;


        const shellProcess = await webcontainerInstance.spawn('jsh', {
            terminal: {
                cols: terminal.cols,
                rows: terminal.rows,
            }
        });
        const input = shellProcess.input.getWriter();
        const runCommand = (() => {
            let called = false;

            return  () => {
                if (!called) {
                    called = true;
                    setTimeout(async () =>{
                       await input.write(`cd ${rootDirectory}\n`);
                       await sleep(50);
                        await sleep(50);
                      await  input.write(command);
                    }, 500);
                }
            };
        })();
        shellProcess.output.pipeTo(
            new WritableStream({
                write(data) {

                    terminal.write(data);

                    console.log(data)
                     if(data.includes('Wrote compilation artifact')) fileSystemTreeCreate();
                     if(data.includes('Contract deployed at address')) fileSystemTreeCreate();
                     if(command)  runCommand();
                },
            })
        );




        terminal.onData((data) => {
            console.log(data)

            input.write(data);

        });

        return shellProcess;
    }

    const terminalRef = useRef<HTMLDivElement>(null);
    const fitAddon = new FitAddon();
    const terminal = new Terminal({convertEol: true});

    terminal.loadAddon(fitAddon);
    const shellProcess = useRef<any>(null);
    const observerResizeElement = useRef<any>(null);

    const resize = () => {
        fitAddon.fit();
        shellProcess.current.resize({
            cols: terminal.cols,
            rows: terminal.rows,
        });
    }

    useEffect(() => {
        if (terminalRef.current && webcontainerInstance && !isBooted.current) {
            console.log(12345999)
            isBooted.current = true;
            terminal.open(terminalRef.current);
           // terminal.writeln('Hello, world!');
            fitAddon.fit();
           // (async ()  => await webcontainerInstance.mount(files))();
            (async () => {
                shellProcess.current = await startShell(terminal);

               console.log('shellProcess.resize')
               window.addEventListener('resize', resize);



                 observerResizeElement.current = new ResizeObserver(() => {
                    resize();
                });

                const element = terminalRef?.current;
                if (!element) return;
                observerResizeElement.current.observe(element);
            })()


        }
    }, []);




    useEffect(() => {
        if(buildNumber === 0 && !!terminalRef.current)  return;
        window.removeEventListener("resize", resize);
        observerResizeElement.current.disconnect();
        terminalRef?.current?.firstChild?.remove();
        shellProcess.current.kill();
        if(!terminalRef.current) return;
        terminal.open(terminalRef.current);
        fitAddon.fit();
        (async () => {
            //terminal.open(terminalRef.current)

            shellProcess.current = await startShell(terminal, `npx blueprint build\n`);

            window.addEventListener('resize', resize);
            observerResizeElement.current = new ResizeObserver(() => {
                resize();
            });

            const element = terminalRef?.current;
            if (!element) return;
            observerResizeElement.current.observe(element);
        })()

    }, [buildNumber])

    useEffect(() => {
        if(deployNumber === 0 && !!terminalRef.current)  return;
        window.removeEventListener("resize", resize);
        observerResizeElement.current.disconnect();
        terminalRef?.current?.firstChild?.remove();
        shellProcess.current.kill();
        if(!terminalRef.current) return;
        terminal.open(terminalRef.current);
        fitAddon.fit();
        (async () => {
            //terminal.open(terminalRef.current)

            shellProcess.current = await startShell(terminal, `npx blueprint run\n`);

            window.addEventListener('resize', resize);
            observerResizeElement.current = new ResizeObserver(() => {
                resize();
            });

            const element = terminalRef?.current;
            if (!element) return;
            observerResizeElement.current.observe(element);
        })()

    }, [deployNumber])


    return <div ref={terminalRef} style={{height: "100%"}} className="terminal"></div>
})