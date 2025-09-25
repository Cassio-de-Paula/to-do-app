import { useGoogleLogin } from '@react-oauth/google';
import styles from './GoogleButton.module.css'
import google from '../../assets/google-color-svgrepo-com.svg'

interface CustomGoogleButtonProps {
    onSuccess: (credentialResponse: any) => void
    onError?: () => void
}

export default function CustomGoogleButton({ onSuccess, onError }: CustomGoogleButtonProps) {
  const login = useGoogleLogin({
    onSuccess,
    onError,
    flow: 'implicit',
    scope: 'openid email profile',
  })

  return (
    <button
      onClick={() => login()}
      className={styles.googleButton}
    >
      <img src={google} alt="Google" className={styles.logo} />
    </button>
  );
}
