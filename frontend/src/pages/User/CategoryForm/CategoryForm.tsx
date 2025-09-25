import { useEffect, useState } from 'react'
import CustomInput from '../../../components/CustomInput/CustomInput'
import type { CategoryInterface } from '../../../services/categoryService'
import styles from './CategoryForm.module.css'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import { useUser } from '../../../store'
import CategoryService from '../../../services/categoryService'
import { validateColor } from '../../../validators/generalValidators'

interface CategoryFormProps {
    category: CategoryInterface
    setCategory: React.Dispatch<React.SetStateAction<CategoryInterface>>
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    fetchCategoryList: () => Promise<void>
}

interface CategoryErrors {
    name: string | null
    color: string | null
}

const CategoryForm = ({category, setCategory, setIsModalOpen, fetchCategoryList}: CategoryFormProps) => {
    const user = useUser()
    const [categoryErrors, setCategoryErrors] = useState<CategoryErrors>({
        name: null,
        color: null,
    })

    const validateCategoryForm = () => {
        let newErrors: CategoryErrors = {
            name: null,
            color: null,
        }

        for (let field in category) {
            switch (field) {
                case 'name':
                    category.name === '' ? newErrors.name = 'Campo obrigatório' : newErrors.name = null
                    break;
                case 'color':
                    newErrors.color === '' ? newErrors.color = 'Campo obrigatório' : newErrors.color = null
                    break;
                default:
                    break;
            }
        }

        setCategoryErrors(newErrors)
        return Object.values(newErrors).every((error) => error === null)
    }

    const handleSubmitToDo = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateCategoryForm()) {
            toast.promise(
                category.id ?
                CategoryService.edit(category.id, category) :
                CategoryService.create(category),
                {
                    pending: 'Salvando Categoria...',
                    success: {
                        render ({data}) {
                            return data.statusText
                        }
                    },
                    error: {
                        render ({ data }) {
                            if (data instanceof AxiosError) return data.message
                        }
                    }
                }
            ).then((res) => {
                if (res.status === 200 || res.status === 201) {
                    fetchCategoryList()
                    setIsModalOpen(false)
                    setCategory({
                        userId: user.id!,
                        name: '',
                        color: ''
                    })
                }
            })
        }
    }

    const fetchCategory = async (categoryId: string) => {
        try {
            const res = await CategoryService.get(categoryId)

            setCategory(res.data)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.message)
            } else {
                console.error(error)
            }
        }
    }

    useEffect(() => {
        if (category.id) fetchCategory(category.id)
    }, [])

    return (
        <form className={styles.form} onSubmit={handleSubmitToDo}>
            <h2 className={styles.formTitle}>
                Nova Categoria
            </h2>
            <CustomInput
                type='text'
                onChange={(e) => setCategory({...category, name: e.target.value})}
                value={category.name}
                error={categoryErrors.name}
                fontSize='32px'
                placeHolder='Insira o nome...'
                align='center'
            />
            <div className={styles.formGroup}>
                <label className={styles.label}>
                    Selecione a cor da categoria
                    <input
                        type='color'
                        onChange={(e) => setCategory({...category, color: e.target.value})}
                        onBlur={() => setCategoryErrors({...categoryErrors, color: validateColor(category.color)})}
                    />
                </label>
            </div>
            <button className={styles.addCategory} type='submit'>
                <span className={styles.span}>Salvar tarefa</span>
            </button>
        </form>
    )
}

export default CategoryForm