import {useState, useLayoutEffect, useRef} from 'react';
import {WebContainer} from "@webcontainer/api";

export function useWebcontainers() {
    const [webcontainerInstance, setWebcontainerInstance] = useState<WebContainer | undefined>();
    const isBooted = useRef(false); // используем useRef чтобы хранить флаг


    useLayoutEffect(() => {

        if (!isBooted.current) {
            isBooted.current = true;
            WebContainer.boot().then(webcontainerInstance_ => {
                setWebcontainerInstance(webcontainerInstance_);
            });
        }
    }, []);
    console.log("lorno", webcontainerInstance)
    return webcontainerInstance;
}

export default useWebcontainers;