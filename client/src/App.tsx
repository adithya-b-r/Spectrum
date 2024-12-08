import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createContext, useState, Dispatch, SetStateAction } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home/Home';
import { Favorites } from './pages/Favorites/Favorites';
import { Profile } from './pages/Profile/Profile';
import { CreatePost } from './pages/Write/CreatePost';
import { ToastNotification } from './components/Toast/ToastNotification'
import { Provider } from 'react-redux';
import store from './store/store';
import { SignInForm } from './components/AuthForms/SignInForm';
import { LoginForm } from './components/AuthForms/LoginForm';

interface AppContextType {
  theme: string;
  setTheme: Dispatch<SetStateAction<string>>;
  notificationPage: number;
  setNotificationPage: Dispatch<SetStateAction<number>>;
}

export const AppContext = createContext<AppContextType>({
  theme: "Light",
  setTheme: () => { },
  notificationPage: -1,
  setNotificationPage: () => { },
});

function App() {
  const [theme, setTheme] = useState("Light");
  const [notificationPage, setNotificationPage] = useState(0);

  return (
    <AppContext.Provider value={{ theme, setTheme, notificationPage, setNotificationPage }}>
      <Provider store={store}>
        <BrowserRouter>
          <ToastNotification />
          <Navbar />
          <SignInForm/>
          <LoginForm/>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/*" element={<h3 className='text-3xl w-full my-10 font-bold text-center'>🛠️Under Construction🛠️</h3>} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </AppContext.Provider>
  );
}

export default App;
