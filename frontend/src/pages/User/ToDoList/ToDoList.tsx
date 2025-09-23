import { useEffect, useState } from 'react'
import styles from './ToDoList.module.css'
import ToDoEventService, { type ToDoEventInterface } from '../../../services/ToDoEventService'
import Loading from '../../../components/Loading/Loading'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { useUser } from '../../../store'
import CustomInput from '../../../components/CustomInput/CustomInput'
import CategoryService, { type CategoryInterface } from '../../../services/categoryService'
import CustomTextArea from '../../../components/CustomTextArea/CustomTextArea'
import close from '../../../assets/close-svgrepo-com.svg'
import { validateFutureDate, validateUUID } from '../../../validators/generalValidators'

interface ToDoErrors {
    title: string | null
    deadline: string | null
    category: string | null
}

const ToDoList = () => {
    const user = useUser()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [toDoList, setToDoList] = useState<ToDoEventInterface[]>([])
    const [modalType, setModalType] = useState<'ToDo' | 'Category' | null>(null)
    const [categoryList, setCategoryList] = useState<CategoryInterface[]>([])
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [toDo, setToDo] = useState<ToDoEventInterface>({
        id: '',
        category: '',
        isDone: false,
        title: '',
        userId: user.id!,
        deadline: '',
        description: '',
    })
    const [toDoErrors, setToDoErrors] = useState<ToDoErrors>({
        title: null,
        category: null,
        deadline: null
    })

    const fetchTasksData = async () => {
        try {
            const res = await Promise.all([
                ToDoEventService.list(),
                CategoryService.list()
            ])

            setToDoList(res[0].data)
            setCategoryList(res[0].data)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.message)
            } else {
                console.log(error)
            }
        } finally {
            setIsLoading(false)
        }
    }

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
                    newErrors.category = validateUUID(toDo.category)
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
                    setIsModalOpen(false)
                    setToDo({
                        ...toDo,
                        category: '',
                        deadline: '',
                        description:'',
                        id: '',
                        isDone: false,
                        title: ''
                    })
                }
            })
        }
    }

    useEffect(() => {
        fetchTasksData()
    }, [])

    return (
        <section className={styles.section}>
            {
                isLoading ? (
                    <Loading/>
                ) : toDoList.length > 0 ? (
                    toDoList.map((toDo) => (
                        <div className={styles.toDoContainer}>
                            
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyListMessage}>
                        <h2 className={styles.h2}>
                            Parece que sua lista de tarefas está vazia.
                        </h2>
                        <p className={styles.p}>Crie uma tarefa clicando no botão abaixo!</p>
                        <div className={styles.addTask} onClick={() => setIsModalOpen(true)}>
                            <span className={styles.span}>Criar tarefa</span>
                            <hr className={styles.hr}/>
                            <span className={styles.span}>+</span>
                        </div>
                    </div>
                )
            }
            {
                isModalOpen ? (
                    <section className={styles.absoluteBackground}>
                        <div className={styles.formContainer}>
                            <div className={styles.closeButton} onClick={(e) => {
                                e.stopPropagation()
                                setIsModalOpen(false)
                                setToDo({
                                    ...toDo,
                                    category: '',
                                    deadline: '',
                                    description:'',
                                    id: '',
                                    isDone: false,
                                    title: ''
                                })
                            }}>
                                <img src={close} className={styles.closeIcon} alt="fechar" />
                            </div>
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
                                    <label className={styles.label}>
                                        Prazo?
                                        <CustomInput
                                            type='date'
                                            onChange={(e) => setToDo({...toDo, deadline: e.target.value})}
                                            value={toDo.deadline ?? ''}
                                            error={toDoErrors.deadline}
                                        />
                                    </label>
                                    <div className={styles.switchContainer}>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={toDo.isDone}
                                                onChange={(e) => setToDo({ ...toDo, isDone: e.target.checked })}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                        <span className={styles.isDoneLabel}>Marcar como feita</span>
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
                        </div>
                    </section>
                ) : null
            }
        </section>
    )
}

export default ToDoList