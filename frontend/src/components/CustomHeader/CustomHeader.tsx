import styles from './CustomHeader.module.css'
import logo from '../../assets/asana-svgrepo-com.svg'
import { useUser, useRemoveUser } from '../../store'
import powerOff from '../../assets/power-off-svgrepo-com.svg'
import AuthService from '../../services/authService'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

const CustomHeader = () => {
  const user = useUser()
  const removeUser = useRemoveUser()
  const redirect = useNavigate()

  const handleLogout = async () => {
    try {
        await AuthService.logout()

        removeUser()
        sessionStorage.clear()
        redirect('/session')
    } catch (error) {
        if (error instanceof AxiosError) {
            toast.error(error.message)
        } else {
            console.error(error)
        }
    }
  }

  const profilePicture = sessionStorage.getItem("profile_picture")?.replace(/^"|"$/g, "")

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <img src={logo} className={styles.logo} />
        Task Manager
      </div>
      {
        user.id && user.username && (
          <div className={styles.userContainer}>
            <span className={styles.username}>{user.username}</span>

            <div className={styles.profileContainer}>
              <div className={styles.flipCard} onClick={handleLogout}>
                {/* Frente */}
                <div className={styles.front}>
                  {profilePicture ? (
                    <img src={profilePicture} alt="Foto do usuário" />
                  ) : (
                    <div>{user.username[0].toUpperCase()}</div>
                  )}
                </div>

                {/* Verso */}
                <div className={styles.back}>
                  <img src={powerOff} className={styles.logout} onClick={() => handleLogout()}/>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </header>
  )
}

export default CustomHeader
