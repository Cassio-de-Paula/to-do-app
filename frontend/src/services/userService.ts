import api from "../config/axiosConfig"


const UserService = {
    get: async () => {
        return api.get(`api/users/data/`)
    },

    delete: async (userId: string) => {
        return api.delete(`api/users/${userId}`)
    }
}

export default UserService