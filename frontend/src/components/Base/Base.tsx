import styles from './Base.module.css'

interface BaseProps {
    children: React.ReactNode
}

const Base = ({ children }: BaseProps) => {

    return (
        <main className={styles.main}>
            {children}
        </main>
    )
}

export default Base