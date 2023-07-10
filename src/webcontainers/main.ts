import {WebContainer} from '@webcontainer/api';

let webcontainerInstance: WebContainer | undefined;

window.addEventListener('load', async () => {
    webcontainerInstance = await WebContainer.boot();

    const installProcess = await webcontainerInstance.spawn('npm', ['create', 'ton@latest', '1']);
    const input2 = installProcess.input.getWriter();
    installProcess.output.pipeTo(new WritableStream({

        write(data) {
            if (data == `\x1B[43C`) {
                //const input2 = installProcess.input.getWriter();
                input2.write("Main\n");

            }
            if (data == `\x1B[35C`) {
                // const input3 = installProcess.input.getWriter();
                input2.write(`\x1B[B\n`);

            }

        }

    }));

});

