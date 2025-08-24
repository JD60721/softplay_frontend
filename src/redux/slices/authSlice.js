import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

const token = localStorage.getItem("token");
const userLS = localStorage.getItem("user");

export const loginThunk = createAsyncThunk("auth/login", async (payload, thunk) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
});
export const registerThunk = createAsyncThunk("auth/register", async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
});
export const meThunk = createAsyncThunk("auth/me", async () => {
  const { data } = await api.get("/auth/me");
  return data;
});

const slice = createSlice({
  name:"auth",
  initialState: { token: token || null, user: userLS ? JSON.parse(userLS) : null, loading:false, error:null },
  reducers: {
    logout: (state)=>{
      state.token=null; state.user=null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
  extraReducers: builder => {
    builder
      .addCase(loginThunk.pending, s=>{s.loading=true; s.error=null;})
      .addCase(loginThunk.fulfilled, (s, {payload})=>{
        s.loading=false; s.token=payload.token; s.user=payload.user;
        localStorage.setItem("token", payload.token);
        localStorage.setItem("user", JSON.stringify(payload.user));
      })
      .addCase(loginThunk.rejected, (s, a)=>{ s.loading=false; s.error=a.error.message; })
      .addCase(registerThunk.fulfilled, (s,{payload})=>{
        s.token=payload.token; s.user=payload.user;
        localStorage.setItem("token", payload.token);
        localStorage.setItem("user", JSON.stringify(payload.user));
      })
      .addCase(meThunk.fulfilled, (s,{payload})=>{ s.user = payload; });
  }
});

export const { logout } = slice.actions;
export default slice.reducer;
