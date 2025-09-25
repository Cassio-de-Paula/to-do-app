import styles from './Logo.module.css'
import logo from '../../assets/gui-reminder-svgrepo-com.svg'

const Logo = () => {

    return (
        <div className={styles.logoContainer}>
            <div className={styles.absoluteContainer}>
                <img className={styles.logo} src={logo}/>
                <div className={styles.titleContainer}>
                    <h2 className={styles.task}>
                        ask
                    </h2>
                    <h2 className={styles.manager}>
                        Manager
                    </h2>
                </div>
            </div>
        </div>
    )
}

export default Logo