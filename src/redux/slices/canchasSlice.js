import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const fetchCanchas = createAsyncThunk("canchas/list", async (q="") => {
  const { data } = await api.get("/canchas", { params: { q } });
  return data;
});
export const createCancha = createAsyncThunk("canchas/create", async (payload) => {
  const { data } = await api.post("/canchas", payload);
  return data;
});
export const uploadFiles = async (files) => {
  const form = new FormData();
  [...files].forEach(f => form.append("files", f));
  const { data } = await api.post("/upload", form, { headers: { "Content-Type":"multipart/form-data" } });
  return data.files;
};

const slice = createSlice({
  name: "canchas",
  initialState: { list: [], loading:false },
  reducers: {},
  extraReducers: b=>{
    b.addCase(fetchCanchas.pending, s=>{s.loading=true;})
     .addCase(fetchCanchas.fulfilled, (s,{payload})=>{ s.loading=false; s.list=payload; })
     .addCase(fetchCanchas.rejected, s=>{s.loading=false;});
  }
});

export default slice.reducer;
