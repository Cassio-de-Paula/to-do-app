import { useEffect, useState } from 'react'
import styles from './ToDoList.module.css'
import ToDoEventService, { type ToDoEventInterface } from '../../../services/ToDoEventService'
import Loading from '../../../components/Loading/Loading'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { useUser } from '../../../store'
import CategoryService, { type CategoryInterface } from '../../../services/categoryService'
import close from '../../../assets/close-svgrepo-com.svg'
import plus from '../../../assets/plus-svgrepo-com.svg'
import categoryIcon from '../../../assets/category-svgrepo-com.svg'
import ToDoForm from '../ToDoForm/ToDoForm'
import CategoryForm from '../CategoryForm/CategoryForm'

const ToDoList = () => {
    const user = useUser()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [toDoList, setToDoList] = useState<ToDoEventInterface[]>([])
    const [modalType, setModalType] = useState<'ToDo' | 'Category' | null>(null)
    const [categoryList, setCategoryList] = useState<CategoryInterface[]>([])
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [toDo, setToDo] = useState<ToDoEventInterface>({
        isDone: false,
        title: '',
        userId: user.id!,
    })
    const [category, setCategory] = useState<CategoryInterface>({
        color: '',
        name: '',
        userId: user.id!
    })

    const fetchToDoList = async () => {
        try {
            const res = await ToDoEventService.list()

            setToDoList(res.data)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.message)
            } else {
                console.error(error)
            }
        }
    }

    const fetchCategoryList = async () => {
        try {
            const res = await CategoryService.list()

            setCategoryList(res.data)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.message)
            } else {
                console.error(error)
            }
        }
    }

    const fetchData = async () => {
        try {
            const res = await Promise.all([
                ToDoEventService.list(),
                CategoryService.list(),
            ])

            setToDoList(res[0].data)
            setCategoryList(res[1].data)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.message)
            } else {
                console.error(error)
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        console.log(categoryList)
    }, [categoryList])

    return (
        <section className={styles.section}>
            {
                isLoading ? (
                    <Loading/>
                ) : toDoList.length > 0 ? (
                    <section className={styles.absoluteSection}>
                        {
                            toDoList.map((toDo) => (
                                <div className={styles.toDoContainer} onClick={(e) => {
                                    e.stopPropagation()
                                    setModalType("ToDo")
                                    setIsModalOpen(true)
                                    setToDo(toDo)
                                }}>
                                    <span className={styles.toDoTitle}>{toDo.title}</span>
                                    {
                                        toDo.deadline ? (
                                            <span className={styles.toDoDeadline}>
                                                {new Date(toDo.deadline).toLocaleDateString("pt-BR")}
                                            </span>
                                        ) : null
                                    }
                                    {
                                        toDo.categoryId ? (
                                            <span className={styles.toDoCategory}>
                                                <div 
                                                    className={styles.categoryColor}
                                                    style={{
                                                        backgroundColor: categoryList.find((category) => category.id! === toDo.categoryId!)?.color
                                                    }}
                                                />
                                                <p className={styles.categoryName}>
                                                    {categoryList.find((category) => category.id! === toDo.categoryId!)?.name}
                                                </p>
                                            </span>
                                        ) : null
                                    }
                                </div>
                            ))

                        }
                    <div className={styles.actionsContainer}>
                        <button 
                            className={styles.createCategory}
                            onClick={(e) => {
                                e.stopPropagation()
                                setModalType("Category")
                                setIsModalOpen(true)
                            }}
                        >
                            <img src={categoryIcon} className={styles.iconCategory} alt="Nova categoria" />
                        </button>
                        <button 
                            className={styles.createTask}
                            onClick={(e) => {
                                e.stopPropagation()
                                setModalType("ToDo")
                                setIsModalOpen(true)
                            }}
                        >
                            <img src={plus} className={styles.iconToDo} alt="Nova tarefa" />
                        </button>
                    </div>
                </section>
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
                                    isDone: false,
                                    title: '',
                                    userId: user.id!,
                                })
                                setCategory({
                                    name: '',
                                    color: '',
                                    userId: user.id!
                                })
                            }}>
                                <img src={close} className={styles.closeIcon} alt="fechar" />
                            </div>
                            {
                                modalType === 'ToDo' ? (
                                    <ToDoForm
                                        toDo={toDo}
                                        setToDo={setToDo}
                                        categories={categoryList}
                                        setIsModalOpen={setIsModalOpen}
                                        fetchToDoList={fetchToDoList}
                                    />
                                ) : (
                                    <CategoryForm
                                        category={category}
                                        setCategory={setCategory}
                                        fetchCategoryList={fetchCategoryList}
                                        setIsModalOpen={setIsModalOpen}
                                    />
                                )
                            }
                        </div>
                    </section>
                ) : null
            }
        </section>
    )
}

export default ToDoList