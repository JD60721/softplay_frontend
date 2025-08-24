import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const misReservasThunk = createAsyncThunk("reservas/mias", async ()=>{
  const { data } = await api.get("/reservas/mias");
  return data;
});

export const crearReservaThunk = createAsyncThunk("reservas/crear", async (payload)=>{
  const { data } = await api.post("/reservas", payload);
  return data;
});

const slice = createSlice({
  name:"reservas",
  initialState: { list: [], loading:false },
  reducers: {},
  extraReducers: b=>{
    b.addCase(misReservasThunk.fulfilled, (s,{payload})=>{ s.list = payload; });
    b.addCase(crearReservaThunk.fulfilled, (s,{payload})=>{ s.list.push(payload); });
  }
});

export default slice.reducer;
