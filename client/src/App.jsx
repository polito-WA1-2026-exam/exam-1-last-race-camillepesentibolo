import 'bootstrap/dist/css/bootstrap.min.css';

import dayjs from 'dayjs';
import './App.css';

import { useContext, useState, useEffect, createContext } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';

import { LoginForm, Logout } from './components/LoginForm.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import WelcomePage from './components/WelcomePage.jsx'
import HomeView from './components/HomeView.jsx';
import GameLayout from './components/GameLayout.jsx';
import RankingView from './components/RankingView'; 

import UserContext from './contexts/UserContext.js';

import { User,Station,Line,Event,Game } from "./models/models.js";


function App() {

  const navigate = useNavigate()

  const [user, setUser] = useState({ id: undefined, name: undefined })

  const doLogin = (newUser) => {
    setUser({ id: newUser.id, name: newUser.name })
    navigate('/home')
  }

  const doLogout = () => {
    setUser({ id: undefined, name: undefined })
    navigate('/')
  }


  return (
    <UserContext.Provider value={user}>
      <Container>
        <Routes>
          <Route path='/' element={<MainLayout doLogin={doLogin} />}>
            
            <Route index element={<LoginView/>} />
            
            {/* Route if connected */}
            <Route path='home' element={
              user.id ? <HomeView user={user} /> : <Navigate to='/' />
            } />
            
            {/* Route if connected /ranking */}
            <Route path='ranking' element={   
              user.id ? <RankingView /> : <Navigate to='/' />
            } />

            {/* Route if connected /game (all phases) */}
            <Route path='game' element={user ? <GameLayout /> : <Navigate to='/' />} />

            <Route path='login' element={<LoginForm doLogin={doLogin} />} />
            <Route path='logout' element={<Logout doLogin={doLogin} />} />
            
            <Route path='error' element={<h1 className="text-center text-danger mt-5">Something is wrong</h1>} />
          </Route>
        </Routes>
      </Container>
    </UserContext.Provider>
  )
}


function MainLayout(props) {
  return <>
    <div className="app-container">
      <Header doLogin={props.doLogin}></Header>
      
      <Container className="main-content">
        <Outlet />
      </Container>
      
      <Footer></Footer>
    </div>
  </>
}

function LoginView(props) {
  const user = useContext(UserContext)
  
  if (user.id) {
    return <Navigate to='/home' />
  }
  return <WelcomePage/>
}


export default App
