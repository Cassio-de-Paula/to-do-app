import CustomHeader from '../../components/CustomHeader/CustomHeader'
import styles from './Login.module.css'
import logo from '../../assets/asana-svgrepo-com.svg'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import AuthService from '../../services/authService'
import { useSetUser } from '../../store'
import { AxiosError } from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import { useNavigate } from 'react-router-dom'


const Login = () => {
    const setUser = useSetUser()
    const redirect = useNavigate()

    const handleSuccess = async (response: CredentialResponse) => {
        try {
            const res = await AuthService.login(response.credential!)
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
                        <img src={logo} className={styles.logo}/>
                        <h2 className={styles.h2}>
                            Bem vindo ao Task Manager!
                        </h2>
                    </div>
                    <div className={styles.buttonContainer}>
                        <GoogleLogin onSuccess={handleSuccess} onError={handleFailure}/>
                    </div>
                </section>
            </main>
        </>
    )
}

export default Login