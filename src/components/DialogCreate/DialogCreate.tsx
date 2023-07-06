import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {FormControl, MenuItem} from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import {WebContainer} from '@webcontainer/api';
// import path from "path-browserify";
// import {useStore} from "../../store";
import {observer} from "mobx-react-lite";
import CircularProgress from '@mui/material/CircularProgress';
import {useStore} from "../../store";

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

export const DialogCreate = observer ( function DialogCreate   ({webcontainerInstance, fileSystemTreeCreate}: IProps) {

    const {
        rootDirectory, setRootDirectory,
    } = useStore().store.fileStore;

    const [open, setOpen] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    ///const [projectName, setProjectName] = React.useState("");
    const [contractName, setContractName] = React.useState("");
    const [projectTemplate, setProjectTemplate] = React.useState("");








    const createTon = async () => {
        if(webcontainerInstance) {
            console.log("webcontainerInstance", webcontainerInstance);
            const installProcess = await webcontainerInstance.spawn('npm', ['create', 'ton@latest', rootDirectory]);
            const input2 = installProcess.input.getWriter();

            await installProcess.output.pipeTo( new WritableStream({

                write(data) {
                    console.log(data);
                    if (data.includes(`Ok to proceed? (y)`)) {
                        input2.write(`y\n`);

                    }

                    if (data == `\x1B[43C`) {
                        input2.write(`${contractName}\n`);

                    }
                    if (data == `\x1B[35C`) {
                        input2.write(projectTemplate);

                    }

                    if(data.includes(`For help and docs visit https://github.com/ton-community/blueprint`)){
                        fileSystemTreeCreate();
                        console.log("Lotor");
                        setOpen(false);
                        setLoading(false);
                        installProcess.kill();
                        input2.abort();
                    }

                }

            }));



        }
    }
    const handleClose = async () => {
        setLoading(true);
        console.log(rootDirectory, contractName, projectTemplate)
        if(webcontainerInstance) await createTon();
        setOpen(false);
    };

    const handleChange = (event: SelectChangeEvent) => {
        setProjectTemplate(event.target.value as string);
    };

    return (
        <div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Blueprint Create project </DialogTitle>
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
                            value={rootDirectory}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setRootDirectory(event.target.value);
                            }}

                        />
                        <TextField
                            margin="dense"
                            id="contractName"
                            label="First created contract name (PascalCase)"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={contractName}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setContractName(event.target.value);
                            }}

                        />
                        <FormControl variant="standard" fullWidth>
                            <InputLabel>Choose the project template</InputLabel>
                            <Select
                                label="Choose the project template"
                                value={projectTemplate}
                                onChange={handleChange}
                            >
                                <MenuItem value={`\n`}>An empty contract (FunC)</MenuItem>
                                <MenuItem value={`\x1B[B\n`}>A simple counter contract (FunC)</MenuItem>
                                <MenuItem disabled value={2}>An empty contract (TACT)</MenuItem>
                                <MenuItem disabled value={3}>A simple counter contract (TACT)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ m: 1, position: 'relative' }}>
                        <Button disabled={loading} onClick={handleClose}>Create </Button>

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
            </Dialog>
        </div>
    );
} )