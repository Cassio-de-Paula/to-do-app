import { Outlet, useNavigate } from "react-router-dom"
import { useSetUser, useUser } from "../../store"
import UserService from "../../services/userService"
import { AxiosError } from "axios"
import { toast, ToastContainer } from "react-toastify"
import { useEffect, useState } from "react"
import CustomHeader from "../../components/CustomHeader/CustomHeader"
import Base from "../../components/Base/Base"
import Loading from "../../components/Loading/Loading"


const BaseUser = () => {
    const user = useUser()
    const setUser = useSetUser()
    const redirect = useNavigate()
    const [authenticated, setAuthenticated] = useState<boolean | undefined>(user.id && user.username ? true : undefined)

    const fetchUser = async () => {
        try {
            const res = await UserService.get()

            setAuthenticated(true)
            setUser(res.data)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message)
                setAuthenticated(false)
                redirect('/session')
            } else {
                console.error(error)
            }
        }
    }

    useEffect(() => {
        if (authenticated === undefined) fetchUser()
    }, [])

    useEffect(() => {
        console.log(authenticated)
    }, [authenticated])

    if (authenticated === undefined) return (
        <>
            <CustomHeader/>
                <Base>
                    <Loading color="white"/>
                </Base>
        </>
    )
    
    if (authenticated) {

        return (
            <>
                <CustomHeader/>
                <Base>
                    <ToastContainer 
                        position="bottom-right" 
                        autoClose={3000} 
                        newestOnTop 
                        closeOnClick 
                        pauseOnHover
                    />
                    <Outlet/>
                </Base>
            </>
        )
    }    
}

export default BaseUser