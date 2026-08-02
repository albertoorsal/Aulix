

interface StudentState {
    students: string[] | null,
    status: "idle" | "loading" | "failed";
    initialized: boolean;
    error: string | null;
}

const initialState : StudentState = {
    students: [],
    status: "idle",
    initialized: true,
    error: null,
}


export const findAll() =  {}