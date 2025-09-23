import api from "../config/axiosConfig"

export interface CategoryInterface {
    id?: string
    name: string
    color: string
    userId: string
}

const CategoryService = {
    create: async (params: CategoryInterface) => {
        return api.post('api/categories', params)
    },

    list: async () => {
        return api.get('api/categories')
    },

    edit: async (categoryId: string, params: CategoryInterface) => {
        return api.put(`api/categories/${categoryId}`, params)
    },

    delete: async (categoryId: string) => {
        return api.put(`api/categories/${categoryId}`)
    }
}

export default CategoryService