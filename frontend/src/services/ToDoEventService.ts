import api from "../config/axiosConfig"

export interface ToDoEventInterface {
    id?: string
    title: string
    description?: string
    isDone: boolean
    deadline?: string
    userId: string
    category: string
}

const ToDoEventService = {
    create: async (params: ToDoEventInterface) => {
        return api.post('api/todoevents', params)
    },

    list: async () => {
        return api.get('api/todoevents')
    },

    get: async (todoEventId: string) => {
        return api.get(`api/todoevents/${todoEventId}`)
    },

    edit: async (todoEventId: string, params: ToDoEventInterface) => {
        return api.put(`api/todoevents/${todoEventId}`, params)
    },

    delete: async (todoEventId: string) => {
        return api.put(`api/todoevents/${todoEventId}`)
    }
}

export default ToDoEventService