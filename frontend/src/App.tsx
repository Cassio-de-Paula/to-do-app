import { GoogleOAuthProvider } from '@react-oauth/google'
import { RouterProvider } from 'react-router-dom'
import routes from './routes'
import { Provider } from 'react-redux'
import { store } from './store'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

if (!CLIENT_ID) {
  throw new Error("Client Id não encontrado!")
}

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Provider store={store}>
        <RouterProvider router={routes}/>
      </Provider>
    </GoogleOAuthProvider>
  )
}

export default App
