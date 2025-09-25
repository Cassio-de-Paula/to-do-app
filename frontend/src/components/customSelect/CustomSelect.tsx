import { useEffect, useState } from 'react'
import styles from './CustomSelect.module.css'
import arrowDown from '../../assets/chevron-down-svgrepo-com.svg'

// Interface do select aceita OptionProps<Key> OU ValueOption
interface CustomSelectProps {
  options: Record<string, any>[]
  onSelect: (option: Record<string, any>) => void
  renderKey: string
  selected: Record<string, any>
}

const CustomSelect = ({options, onSelect, selected, renderKey}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [disabled, setDisabled] = useState<boolean>(options.length > 0 ? false : true)

  useEffect(() => {
    setDisabled(options.length === 0)
    console.log(options)
  }, [options])

  return (
    <div 
      className={styles.selectContainer} 
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) {
          setIsOpen((prev) => !prev)
        }
      }}
    >
      <span className={!disabled ? styles.span : styles.disabledSpan}>
        <p className={!disabled ? styles.p : styles.disabledP}>
            {
              !disabled ? (
                selected?.[renderKey] ?? "Selecione uma opção"
              ) : (
                "Nenhuma opção disponível"
              )
            }
        </p>
        <img
          className={`${!disabled ? styles.icon : styles.disabledIcon} ${isOpen ? styles.iconUp : styles.iconDown}`}
          src={arrowDown}
          alt=""
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled) {
              setIsOpen((prev) => !prev)
            }
          }}
        />
      </span>

      {isOpen && (
        <ul className={styles.options}>
          {!disabled
            ? options.map((option) => (
                <li
                  key={'id' in option ? option.id : option.value} 
                  className={styles.option}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(option)
                    setIsOpen(false)
                  }}
                >
                    {
                        'id' in option
                        ? renderKey in option
                        ? option[renderKey]
                        : ''
                        : option.title
                    }
                </li>
              ))
            : null}
        </ul>
      )}
    </div>
  )
}

export default CustomSelect
