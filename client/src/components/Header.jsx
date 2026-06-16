import { useContext } from "react"
import { Button, Container, Navbar } from "react-bootstrap"
import { Link, Links, useNavigate } from 'react-router'
import 'bootstrap-icons/font/bootstrap-icons.css';

import logoRace from '../assets/underground.png';
import UserContext from "../contexts/UserContext"

function Header(props) {

  const user = useContext(UserContext)

  const destination = user.id ? '/home' : '/'

  return (
    <Navbar style={{ backgroundColor: 'rgb(146, 148, 246)' }} >
      <Container fluid>
      {/* On utilise un Flexbox inline pour aligner le titre et le bouton sur la même ligne */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

        <img 
          src={logoRace} 
          alt="Logo Last Race" 
          style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />

        <h1 style={{ color: 'white', margin: 0, fontSize: '4rem',fontFamily: '"Impact", "Arial Black", sans-serif' }}>Last Race</h1>
        
        {/* Le petit bouton Home juste à côté */}
        <Button 
          type="button" 
          className="btn" 
          as={Link} 
          to={destination}
          style={{ 
            backgroundColor: '#4048d4', /* Ta couleur de fond personnalisée */
            borderColor: '#4048d4',
            color: 'White'              /* La couleur de l'icône à l'intérieur */
          }}>
          <i className="bi bi-house-door-fill"></i>
        </Button>

      </div>

      <div>{user.name ? <UserInfo name={user.name}/> : <LoginButton/>}</div>
    </Container>
  </Navbar>)
}

function LoginButton(props) {
  const navigate = useNavigate()

  return <Button style={{ 
            backgroundColor: '#4048d4', /* Ta couleur de fond personnalisée */
            borderColor: '#4048d4',
            color: 'White'              /* La couleur de l'icône à l'intérieur */
          }} onClick={() => navigate('/login')}>Log In</Button>
}

function UserInfo(props) {
  return <div>
    <div style={{ color: 'white', fontSize: '1.5rem' }}>{props.name}</div>
    <div><Button 
          type="button" 
          className="btn" 
          as={Link} 
          to='/logout'
          style={{ 
            backgroundColor: '#4048d4', /* Ta couleur de fond personnalisée */
            borderColor: '#4048d4',
            color: 'White'              /* La couleur de l'icône à l'intérieur */
          }}>
          Logout
        </Button>
      
      </div>
  </div>
}

export default Header