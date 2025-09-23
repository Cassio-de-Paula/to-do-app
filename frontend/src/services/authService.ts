import api from "../config/axiosConfig"


const AuthService = {
    login: async (credential: string) => {
        return api.post('api/session/auth/', {credential})
    },

    logout: async () => {
        return api.post('api/session/logout/', {})
    }
}

export default AuthService