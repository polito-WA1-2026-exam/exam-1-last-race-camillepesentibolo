

import 'bootstrap/dist/css/bootstrap.min.css';

import dayjs from 'dayjs';

//import reactLogo from './assets/react.svg'
//import viteLogo from './assets/vite.svg'
//import heroImg from './assets/hero.png'
//import './App.css'

import { useContext, useState, useEffect, createContext } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';


import { LoginForm, Logout } from './components/LoginForm.jsx'; // 1. Import de votre formulaire
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import WelcomePage from './components/WelcomePage.jsx'
import HomeView from './components/HomeView.jsx';
import GameLayout from './components/GameLayout.jsx';
import RankingView from './components/RankingView'; // Ta future page de classement
//import GameLayout from './components/GameLayout';       // Ton composant qui gère le jeu (Setup, Planning...)

import UserContext from './contexts/UserContext.js';

import { User,Station,Line,Event,Game } from "./models/file.js";


function App() {

  const navigate = useNavigate()

  // Currently logged-in user
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
          {/* 3. Route parente avec la mise en page principale */}
          <Route path='/' element={<MainLayout doLogin={doLogin} />}>
            
            {/* Si connecté -> /home, sinon affiche le contenu anonyme */}
            <Route index element={<LoginView/>} />
            
            {/* Route privée /home (accessible uniquement si connecté) */}
            <Route path='home' element={
              user.id ? <HomeView user={user} /> : <Navigate to='/' />
            } />
            
            {/* Route privée /ranking (Classement général) */}
            <Route path='ranking' element={
              user.id ? <RankingView /> : <Navigate to='/' />
            } />

            {/* Route privée /game (Déroulement du jeu : de la Phase 1 à 4) */}
            <Route path='game' element={user ? <GameLayout /> : <Navigate to='/' />} />

            
            {/* Routes pour l'authentification */}
            <Route path='login' element={<LoginForm doLogin={doLogin} />} />
            <Route path='logout' element={<Logout doLogin={doLogin} />} /> {/* Ajusté selon votre logique de logout */}
            
            {/* Page d'erreur globale */}
            <Route path='error' element={<h1 className="text-center text-danger mt-5">Something is wrong</h1>} />
          </Route>
        </Routes>
      </Container>
    </UserContext.Provider>
  )
}


// 4. Composant de mise en page globale (Layout)
function MainLayout(props) {
  return <>
    <Header doLogin={props.doLogin}></Header>
    <Outlet />
    <Footer></Footer>
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
