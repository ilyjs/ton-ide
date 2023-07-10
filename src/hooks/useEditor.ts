import {useEffect, useRef} from 'react';
import {rewireEditor} from '../configEditor/config.ts'

export function useEditor() {
    const isBooted = useRef(false); // используем useRef чтобы хранить флаг


    useEffect(() => {
        if (!isBooted.current) {
            isBooted.current = true;
            rewireEditor();
        }
    }, []);
}

export default useEditor;