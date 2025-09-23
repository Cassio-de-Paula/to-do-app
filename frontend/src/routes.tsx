import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login/Login";
import BaseUser from "./pages/User/BaseUser";
import ToDoList from "./pages/User/ToDoList/ToDoList";

const routes = createBrowserRouter([
    {
        path: '/session',
        element: <Login/>
    },
    {
        path: '/session/user/',
        element: <BaseUser/>,
        children: [
            {
                path: 'tasks',
                element: <ToDoList/>
            },
            {
                path: 'tasks/create/',
            }
        ]
    }
])


export default routes