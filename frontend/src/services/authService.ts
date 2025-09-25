import api from "../config/axiosConfig"


const AuthService = {
    login: async (accessToken: string) => {
        return api.post('api/session/auth/', {accessToken})
    },

    logout: async () => {
        return api.post('api/session/logout/', {})
    }
}

export default AuthService