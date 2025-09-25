import { useEffect, useState } from 'react'
import CustomInput from '../../../components/CustomInput/CustomInput'
import CustomSelect from '../../../components/customSelect/CustomSelect'
import CustomTextArea from '../../../components/CustomTextArea/CustomTextArea'
import type { CategoryInterface } from '../../../services/categoryService'
import type { ToDoEventInterface } from '../../../services/ToDoEventService'
import { validateFutureDate, validateUUID } from '../../../validators/generalValidators'
import styles from './ToDoForm.module.css'
import { toast } from 'react-toastify'
import ToDoEventService from '../../../services/ToDoEventService'
import { AxiosError } from 'axios'
import { useUser } from '../../../store'

interface ToDoFormProps {
    toDo: ToDoEventInterface
    setToDo: React.Dispatch<React.SetStateAction<ToDoEventInterface>>
    categories: CategoryInterface[]
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    fetchToDoList: () => Promise<void>
}

interface ToDoErrors {
    title: string | null
    deadline: string | null
    category: string | null
}

const ToDoForm = ({toDo, setToDo, categories, setIsModalOpen, fetchToDoList}: ToDoFormProps) => {
    const user = useUser()
    const [toDoErrors, setToDoErrors] = useState<ToDoErrors>({
        title: null,
        category: null,
        deadline: null
    })

    const validateToDoForm = () => {
        let newErrors: ToDoErrors = {
            category: null,
            deadline: null,
            title: null
        }

        for (let field in toDo) {
            switch (field) {
                case 'title':
                    toDo.title === '' ? newErrors.title = 'Campo obrigatório' : newErrors.title = null
                    break;
                case 'deadline':
                    newErrors.deadline = validateFutureDate(toDo.deadline ?? "")
                    break;
                case 'category':
                    if (toDo.categoryId) newErrors.category = toDo.categoryId?.length > 0 ? validateUUID(toDo.categoryId) : null
                    break;
                default:
                    break;
            }
        }

        setToDoErrors(newErrors)
        return Object.values(newErrors).every((error) => error === null)
    }

    const handleSubmitToDo = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateToDoForm()) {
            toast.promise(
                toDo.id ?
                ToDoEventService.edit(toDo.id, toDo) :
                ToDoEventService.create(toDo),
                {
                    pending: 'Salvando tarefa...',
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
                    fetchToDoList()
                    setIsModalOpen(false)
                    setToDo({
                        isDone: false,
                        title: '',
                        userId: user.id!,
                    })
                }
            })
        }
    }

    const fetchToDo = async (toDoId: string) => {
        try {
            const res = await ToDoEventService.get(toDoId)

            setToDo(res.data)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.message)
            } else {
                console.error(error)
            }
        }
    }

    useEffect(() => {
        if (toDo.id) fetchToDo(toDo.id)
    }, [])

    useEffect(() => {
        console.log(toDo)
    }, [toDo])

    return (
        <form className={styles.form} onSubmit={handleSubmitToDo}>
            <h2 className={styles.formTitle}>
                Nova Tarefa
            </h2>
            <CustomInput
                type='text'
                onChange={(e) => setToDo({...toDo, title: e.target.value})}
                value={toDo.title}
                error={toDoErrors.title}
                fontSize='32px'
                placeHolder='Insira o título...'
                align='center'
            />
            <div className={styles.formGroup}>
                <div className={styles.formGroupCol}>
                    <label className={styles.label}>
                        Prazo?
                        <CustomInput
                            type='date'
                            onChange={(e) => setToDo({...toDo, deadline: e.target.value})}
                            value={toDo.deadline ?? ''}
                            error={toDoErrors.deadline}
                        />
                    </label>
                    <label className={styles.label}>
                        Categoria?
                        <CustomSelect
                            onSelect={(option) => setToDo({...toDo, categoryId: option.id})}
                            options={categories}
                            renderKey={'name'}
                            selected={categories.find((category) => category.id === toDo.categoryId)!}
                        />
                    </label>
                </div>
                <div className={styles.switchContainer}>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={toDo.isDone}
                                onChange={(e) => setToDo({ ...toDo, isDone: e.target.checked })}
                            />
                            <span className={styles.slider}></span>
                        </label>
                        <span className={styles.isDoneLabel}>Concluída?</span>
                    </div>
            </div>
            <CustomTextArea
                onChange={(e) => setToDo({...toDo, description: e.target.value})}
                value={toDo.description ?? ""}
                placeHolder='Quais os detalhes da tarefa...'
            />
            <button className={styles.addTask} type='submit'>
                <span className={styles.span}>Salvar tarefa</span>
            </button>
        </form>
    )
}

export default ToDoForm