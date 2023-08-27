import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {FormControl, FormHelperText, MenuItem} from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import {WebContainer} from '@webcontainer/api';
import {useForm, SubmitHandler, Controller} from "react-hook-form"

// import path from "path-browserify";
// import {useStore} from "../../store";
import {observer} from "mobx-react-lite";
import CircularProgress from '@mui/material/CircularProgress';
import {useStore} from "../../store";
import evtSource_index from "../../pages/files/evtSource_index.ts";

interface IProps {
    webcontainerInstance: WebContainer | undefined,

    fileSystemTreeCreate(): Promise<void>
}

// interface INode {
//     id: number | string,
//     parent: number | string,
//     text: string,
//     droppable: boolean,
//     data: {
//         type: string,
//         value: string
//     }
// }

interface IFormInput {
    rootDirectory: string,
    contractName: string,
    projectTemplate: string
}


export const DialogCreate = observer(function DialogCreate({webcontainerInstance, fileSystemTreeCreate}: IProps) {
    const {
        register,
        handleSubmit,
        formState: {errors},
        control,
    } = useForm<IFormInput>()
    
    const {
         setRootDirectory,
    } = useStore().store.fileStore;

    const [open, setOpen] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    ///const [projectName, setProjectName] = React.useState("");

    const onSubmit: SubmitHandler<IFormInput> = (data) => {
        const {rootDirectory, contractName, projectTemplate} = data;
        setRootDirectory(rootDirectory);
        setLoading(true);
        (async () => {

            if (webcontainerInstance) await createTon(rootDirectory, contractName, projectTemplate);


            setOpen(false);
        })()
    }


    const submitForm = () => {
        handleSubmit(onSubmit)();
    };

    const createTmp = async (rootDirectory: string) => {
        if (webcontainerInstance) {
            await webcontainerInstance.fs.mkdir(`/${rootDirectory}/node_modules/@tonconnect/isomorphic-eventsource/tmp`);
            await webcontainerInstance.fs.writeFile(`/${rootDirectory}/node_modules/@tonconnect/isomorphic-eventsource/index.js`, evtSource_index);
            await webcontainerInstance.fs.writeFile(`/${rootDirectory}/node_modules/@tonconnect/isomorphic-eventsource/tmp/client_cache`, '{"events": []}');
            await webcontainerInstance.fs.writeFile(`/${rootDirectory}/node_modules/@tonconnect/isomorphic-eventsource/tmp/server_cache`, '{}');
        }
    }

    const createTon = async (rootDirectory: string, contractName: string, projectTemplate: string) => {
        if (webcontainerInstance) {
            const installProcess = await webcontainerInstance.spawn('npm', ['create', 'ton@latest', rootDirectory]);
            const input2 = installProcess.input.getWriter();

            await installProcess.output.pipeTo(new WritableStream({

                write(data) {
                    if (data.includes(`Ok to proceed? (y)`)) {
                        input2.write(`y\n`);

                    }

                    if (data == `\x1B[43C`) {
                        input2.write(`${contractName}\n`);

                    }
                    if (data == `\x1B[35C`) {
                        input2.write(projectTemplate);

                    }

                    if (data.includes(`For help and docs visit https://github.com/ton-community/blueprint`)) {
                        fileSystemTreeCreate();
                        setOpen(false);
                        setLoading(false);
                        createTmp(rootDirectory);
                        installProcess.kill();
                        input2.abort();
                    }

                }

            }));


        }
    }

    // useEffect(() => {
    //     if(!open)
    //     "node_modules/@tonconnect/isomorphic-eventsource/index.js"
    // }, [open]);

    return (
        <div>
            {!webcontainerInstance?  (
                        <CircularProgress
                        size={64}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                        }}
                    />
                ) :
                <Dialog open={open}>
                {webcontainerInstance?   <DialogTitle>Blueprint Create project</DialogTitle> : "" }

                        <div>
                            <DialogContent>
                                <DialogContentText>

                                </DialogContentText>
                                <Box
                                    component="form"
                                    noValidate
                                    autoComplete="off"
                                >
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        id="name"
                                        label="Project name"
                                        type="text"
                                        fullWidth
                                        variant="standard"
                                        error={!!errors.rootDirectory}
                                        helperText={errors.rootDirectory ? "Incorrect entry." : ""}
                                        {...register("rootDirectory", {required: true, maxLength: 20})}
                                        // value={rootDirectory}
                                        // onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        //     setRootDirectory(event.target.value);
                                        // }}

                                    />
                                    <TextField
                                        margin="dense"
                                        id="contractName"
                                        label="First created contract name (PascalCase)"
                                        type="text"
                                        fullWidth
                                        variant="standard"
                                        error={!!errors.contractName}
                                        helperText={errors.contractName ? "Incorrect entry." : ""}
                                        {...register("contractName", {
                                            required: true,
                                            maxLength: 20,
                                            pattern: /^(?:[A-Z][a-z]+)+$/
                                        })}


                                    />
                                    <FormControl error={!!errors.projectTemplate} variant="standard" fullWidth>
                                        <InputLabel>Choose the project template</InputLabel>
                                        <Controller
                                            defaultValue = {''}
                                            render={({ field: { onChange, value } }) => (
                                                <Select
                                                    label="Choose the project template"
                                                    // value={projectTemplate}
                                                    // onChange={handleChange}
                                                    onChange={ (event: SelectChangeEvent) =>  onChange(event.target.value as string)}
                                                    value={value}

                                                >
                                                    <MenuItem value={`\n`}>An empty contract (FunC)</MenuItem>
                                                    <MenuItem value={`\x1B[B\n`}>A simple counter contract (FunC)</MenuItem>
                                                    <MenuItem disabled value={2}>An empty contract (TACT)</MenuItem>
                                                    <MenuItem disabled value={3}>A simple counter contract (TACT)</MenuItem>
                                                </Select>
                                            )}
                                            control={control}
                                            name={'projectTemplate'}
                                            rules={{ required: true }}
/>

                                        <FormHelperText>{errors.projectTemplate ? "Required field." : ""}</FormHelperText>
                                    </FormControl>
                                </Box>
                            </DialogContent>
                            <DialogActions>
                                <Box sx={{m: 1, position: 'relative'}}>
                                    <Button onClick={submitForm} type="submit" disabled={loading}>Create </Button>

                                    {loading && (
                                        <CircularProgress
                                            size={24}
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                marginTop: '-12px',
                                                marginLeft: '-12px',
                                            }}
                                        />
                                    )}
                                </Box>
                            </DialogActions>
                        </div>

            </Dialog>
            }
        </div>
    );
})