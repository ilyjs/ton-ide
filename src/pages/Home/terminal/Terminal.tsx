import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import {WebContainer, WebContainerProcess} from "@webcontainer/api";
import 'xterm/css/xterm.css';
import {Dispatch, SetStateAction, useLayoutEffect, useRef} from "react";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

type Term = {
    webcontainerInstance: WebContainer | undefined,
    fileSystemTreeCreate(): Promise<void>,
    rootDirectory: string,
    command?: string,
    isTerminalRestarted: boolean,
    setIsTerminalRestarted: Dispatch<SetStateAction<boolean>>
}

export const Term = ({
                         webcontainerInstance,
                         fileSystemTreeCreate,
                         rootDirectory,
                         command,
                         isTerminalRestarted,
                         setIsTerminalRestarted
                     }: Term) => {
    const isBooted = useRef(false); // используем useRef чтобы хранить флаг

    async function startShell(terminal: Terminal, command?: string) {
        if (!webcontainerInstance) return;

        const shellProcess = await webcontainerInstance.spawn('jsh', {
            terminal: {
                cols: terminal.cols,
                rows: terminal.rows,
            }
        });
        const input = shellProcess.input.getWriter();
        const runCommand = (() => {
            let called = false;
            return () => {
                if (!called) {
                    called = true;
                    setTimeout(async () => {
                        await input.write(`cd ${rootDirectory}\n`);
                        await sleep(50);
                        await sleep(50);
                        await input.write(command);
                    }, 500);
                }
            };
        })();
        shellProcess.output.pipeTo(
            new WritableStream({
                write(data) {
                    terminal.write(data);
                    if (data.includes('Wrote compilation artifact')) fileSystemTreeCreate();
                    if (data.includes('Contract deployed at address')) fileSystemTreeCreate();
                    if (command) runCommand();
                },
            })
        );
        terminal.onData((data) => {
                input.write(data)

        });
        return shellProcess;
    }

    const terminalRef = useRef<HTMLDivElement>(null);
    const fitAddon = new FitAddon();
    const terminal = new Terminal({convertEol: true});

    terminal.loadAddon(fitAddon);
    const shellProcess = useRef<WebContainerProcess | undefined>(undefined);
    const observerResizeElement = useRef<ResizeObserver>();
    const resize = () => {
        fitAddon.fit();
        shellProcess?.current?.resize({
            cols: terminal.cols,
            rows: terminal.rows,
        });
    }

    const restartTerminal = (command?: string) => {
        if (!terminalRef.current) return;
        window.removeEventListener("resize", resize);
        if (observerResizeElement.current) observerResizeElement.current.disconnect();
        terminalRef?.current?.firstChild?.remove();
        if (shellProcess.current) shellProcess.current.kill();
        terminal.open(terminalRef.current);
        fitAddon.fit();

        (async () => {
            shellProcess.current = await startShell(terminal, command);
            window.addEventListener('resize', resize);
            observerResizeElement.current = new ResizeObserver(() => {
                resize();
            });
            const element = terminalRef?.current;
            if (!element) return;
            observerResizeElement.current.observe(element);
            terminal.focus();
        })();
    }

    useLayoutEffect(() => {
        if (terminalRef.current && webcontainerInstance && !isBooted.current) {
            isBooted.current = true;
            restartTerminal();
        }
    }, []);

    useLayoutEffect(() => {
        if (!isTerminalRestarted && command && !!terminalRef.current) {
            restartTerminal(command);
            setIsTerminalRestarted(true);
        }
    }, [command, isTerminalRestarted])

    return <div ref={terminalRef} style={{height: "100%"}} className="terminal"></div>
}