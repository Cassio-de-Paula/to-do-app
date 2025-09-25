import CustomHeader from '../../components/CustomHeader/CustomHeader'
import styles from './Login.module.css'
import AuthService from '../../services/authService'
import { useSetUser } from '../../store'
import { AxiosError } from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import CustomGoogleButton from '../../components/GoogleButton/GoogleButton'
import Logo from '../../components/Logo/Logo'


const Login = () => {
    const setUser = useSetUser()
    const redirect = useNavigate()

    const handleSuccess = async (response: any) => {
        try {
            const res = await AuthService.login(response.access_token!)

            sessionStorage.setItem("profile_picture", res.data.profile_picture)
            setUser(res.data)
            redirect('/session/user/tasks/')
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message)
            } else {
                console.error(error)
            }
        }
    }

    const handleFailure = async () => {
        toast.error("Não foi possível autenticar")
    }

    return (
        <>
            <CustomHeader/>
            <main className={styles.main}>
                <ToastContainer 
                    position="bottom-right" 
                    autoClose={3000} 
                    newestOnTop 
                    closeOnClick 
                    pauseOnHover
                />
                <section className={styles.section}>
                    <div className={styles.div}>
                        <Logo/>
                    </div>
                    <div className={styles.buttonContainer}>
                        <hr className={styles.hr}/>
                        <CustomGoogleButton onSuccess={handleSuccess} onError={handleFailure}/>
                        <hr className={styles.hr}/>
                    </div>
                    <span className={styles.span}>
                        Entre com sua conta do Google
                    </span>
                </section>
            </main>
        </>
    )
}

export default Login