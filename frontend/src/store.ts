import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

// Definindo tipo do usuário
interface UserState {
  id: string | null;
  username: string | null;
}

// Estado inicial
const initialState: UserState = {
  id: null,
  username: null,
};

// Slice do usuário
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; username: string }>) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
    },
    removeUser: (state) => {
      state.id = null;
      state.username = null;
    },
  },
});

// Exportando actions
export const { setUser, removeUser } = userSlice.actions;

// Configurando store
export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

// Tipos para hooks TS
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// --------------------
// 3 Hooks personalizados
// --------------------

// Hook para dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Hook para setar usuário
export const useSetUser = () => {
  const dispatch = useAppDispatch();
  return (payload: { id: string; username: string }) => {
    dispatch(setUser(payload));
  };
};

// Hook para acessar estado do usuário
export const useUser = () => useSelector((state: RootState) => state.user);

// Hook para remover usuário
export const useRemoveUser = () => {
  const dispatch = useAppDispatch();
  return () => dispatch(removeUser());
};
