import styles from './CustomInput.module.css'

interface CustomInputProps {
    type: 'text' | 'date'
    value: string
    onChange: React.ChangeEventHandler<HTMLInputElement>
    onBlur?: () => void
    error?: string | null
    fontSize?: string
    placeHolder?: string
    align?: string
}

const CustomInput = ({ type, value, onChange, onBlur, error, fontSize, placeHolder, align }: CustomInputProps) => {

    return (
        <> 
            <input 
                type={type}  
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={error ? styles.inputError : styles.input}
                placeholder={placeHolder}
                style={{ "--font-size": fontSize, "text-align": align } as React.CSSProperties}
            />
            {
                error ? (
                    <p className={styles.errorMessage}>{error}</p>
                ) : null
            }
        </>
    )
}

export default CustomInput