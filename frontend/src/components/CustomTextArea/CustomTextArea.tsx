import styles from './CustomTextArea.module.css'

interface CustomTextAreaProps {
    value: string
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>
    placeHolder?: string
}

const CustomTextArea = ({ value, onChange, placeHolder }: CustomTextAreaProps) => {

    return (
        <textarea 
            value={value}
            onChange={onChange}
            placeholder={placeHolder}
            className={styles.textarea} 
        />
    )
}

export default CustomTextArea